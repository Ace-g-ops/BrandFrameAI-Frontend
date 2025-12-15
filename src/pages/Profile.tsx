import { useState, useEffect } from "react";
import { User, Mail, Loader2, Images, Settings2, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, User as UserType } from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage, logout } from "@/lib/api-utils";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    totalPresets: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await api.getUser();
      setUser(userData);
      
      // Fetch stats
      try {
        const [images, presets] = await Promise.all([
          api.getImages(),
          api.getPresets(),
        ]);
        setStats({
          totalGenerations: images.length,
          totalPresets: presets.length,
        });
      } catch (err) {
        // Stats are optional, don't fail if they error
        console.error("Failed to load stats:", err);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Failed to load user data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">View your account information and statistics</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-2 glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <div className="mt-1 flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.name}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="mt-1 flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Images className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Generated Images</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalGenerations}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand Presets</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalPresets}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

