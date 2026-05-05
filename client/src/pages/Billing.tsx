import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, AlertCircle, Download, Crown, Zap, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function Billing() {
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: subscription, isLoading, refetch } = trpc.payment.getSubscriptionStatus.useQuery();
  const { data: paymentHistory } = trpc.payment.getPaymentHistory.useQuery();

  const createSubscription = trpc.payment.createSubscription.useMutation({
    onSuccess: (data) => { if (data.url) window.location.href = data.url; },
    onError: (error) => { toast.error(error.message); setIsProcessing(false); },
  });

  const createOneTimePayment = trpc.payment.createOneTimePayment.useMutation({
    onSuccess: (data) => { if (data.url) window.location.href = data.url; },
    onError: (error) => { toast.error(error.message); setIsProcessing(false); },
  });

  const cancelSubscription = trpc.payment.cancelSubscription.useMutation({
    onSuccess: () => { toast.success("Subscription will cancel at end of billing period"); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const reactivateSubscription = trpc.payment.reactivateSubscription.useMutation({
    onSuccess: () => { toast.success("Subscription reactivated"); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const createPortal = trpc.payment.createPortalSession.useMutation({
    onSuccess: (data) => { window.location.href = data.url; },
    onError: (error) => toast.error(error.message),
  });

  const handleSubscribe = (plan: "basic" | "premium", priceId: string) => {
    setIsProcessing(true);
    createSubscription.mutate({ plan, priceId });
  };

  const handleOneTimePayment = (priceId: string) => {
    setIsProcessing(true);
    createOneTimePayment.mutate({ plan: "lifetime", priceId });
  };

  const handleCancelSubscription = () => {
    if (confirm("Cancel your subscription? You'll keep access until the billing period ends.")) {
      cancelSubscription.mutate();
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing &amp; Subscription</h1>
          <p className="text-slate-500 mt-1">Manage your plan and payment methods.</p>
        </div>

        {/* Current subscription */}
        {subscription?.hasSubscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Plan
                <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                  {subscription.status}
                </Badge>
              </CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold capitalize">{subscription.plan} Plan</p>
                  <p className="text-slate-500">
                    ${((subscription.amount ?? 0) / 100).toFixed(2)} {subscription.currency?.toUpperCase()} / month
                  </p>
                </div>
                <Crown className="w-10 h-10 text-yellow-500" />
              </div>
              {subscription.currentPeriodEnd && (
                <p className="text-sm text-slate-500 border-t pt-3">
                  {subscription.cancelAtPeriodEnd
                    ? `Access ends ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : `Next billing date: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              )}
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" onClick={() => createPortal.mutate()} disabled={createPortal.isPending}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Payment Methods
                </Button>
                {subscription.cancelAtPeriodEnd ? (
                  <Button onClick={() => reactivateSubscription.mutate()} disabled={reactivateSubscription.isPending}>
                    Reactivate Subscription
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={handleCancelSubscription} disabled={cancelSubscription.isPending}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing plans */}
        {!subscription?.hasSubscription && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Choose Your Plan</h2>
              <p className="text-slate-500 text-sm">Protect your digital legacy with our secure platform</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Basic */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" /> Basic
                  </CardTitle>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {["Up to 25 digital assets", "2 executors", "Dead Man's Switch", "AES-256 encryption", "Email support"].map(f => (
                      <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={() => handleSubscribe("basic", process.env.VITE_STRIPE_PRICE_BASIC ?? "price_basic_monthly")} disabled={isProcessing}>
                    {isProcessing ? "Processing…" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border-blue-500 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" /> Premium
                  </CardTitle>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">$19.99</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {["Unlimited digital assets", "Unlimited executors", "Dead Man's Switch", "AES-256 encryption", "AI estate planning", "Priority support"].map(f => (
                      <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={() => handleSubscribe("premium", process.env.VITE_STRIPE_PRICE_PREMIUM ?? "price_premium_monthly")} disabled={isProcessing}>
                    {isProcessing ? "Processing…" : "Upgrade to Premium"}
                  </Button>
                </CardContent>
              </Card>

              {/* Lifetime */}
              <Card className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary">Best Value</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" /> Lifetime
                  </CardTitle>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">$199</span>
                    <span className="text-slate-500"> one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {["Everything in Premium", "Lifetime access", "No monthly fees", "All future features", "30-day refund guarantee"].map(f => (
                      <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => handleOneTimePayment(process.env.VITE_STRIPE_PRICE_LIFETIME ?? "price_lifetime_onetime")} disabled={isProcessing}>
                    {isProcessing ? "Processing…" : "Get Lifetime Access"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>30-Day Money-Back Guarantee:</strong> Not satisfied? Get a full refund within 30 days — no questions asked.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Payment history */}
        {paymentHistory && paymentHistory.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}</p>
                      <p className="text-sm text-slate-500">{new Date(payment.created).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={payment.status === "succeeded" ? "default" : "secondary"}>{payment.status}</Badge>
                      {payment.refunded && <Badge variant="destructive">Refunded</Badge>}
                      {payment.receiptUrl && (
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
