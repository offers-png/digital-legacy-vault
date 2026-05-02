import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { useEffect, useState } from "react";

interface GoogleLoginButtonProps {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Google OAuth Login Button
 * Initiates Google OAuth flow for authentication
 */
export function GoogleLoginButton({
  onSuccess,
  onError,
  className,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);

    // For now, redirect to Google OAuth endpoint
    // In production, use Google Sign-In SDK for better UX
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/oauth/google/callback`;
    const scope = "openid email profile";
    const responseType = "code";

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
      scope,
      access_type: "offline",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      variant="outline"
      className={className}
      size="lg"
    >
      <Chrome className="mr-2 h-4 w-4" />
      {isLoading ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}
