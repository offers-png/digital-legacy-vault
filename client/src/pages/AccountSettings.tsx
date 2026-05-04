import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const profileQuery = trpc.account.getProfile.useQuery();

  const exportMutation = trpc.account.exportData.useQuery(undefined, {
    enabled: false,
  });

  const deleteMutation = trpc.account.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted. Signing out…");
      setTimeout(() => {
        logout();
        navigate("/");
      }, 1500);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete account");
    },
  });

  const handleExport = async () => {
    try {
      const result = await exportMutation.refetch();
      if (result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `digital-legacy-vault-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Data exported successfully");
      }
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = () => {
    deleteMutation.mutate({ confirmEmail });
  };

  const stats = profileQuery.data?.stats;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 py-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account and privacy preferences.</p>
        </div>

        {/* Profile */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-medium text-slate-900">{user?.name ?? "—"}</p>
                <p className="text-sm text-slate-500">{user?.email ?? "—"}</p>
              </div>
            </div>
          </div>
          {stats && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.assetCount}</p>
                <p className="text-xs text-slate-500">Assets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.checkInCount}</p>
                <p className="text-xs text-slate-500">Check-ins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.executorCount}</p>
                <p className="text-xs text-slate-500">Executors</p>
              </div>
            </div>
          )}
        </section>

        {/* Data Export */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Export Your Data</h2>
          <p className="text-sm text-slate-600">
            Download a copy of all your data stored in Digital Legacy Vault (excludes encrypted asset contents).
          </p>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMutation.isFetching}
          >
            {exportMutation.isFetching ? "Exporting…" : "Export Data (JSON)"}
          </Button>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-xl border border-red-200 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
          <p className="text-sm text-slate-600">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  All your assets, check-in history, executor designations, and personal data will
                  be permanently deleted. This cannot be undone.
                  <br /><br />
                  Type your email address to confirm:
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                placeholder={user?.email ?? "your@email.com"}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="mt-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmEmail("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={confirmEmail !== user?.email || deleteMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete My Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        {/* Legal */}
        <div className="flex gap-4 text-sm text-slate-500">
          <button onClick={() => navigate("/privacy")} className="hover:underline">Privacy Policy</button>
          <button onClick={() => navigate("/terms")} className="hover:underline">Terms of Service</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
