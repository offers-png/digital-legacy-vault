import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function CheckIn() {
  const { user } = useAuth();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Fetch check-in status
  const { data: checkInData, refetch } = trpc.checkIn.getLastCheckIn.useQuery();
  const { data: history } = trpc.checkIn.getCheckInHistory.useQuery();

  // Record check-in mutation
  const recordCheckInMutation = trpc.checkIn.recordCheckIn.useMutation({
    onSuccess: () => {
      toast.success("Check-in recorded successfully!");
      setIsCheckingIn(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to record check-in: " + error.message);
      setIsCheckingIn(false);
    },
  });

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    await recordCheckInMutation.mutateAsync();
  };

  const getCheckInStatus = () => {
    if (!checkInData?.daysAgo) return "Never checked in";
    if (checkInData.daysAgo === 0) return "Checked in today";
    if (checkInData.daysAgo === 1) return "Checked in yesterday";
    return `Last checked in ${checkInData.daysAgo} days ago`;
  };

  const getStatusColor = () => {
    if (!checkInData?.daysAgo) return "text-red-600";
    if (checkInData.daysAgo < 15) return "text-green-600";
    if (checkInData.daysAgo < 25) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dead Man's Switch</h1>
          <p className="text-muted-foreground">
            Check in every 30 days to confirm you're okay. Missing 2 consecutive check-ins will notify your executors.
          </p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Your Check-in Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Check-in</p>
                <p className={`text-2xl font-bold ${getStatusColor()}`}>
                  {getCheckInStatus()}
                </p>
              </div>
              <Clock className="w-12 h-12 text-muted-foreground" />
            </div>

            {checkInData && checkInData.daysAgo !== null && checkInData.daysAgo > 25 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  You're approaching the 30-day check-in deadline. Please check in now to keep your estate plan active.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <p className="text-sm font-semibold">How the Dead Man's Switch works:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Check in every 30 days to confirm you're okay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>If you miss 2 consecutive 30-day periods, your executors will be notified</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Your executors can upload a death certificate to immediately access your assets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Your assets remain encrypted until death is verified</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              size="lg"
              className="w-full"
            >
              {isCheckingIn ? "Checking in..." : "Check In Now"}
            </Button>
          </CardContent>
        </Card>

        {/* Check-in History */}
        {history && history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Check-in History</CardTitle>
              <CardDescription>Your recent check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((date, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{new Date(date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-sm mb-2">What if I forget to check in?</p>
              <p className="text-sm text-muted-foreground">
                If you miss 2 consecutive 30-day periods, your executors will receive a notification. You can still check in at any time to reset the timer.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">Can I change the check-in interval?</p>
              <p className="text-sm text-muted-foreground">
                Currently, the check-in interval is fixed at 30 days. Contact support if you need a different interval.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">What happens to my assets if I don't check in?</p>
              <p className="text-sm text-muted-foreground">
                Your assets remain encrypted and secure. They will only become accessible to your executors after they verify your death with a death certificate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
