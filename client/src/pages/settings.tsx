import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Settings as SettingsIcon,
  LogOut,
  Camera
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: (user as UserType)?.firstName || '',
    lastName: (user as UserType)?.lastName || '',
    email: (user as UserType)?.email || '',
    bio: '',
    website: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    courseUpdates: true,
    studentActivity: false,
    marketingEmails: false,
  });

  const handleSaveProfile = () => {
    // In a real app, this would make an API call to update the user profile
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
    setIsEditing(false);
  };

  const handleSaveNotifications = () => {
    // In a real app, this would make an API call to update notification preferences
    toast({
      title: "Success",
      description: "Notification preferences updated",
    });
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = () => {
    const userData = user as UserType;
    return `${userData?.firstName?.charAt(0) || ''}${userData?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (!user) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <Header 
        title="Settings" 
        description="Manage your account settings and preferences"
      />

      <div className="space-y-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={(user as UserType)?.profileImageUrl || undefined} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: 400x400px image
                </p>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell students about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://your-website.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center space-x-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Course Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about your course performance and enrollments
                  </p>
                </div>
                <Switch
                  checked={notifications.courseUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, courseUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Student Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when students complete courses or leave reviews
                  </p>
                </div>
                <Switch
                  checked={notifications.studentActivity}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, studentActivity: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive tips and updates about growing your teaching business
                  </p>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, marketingEmails: checked })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>
              View your account details and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account ID</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{(user as UserType)?.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                <p className="text-sm">{(user as UserType)?.createdAt ? new Date((user as UserType).createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
              <div className="mt-1">
                <Badge variant="outline" className="bg-success/10 text-success">
                  Active Teacher
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-error">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <LogOut className="h-5 w-5 text-error" />
              <CardTitle className="text-error">Sign Out</CardTitle>
            </div>
            <CardDescription>
              Sign out of your account on this device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
