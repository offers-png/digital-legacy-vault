import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Mail, CheckCircle2, Clock, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function Executors() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [executorEmail, setExecutorEmail] = useState("");
  const [executorName, setExecutorName] = useState("");
  const [isDesignating, setIsDesignating] = useState(false);

  // Fetch executors
  const { data: executors, refetch } = trpc.executor.getExecutors.useQuery();

  // Designate executor mutation
  const designateExecutorMutation = trpc.executor.designateExecutor.useMutation({
    onSuccess: (data) => {
      toast.success("Executor designated! Share the invitation with them.");
      setIsOpen(false);
      setExecutorEmail("");
      setExecutorName("");
      setIsDesignating(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to designate executor: " + error.message);
      setIsDesignating(false);
    },
  });

  const handleDesignateExecutor = async () => {
    if (!executorEmail || !executorName) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsDesignating(true);
    try {
      await designateExecutorMutation.mutateAsync({
        executorEmail,
        executorName,
      });
    } catch (error) {
      console.error("Error designating executor:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Executors</h1>
            <p className="text-muted-foreground">
              Designate trusted people to manage your digital assets after your death
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Designate Executor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Designate New Executor</DialogTitle>
                <DialogDescription>
                  Choose a trusted person to manage your digital assets. They'll receive an invitation to accept the role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Executor Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Doe"
                    value={executorName}
                    onChange={(e) => setExecutorName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Executor Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={executorEmail}
                    onChange={(e) => setExecutorEmail(e.target.value)}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                  <p className="font-semibold mb-2">How it works:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• An invitation will be sent to their email</li>
                    <li>• They must accept to become your executor</li>
                    <li>• They can only access assets after death verification</li>
                  </ul>
                </div>

                <Button
                  onClick={handleDesignateExecutor}
                  disabled={isDesignating}
                  className="w-full"
                >
                  {isDesignating ? "Designating..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Executors List */}
        {executors && executors.length > 0 ? (
          <div className="space-y-4">
            {executors.map((executor) => (
              <Card key={executor.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold">Executor #{executor.executorId}</h3>
                        {getStatusBadge(executor.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Designated on {new Date(executor.createdAt).toLocaleDateString()}
                      </p>

                      {executor.status === "pending" && executor.invitationExpiresAt && (
                        <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-3">
                          Invitation expires on {new Date(executor.invitationExpiresAt).toLocaleDateString()}
                        </div>
                      )}

                      {executor.status === "accepted" && executor.acceptedAt && (
                        <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                          Accepted on {new Date(executor.acceptedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(executor.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No executors designated yet</p>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                Designate trusted executors who will manage your digital assets after your death.
              </p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Designate Your First Executor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Designate New Executor</DialogTitle>
                    <DialogDescription>
                      Choose a trusted person to manage your digital assets. They'll receive an invitation to accept the role.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Executor Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., John Doe"
                        value={executorName}
                        onChange={(e) => setExecutorName(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Executor Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={executorEmail}
                        onChange={(e) => setExecutorEmail(e.target.value)}
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                      <p className="font-semibold mb-2">How it works:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• An invitation will be sent to their email</li>
                        <li>• They must accept to become your executor</li>
                        <li>• They can only access assets after death verification</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleDesignateExecutor}
                      disabled={isDesignating}
                      className="w-full"
                    >
                      {isDesignating ? "Designating..." : "Send Invitation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who Should Be Your Executor?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Choose someone you trust completely:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Family member or close friend</li>
                <li>Financially responsible person</li>
                <li>Someone who understands your digital life</li>
                <li>You can designate multiple executors</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What Executors Can Do</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>After death verification:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Access your encrypted assets</li>
                <li>Transfer digital accounts</li>
                <li>Manage cryptocurrency</li>
                <li>Access personal messages</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
