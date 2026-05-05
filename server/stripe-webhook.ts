import express, { Request, Response } from "express";
import { handleStripeWebhook } from "./payment.router";

export function setupStripeWebhook(app: express.Application) {
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).send("Missing stripe-signature header");
      }
      try {
        await handleStripeWebhook(req.body.toString("utf8"), signature as string);
        res.status(200).json({ received: true });
      } catch (error) {
        console.error("[Stripe Webhook] Error:", error);
        res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  );
  console.log("[Stripe] Webhook endpoint registered at /api/webhooks/stripe");
}
