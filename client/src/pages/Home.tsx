import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Clock, Lock, Users, FileText, Zap } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Fetch check-in status
  const { data: checkInData } = trpc.checkIn.getLastCheckIn.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch assets
  const { data: assets } = trpc.asset.getAssets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch gap analysis
  const { data: gapAnalysis } = trpc.aiExecutor.getGapAnalysis.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch executors
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto text-blue-400 mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Digital Legacy Vault</h1>
            <p className="text-slate-300">Secure digital asset management for your digital estate</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Secure Encryption</p>
                <p className="text-sm text-slate-400">End-to-end encryption for all sensitive data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <Users className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Executor Management</p>
                <p className="text-sm text-slate-400">Designate trusted executors for asset transfer</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <Zap className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Dead Man's Switch</p>
                <p className="text-sm text-slate-400">30-day check-in system with notifications</p>
              </div>
            </div>
          </div>

          <GoogleLoginButton className="w-full" />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "User"}</h1>
          <p className="text-muted-foreground">Manage your digital estate and assets</p>
        </div>

        {/* Check-in Status Alert */}
        {checkInData && checkInData.daysAgo !== null && checkInData.daysAgo > 25 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your last check-in was {checkInData.daysAgo} days ago. Please check in soon to confirm you're okay.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
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
              <div className="text-3xl font-bold">{checkInData?.daysAgo || "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Days ago</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-in Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Dead Man's Switch
              </CardTitle>
              <CardDescription>Confirm you're okay every 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your check-in status helps us know when to notify your executors. Check in regularly to keep your estate plan active.
              </p>
              <Button
                onClick={() => navigate("/check-in")}
                className="w-full"
              >
                Check In Now
              </Button>
            </CardContent>
          </Card>

          {/* Assets Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Digital Assets
              </CardTitle>
              <CardDescription>Manage your encrypted assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Store and organize your crypto keys, passwords, social media accounts, and other digital assets securely.
              </p>
              <Button
                onClick={() => navigate("/assets")}
                className="w-full"
              >
                Manage Assets
              </Button>
            </CardContent>
          </Card>

          {/* Executors Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Executors
              </CardTitle>
              <CardDescription>Designate trusted executors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose who will manage your digital assets after your death. They'll need to verify with a death certificate.
              </p>
              <Button
                onClick={() => navigate("/executors")}
                className="w-full"
              >
                Manage Executors
              </Button>
            </CardContent>
          </Card>

          {/* AI Guidance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Digital Executor
              </CardTitle>
              <CardDescription>Get personalized estate planning advice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your assets and provides recommendations for gaps in your digital estate plan.
              </p>
              <Button
                onClick={() => navigate("/ai-guidance")}
                className="w-full"
              >
                Get Guidance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Gap Analysis */}
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
