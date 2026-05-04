import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Clock, Lock, Users, Zap, Shield, Key, Bell, ArrowRight } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: checkInData } = trpc.checkIn.getLastCheckIn.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: assets } = trpc.asset.getAssets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: gapAnalysis } = trpc.aiExecutor.getGapAnalysis.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: executors } = trpc.executor.getExecutors.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Header */}
        <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Lock className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Digital Legacy Vault</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate("/privacy")}>
                Privacy
              </Button>
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate("/terms")}>
                Terms
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm mb-8">
              <Shield className="w-4 h-4" />
              <span>Military-Grade Encryption &bull; Zero-Knowledge Architecture</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Protect Your Digital Legacy<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Before It&apos;s Too Late
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
            Securely store crypto wallets, passwords, and digital assets. Your family will get access only when they need it&mdash;with proof of death.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <GoogleLoginButton className="px-8 py-6 text-lg" />
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg border-slate-700 hover:bg-slate-800 text-white"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <p className="text-sm text-slate-400">
            Free to try &bull; No credit card required &bull; 30-day money-back guarantee
          </p>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">256-bit</div>
              <div className="text-slate-400">AES Encryption</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">30-day</div>
              <div className="text-slate-400">Dead Man&apos;s Switch</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-slate-400">Automated Monitoring</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-slate-900/50 rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Protect Your Digital Legacy</h2>
            <p className="text-xl text-slate-400">Bank-level security meets simple estate planning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lock, color: "blue", title: "End-to-End Encryption", desc: "Your crypto keys, passwords, and sensitive data are encrypted with AES-256-GCM. Even we can't access your information.", items: ["Zero-knowledge architecture", "Client-side encryption", "Military-grade security"] },
              { icon: Clock, color: "purple", title: "Dead Man's Switch", desc: "Check in every 30 days to confirm you're okay. If you miss 2 check-ins, your executors are automatically notified.", items: ["Automated email reminders", "Multi-stage notifications", "Grace period protection"] },
              { icon: Users, color: "cyan", title: "Executor Management", desc: "Designate trusted family members or lawyers as executors. They get access only after verifying a death certificate.", items: ["Death certificate verification", "Multi-executor support", "Audit trail logging"] },
              { icon: Key, color: "yellow", title: "Secure Asset Storage", desc: "Store crypto wallet seeds, exchange passwords, social media logins, domain registrations, and more.", items: ["Cryptocurrency wallets", "Social media accounts", "Business credentials"] },
              { icon: Bell, color: "orange", title: "Smart Notifications", desc: "Get timely reminders before check-ins are due. Executors receive staged notifications to ensure smooth transitions.", items: ["Email & SMS alerts", "Customizable schedules", "Emergency overrides"] },
              { icon: Zap, color: "emerald", title: "AI Estate Planning", desc: "Our AI analyzes your assets and identifies gaps in your digital estate plan, providing personalized recommendations.", items: ["Gap analysis", "Coverage scoring", "Smart suggestions"] },
            ].map(({ icon: Icon, color, title, desc, items }) => (
              <div key={title} className={`bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-${color}-500/50 transition-all`}>
                <div className={`w-14 h-14 bg-${color}-500/10 rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 text-${color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400 mb-4">{desc}</p>
                <ul className="space-y-2 text-sm text-slate-400">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Three simple steps to secure your digital legacy</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: "1", color: "blue", title: "Store Your Assets", desc: "Securely add your crypto wallets, passwords, social accounts, and other digital assets. Everything is encrypted end-to-end." },
              { n: "2", color: "purple", title: "Designate Executors", desc: "Choose trusted family members or lawyers to manage your assets. They'll only get access after proper verification." },
              { n: "3", color: "cyan", title: "Check In Regularly", desc: "Confirm you're okay every 30 days. If you miss check-ins, your executors are automatically notified to begin the process." },
            ].map(({ n, color, title, desc }) => (
              <div key={n} className="text-center">
                <div className={`w-16 h-16 bg-${color}-500/10 border-2 border-${color}-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-${color}-400`}>
                  {n}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Don&apos;t Leave Your Family Guessing</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Secure your digital assets today. Your family will thank you tomorrow.
            </p>
            <GoogleLoginButton className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-6 text-lg" />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-bold text-white">Digital Legacy Vault</span>
                </div>
                <p className="text-slate-400 mb-4">Secure digital asset management for your digital estate.</p>
                <p className="text-sm text-slate-500">&copy; 2026 Digital Legacy Vault. All rights reserved.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => navigate("/privacy")} className="text-slate-400 hover:text-white transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => navigate("/terms")} className="text-slate-400 hover:text-white transition-colors">Terms of Service</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <p className="text-slate-400">support@digitallegacyvault.com</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "User"}</h1>
          <p className="text-muted-foreground">Manage your digital estate and assets</p>
        </div>

        {checkInData && checkInData.daysAgo !== null && checkInData.daysAgo > 25 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your last check-in was {checkInData.daysAgo} days ago. Please check in soon to confirm you're okay.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assets Stored</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assets?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Digital assets</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Executors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{executors?.filter(e => e.status === "accepted").length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Designated executors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{gapAnalysis?.coverage || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Estate coverage</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Check-in</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{checkInData?.daysAgo ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Days ago</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Dead Man's Switch</CardTitle>
              <CardDescription>Confirm you're okay every 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Check in regularly to keep your estate plan active.</p>
              <Button onClick={() => navigate("/check-in")} className="w-full">Check In Now</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Digital Assets</CardTitle>
              <CardDescription>Manage your encrypted assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Store and organize your crypto keys, passwords, social media accounts, and other digital assets securely.</p>
              <Button onClick={() => navigate("/assets")} className="w-full">Manage Assets</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Executors</CardTitle>
              <CardDescription>Designate trusted executors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose who will manage your digital assets after your death. They'll need to verify with a death certificate.</p>
              <Button onClick={() => navigate("/executors")} className="w-full">Manage Executors</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" />AI Digital Executor</CardTitle>
              <CardDescription>Get personalized estate planning advice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Our AI analyzes your assets and provides recommendations for gaps in your digital estate plan.</p>
              <Button onClick={() => navigate("/ai-guidance")} className="w-full">Get Guidance</Button>
            </CardContent>
          </Card>
        </div>

        {gapAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Estate Planning Recommendations</CardTitle>
              <CardDescription>AI-powered gap analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gapAnalysis.missingCategories.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Missing asset categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {gapAnalysis.missingCategories.map((cat) => (
                      <span key={cat} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {cat.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{gapAnalysis.recommendations}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
