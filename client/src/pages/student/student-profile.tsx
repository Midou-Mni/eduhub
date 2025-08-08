import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  BookOpen, 
  Award, 
  Calendar, 
  LogOut,
  Camera
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function StudentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: (user as UserType)?.firstName || '',
    lastName: (user as UserType)?.lastName || '',
    email: (user as UserType)?.email || '',
    bio: (user as UserType)?.bio || '',
    website: (user as UserType)?.website || '',
  });

  const handleSaveProfile = () => {
    // In a real app, this would make an API call to update the user profile
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
    setIsEditing(false);
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900">Profile Settings</h1>
          <p className="text-neutral-600">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
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
                placeholder="Tell others about yourself..."
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

        {/* Learning Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <CardTitle>Learning Stats</CardTitle>
            </div>
            <CardDescription>
              Your learning progress and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <BookOpen className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-neutral-600">Courses Enrolled</p>
              </div>
              
              <div className="text-center p-4 bg-success/5 rounded-lg">
                <Award className="mx-auto h-8 w-8 text-success mb-2" />
                <p className="text-2xl font-bold text-success">0</p>
                <p className="text-sm text-neutral-600">Courses Completed</p>
              </div>
              
              <div className="text-center p-4 bg-warning/5 rounded-lg">
                <Calendar className="mx-auto h-8 w-8 text-warning mb-2" />
                <p className="text-2xl font-bold text-warning">0</p>
                <p className="text-sm text-neutral-600">Days Learning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
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
                <p className="text-sm">{(user as UserType)?.createdAt ? new Date((user as UserType).createdAt!).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
              <div className="mt-1">
                <Badge variant="outline" className="bg-success/10 text-success">
                  Active Student
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
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