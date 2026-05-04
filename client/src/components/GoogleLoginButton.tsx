import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { useState } from "react";

interface GoogleLoginButtonProps {
  className?: string;
}

export function GoogleLoginButton({ className }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data } = trpc.googleAuth.getLoginUrl.useQuery({ returnPath: "/" });

  const handleGoogleLogin = () => {
    if (!data?.url) return;
    setIsLoading(true);
    window.location.href = data.url;
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading || !data?.url}
      variant="outline"
      className={className}
      size="lg"
    >
      <Chrome className="mr-2 h-4 w-4" />
      {isLoading ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}
