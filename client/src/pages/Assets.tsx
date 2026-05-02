import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const ASSET_CATEGORIES = [
  { value: "crypto", label: "Cryptocurrency Keys" },
  { value: "social_media", label: "Social Media Accounts" },
  { value: "domain", label: "Domain Names" },
  { value: "password", label: "Passwords" },
  { value: "business_login", label: "Business Logins" },
  { value: "personal_message", label: "Personal Messages" },
];

export default function Assets() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetData, setAssetData] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch assets
  const { data: assets, refetch } = trpc.asset.getAssets.useQuery();

  // Create asset mutation
  const createAssetMutation = trpc.asset.createAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset created successfully!");
      setIsOpen(false);
      setAssetName("");
      setAssetDescription("");
      setAssetData("");
      setPassword("");
      setSelectedCategory("");
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to create asset: " + error.message);
      setIsCreating(false);
    },
  });

  // Delete asset mutation
  const deleteAssetMutation = trpc.asset.deleteAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete asset: " + error.message);
    },
  });

  const handleCreateAsset = async () => {
    if (!selectedCategory || !assetName || !assetData || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const assetDataObj = {
        value: assetData,
        createdAt: new Date().toISOString(),
      };

      await createAssetMutation.mutateAsync({
        category: selectedCategory as any,
        name: assetName,
        description: assetDescription || undefined,
        assetData: assetDataObj,
        password,
      });
    } catch (error) {
      console.error("Error creating asset:", error);
    }
  };

  const handleDeleteAsset = (assetId: number) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      deleteAssetMutation.mutate({ assetId });
    }
  };

  const getCategoryLabel = (category: string) => {
    return ASSET_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Digital Assets</h1>
            <p className="text-muted-foreground">
              Securely store and manage your encrypted digital assets
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>
                  Create a new encrypted digital asset. All data is encrypted with your password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Asset Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Bitcoin Wallet"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add notes about this asset"
                    value={assetDescription}
                    onChange={(e) => setAssetDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="data">Asset Data</Label>
                  <Textarea
                    id="data"
                    placeholder="Paste the sensitive data (keys, passwords, etc.)"
                    value={assetData}
                    onChange={(e) => setAssetData(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Your Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password for encryption"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleCreateAsset}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Asset"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Assets Grid */}
        {assets && assets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        {asset.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {getCategoryLabel(asset.category)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {asset.description && (
                      <p className="text-sm text-muted-foreground">{asset.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(asset.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lock className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No assets yet</p>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                Start by adding your first digital asset. All data is encrypted and secure.
              </p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                    <DialogDescription>
                      Create a new encrypted digital asset. All data is encrypted with your password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Asset Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSET_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="name">Asset Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Bitcoin Wallet"
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Add notes about this asset"
                        value={assetDescription}
                        onChange={(e) => setAssetDescription(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="data">Asset Data</Label>
                      <Textarea
                        id="data"
                        placeholder="Paste the sensitive data (keys, passwords, etc.)"
                        value={assetData}
                        onChange={(e) => setAssetData(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Your Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password for encryption"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handleCreateAsset}
                      disabled={isCreating}
                      className="w-full"
                    >
                      {isCreating ? "Creating..." : "Create Asset"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Security Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Encryption:</strong> All assets are encrypted with AES-256-GCM using your password as the encryption key.
            </p>
            <p>
              <strong>Executor Access:</strong> Your designated executors have encrypted copies of your assets. They can only decrypt them after your death is verified with a death certificate.
            </p>
            <p>
              <strong>Backup:</strong> Make sure to remember your password. We cannot recover encrypted assets if you forget your password.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
