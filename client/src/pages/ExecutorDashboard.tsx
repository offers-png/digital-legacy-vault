import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload, CheckCircle2, Clock, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Executor Dashboard - View pending notifications and manage inherited assets
 */
export default function ExecutorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  // Fetch executor notifications
  const { data: notifications, isLoading: notificationsLoading } = trpc.notification.getExecutorNotifications.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch assets for inherited estates
  const { data: inheritedAssets, isLoading: assetsLoading } = trpc.executor.getInheritedAssets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Upload death certificate mutation
  const uploadCertificateMutation = trpc.death.uploadCertificate.useMutation({
    onSuccess: () => {
      setCertificateFile(null);
      setSelectedNotificationId(null);
    },
  });

  const handleCertificateUpload = async (userId: number) => {
    if (!certificateFile) return;

    const formData = new FormData();
    formData.append("certificate", certificateFile);
    formData.append("userId", userId.toString());

    uploadCertificateMutation.mutate({ userId, certificateFile });
  };

  if (notificationsLoading || assetsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading executor dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Executor Dashboard</h1>
          <p className="text-muted-foreground">Manage notifications and access inherited digital assets</p>
        </div>

        {/* Pending Notifications */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Notifications</h2>

          {!notifications || notifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No pending notifications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {notification.type === "missed_checkin" && (
                            <>
                              <Clock className="h-5 w-5 text-yellow-600" />
                              Missed Check-in Notification
                            </>
                          )}
                          {notification.type === "death_verified" && (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              Death Verified
                            </>
                          )}
                          {notification.type === "asset_available" && (
                            <>
                              <FileText className="h-5 w-5 text-blue-600" />
                              Assets Available
                            </>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {!notification.isRead && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          New
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{notification.message}</p>

                    {/* Death Certificate Upload for Missed Check-in */}
                    {notification.type === "missed_checkin" && (
                      <Dialog open={selectedNotificationId === notification.id} onOpenChange={(open) => {
                        if (!open) setSelectedNotificationId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedNotificationId(notification.id)}
                            variant="default"
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Death Certificate
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload Death Certificate</DialogTitle>
                            <DialogDescription>
                              Upload a death certificate to verify and access the digital assets
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="certificate">Death Certificate (PDF or Image)</Label>
                              <Input
                                id="certificate"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                              />
                            </div>
                            <Button
                              onClick={() => handleCertificateUpload(notification.userId)}
                              disabled={!certificateFile || uploadCertificateMutation.isPending}
                              className="w-full"
                            >
                              {uploadCertificateMutation.isPending ? "Uploading..." : "Upload Certificate"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Inherited Assets */}
        {inheritedAssets && inheritedAssets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Inherited Digital Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inheritedAssets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <CardDescription>{asset.category.replace("_", " ")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {asset.description && <p className="text-sm text-muted-foreground">{asset.description}</p>}
                    <Button variant="outline" className="w-full">
                      View Asset Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
