import { eq } from "drizzle-orm";
import { z } from "zod";
import Stripe from "stripe";
import { users } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const APP_URL = process.env.OAUTH_SERVER_URL ?? "https://digital-legacy-vault.onrender.com";

if (!STRIPE_SECRET_KEY) {
  console.warn("[Stripe] STRIPE_SECRET_KEY not configured");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia" as Parameters<typeof Stripe>[1]["apiVersion"],
});

async function getOrCreateCustomer(userId: number, userEmail: string | null, existingCustomerId: string | null | undefined): Promise<string> {
  if (existingCustomerId) return existingCustomerId;

  const customer = await stripe.customers.create({
    email: userEmail ?? undefined,
    metadata: { userId: String(userId) },
  });

  const db = await getDb();
  if (db) {
    await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));
  }

  return customer.id;
}

export const paymentRouter = router({
  createSubscription: protectedProcedure
    .input(z.object({ priceId: z.string(), plan: z.enum(["basic", "premium", "lifetime"]) }))
    .mutation(async ({ ctx, input }) => {
      const customerId = await getOrCreateCustomer(ctx.user.id, ctx.user.email ?? null, ctx.user.stripeCustomerId);

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: input.priceId, quantity: 1 }],
        success_url: `${APP_URL}/billing?success=1`,
        cancel_url: `${APP_URL}/billing?canceled=1`,
        metadata: { userId: String(ctx.user.id), plan: input.plan },
        subscription_data: { metadata: { userId: String(ctx.user.id), plan: input.plan } },
        allow_promotion_codes: true,
      });

      return { sessionId: session.id, url: session.url };
    }),

  createOneTimePayment: protectedProcedure
    .input(z.object({ priceId: z.string(), plan: z.enum(["lifetime"]) }))
    .mutation(async ({ ctx, input }) => {
      const customerId = await getOrCreateCustomer(ctx.user.id, ctx.user.email ?? null, ctx.user.stripeCustomerId);

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{ price: input.priceId, quantity: 1 }],
        success_url: `${APP_URL}/billing?success=1`,
        cancel_url: `${APP_URL}/billing?canceled=1`,
        metadata: { userId: String(ctx.user.id), plan: input.plan, type: "one_time" },
        allow_promotion_codes: true,
      });

      return { sessionId: session.id, url: session.url };
    }),

  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const customerId = ctx.user.stripeCustomerId;
    if (!customerId) {
      return { hasSubscription: false, plan: null, status: null, currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }

    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
    const active = subscriptions.data.find(s => s.status === "active" || s.status === "trialing");

    if (!active) {
      return { hasSubscription: false, plan: null, status: null, currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }

    return {
      hasSubscription: true,
      subscriptionId: active.id,
      plan: active.metadata.plan || "basic",
      status: active.status,
      currentPeriodEnd: new Date(active.current_period_end * 1000),
      cancelAtPeriodEnd: active.cancel_at_period_end,
      amount: active.items.data[0]?.price.unit_amount ?? 0,
      currency: active.items.data[0]?.price.currency ?? "usd",
    };
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const customerId = ctx.user.stripeCustomerId;
    if (!customerId) throw new Error("No active subscription found");

    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    const active = subscriptions.data[0];
    if (!active) throw new Error("No active subscription to cancel");

    const updated = await stripe.subscriptions.update(active.id, { cancel_at_period_end: true });
    return { success: true, cancelAt: new Date(updated.current_period_end * 1000) };
  }),

  reactivateSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const customerId = ctx.user.stripeCustomerId;
    if (!customerId) throw new Error("No subscription found");

    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    const sub = subscriptions.data[0];
    if (!sub?.cancel_at_period_end) throw new Error("No subscription scheduled for cancellation");

    await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false });
    return { success: true };
  }),

  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const customerId = ctx.user.stripeCustomerId;
    if (!customerId) return { payments: [] };

    const charges = await stripe.charges.list({ customer: customerId, limit: 20 });
    return {
      payments: charges.data.map(c => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        created: new Date(c.created * 1000),
        refunded: c.refunded,
        receiptUrl: c.receipt_url,
      })),
    };
  }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const customerId = ctx.user.stripeCustomerId;
    if (!customerId) throw new Error("No Stripe customer found");

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/billing`,
    });
    return { url: session.url };
  }),
});

export async function handleStripeWebhook(rawBody: string, signature: string): Promise<void> {
  if (!STRIPE_WEBHOOK_SECRET) throw new Error("Webhook secret not configured");

  const event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  console.log(`[Stripe Webhook] ${event.type}`);

  const db = await getDb();
  if (!db) {
    console.warn("[Stripe Webhook] Database not available, skipping update");
    return;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ? Number(session.metadata.userId) : null;
      if (userId && session.subscription) {
        await db.update(users).set({
          stripeSubscriptionId: session.subscription as string,
          subscriptionStatus: "active",
          subscriptionPlan: session.metadata?.plan ?? "basic",
        }).where(eq(users.id, userId));
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, sub.customer as string)).limit(1);
      if (user) {
        await db.update(users).set({
          subscriptionStatus: sub.status,
          subscriptionPlan: sub.metadata?.plan ?? "basic",
        }).where(eq(users.id, user.id));
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, sub.customer as string)).limit(1);
      if (user) {
        await db.update(users).set({
          stripeSubscriptionId: null,
          subscriptionStatus: "canceled",
          subscriptionPlan: null,
        }).where(eq(users.id, user.id));
      }
      break;
    }
  }
}
