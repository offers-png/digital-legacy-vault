import { useEffect, useState } from "react";
import { useLocation, useRouter } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Google OAuth Callback Handler
 * Processes the authorization code from Google and exchanges it for a session
 */
export default function GoogleCallback() {
  const [location] = useLocation();
  const [, navigate] = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
          setError("No authorization code received from Google");
          setIsProcessing(false);
          return;
        }

        // Exchange code for session token
        const response = await fetch("/api/auth/google/exchange", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to authenticate");
        }

        // Redirect to dashboard
        navigate("/");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        setError(message);
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Signing you in...</CardTitle>
            <CardDescription>Please wait while we authenticate your account</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Authentication Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <a
              href="/"
              className="text-primary hover:underline text-sm font-medium"
            >
              Return to login
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
