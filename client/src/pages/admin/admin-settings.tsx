import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Settings,
  Save,
  RefreshCw,
  Shield,
  Globe,
  Bell,
  Database,
  Mail,
  Palette,
  Code,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const [selectedTab, setSelectedTab] = useState("general");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: settings } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: featureFlags } = useQuery<any[]>({
    queryKey: ["/api/admin/feature-flags"],
  });

  const { data: systemInfo } = useQuery<any>({
    queryKey: ["/api/admin/system-info"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Setting updated successfully" });
    },
  });

  const updateFeatureFlagMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const response = await fetch(`/api/admin/feature-flags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled }),
      });
      if (!response.ok) throw new Error('Failed to update feature flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feature-flags"] });
      toast({ title: "Feature flag updated successfully" });
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/cache/clear', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to clear cache');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Cache cleared successfully" });
    },
  });

  const getSettingValue = (key: string) => {
    const setting = settings?.find(s => s.key === key);
    return setting?.value || '';
  };

  const handleSettingUpdate = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handleFeatureFlagToggle = (id: string, isEnabled: boolean) => {
    updateFeatureFlagMutation.mutate({ id, isEnabled });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Platform Settings</h1>
          <p className="text-neutral-600 mt-1">
            Configure and manage platform settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => clearCacheMutation.mutate()}
            disabled={clearCacheMutation.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Information</CardTitle>
                <CardDescription>Basic platform settings and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    defaultValue={getSettingValue('platform_name')}
                    onBlur={(e) => handleSettingUpdate('platform_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-description">Description</Label>
                  <Textarea
                    id="platform-description"
                    defaultValue={getSettingValue('platform_description')}
                    onBlur={(e) => handleSettingUpdate('platform_description', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    defaultValue={getSettingValue('contact_email')}
                    onBlur={(e) => handleSettingUpdate('contact_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-url">Support URL</Label>
                  <Input
                    id="support-url"
                    defaultValue={getSettingValue('support_url')}
                    onBlur={(e) => handleSettingUpdate('support_url', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Settings</CardTitle>
                <CardDescription>Control user registration and approval</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Open Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anyone to register on the platform
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('open_registration') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('open_registration', checked.toString())
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Teacher Approval Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require admin approval for teacher accounts
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('teacher_approval_required') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('teacher_approval_required', checked.toString())
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new accounts
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('email_verification_required') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('email_verification_required', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Default course configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-course-price">Maximum Course Price ($)</Label>
                  <Input
                    id="max-course-price"
                    type="number"
                    defaultValue={getSettingValue('max_course_price')}
                    onBlur={(e) => handleSettingUpdate('max_course_price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-course-price">Minimum Course Price ($)</Label>
                  <Input
                    id="min-course-price"
                    type="number"
                    defaultValue={getSettingValue('min_course_price')}
                    onBlur={(e) => handleSettingUpdate('min_course_price', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Course Approval Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require admin approval before publishing courses
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('course_approval_required') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('course_approval_required', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Policies</CardTitle>
                <CardDescription>Platform content guidelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    defaultValue={getSettingValue('max_file_size')}
                    onBlur={(e) => handleSettingUpdate('max_file_size', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-file-types">Allowed File Types</Label>
                  <Input
                    id="allowed-file-types"
                    defaultValue={getSettingValue('allowed_file_types')}
                    onBlur={(e) => handleSettingUpdate('allowed_file_types', e.target.value)}
                    placeholder="video/mp4,application/pdf,image/jpeg"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Content Moderation</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic content moderation
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('content_moderation_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('content_moderation_enabled', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Configure authentication and security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    defaultValue={getSettingValue('session_timeout')}
                    onBlur={(e) => handleSettingUpdate('session_timeout', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    defaultValue={getSettingValue('max_login_attempts')}
                    onBlur={(e) => handleSettingUpdate('max_login_attempts', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('require_2fa_admin') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('require_2fa_admin', checked.toString())
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Force HTTPS</Label>
                    <p className="text-sm text-muted-foreground">
                      Redirect all HTTP traffic to HTTPS
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('force_https') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('force_https', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>API rate limiting configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-rate-limit">API Rate Limit (requests/minute)</Label>
                  <Input
                    id="api-rate-limit"
                    type="number"
                    defaultValue={getSettingValue('api_rate_limit')}
                    onBlur={(e) => handleSettingUpdate('api_rate_limit', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-rate-limit">Upload Rate Limit (MB/hour)</Label>
                  <Input
                    id="upload-rate-limit"
                    type="number"
                    defaultValue={getSettingValue('upload_rate_limit')}
                    onBlur={(e) => handleSettingUpdate('upload_rate_limit', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable DDoS Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable advanced DDoS protection
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('ddos_protection_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('ddos_protection_enabled', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>Privacy and data protection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    defaultValue={getSettingValue('data_retention_days')}
                    onBlur={(e) => handleSettingUpdate('data_retention_days', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>GDPR Compliance</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable GDPR compliance features
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('gdpr_compliance_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('gdpr_compliance_enabled', checked.toString())
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable user analytics tracking
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('analytics_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('analytics_enabled', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure email notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    defaultValue={getSettingValue('smtp_host')}
                    onBlur={(e) => handleSettingUpdate('smtp_host', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    defaultValue={getSettingValue('smtp_port')}
                    onBlur={(e) => handleSettingUpdate('smtp_port', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input
                    id="smtp-username"
                    defaultValue={getSettingValue('smtp_username')}
                    onBlur={(e) => handleSettingUpdate('smtp_username', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable email notifications system-wide
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('email_notifications_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('email_notifications_enabled', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
                <CardDescription>Configure which notifications to send</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Welcome Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Send welcome emails to new users
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('welcome_emails_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('welcome_emails_enabled', checked.toString())
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Course Enrollment Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify teachers of new enrollments
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('enrollment_notifications_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('enrollment_notifications_enabled', checked.toString())
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send system alerts to administrators
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('system_alerts_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('system_alerts_enabled', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Control feature availability and rollout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureFlags?.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{flag.name}</h4>
                        <Badge variant={flag.isEnabled ? 'default' : 'secondary'}>
                          {flag.isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                      {flag.rolloutPercentage > 0 && flag.rolloutPercentage < 100 && (
                        <p className="text-xs text-muted-foreground">
                          Rollout: {flag.rolloutPercentage}%
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={(checked) => handleFeatureFlagToggle(flag.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Customize platform appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primary-color"
                      type="color"
                      defaultValue={getSettingValue('primary_color') || '#3b82f6'}
                      className="w-20"
                      onBlur={(e) => handleSettingUpdate('primary_color', e.target.value)}
                    />
                    <Input
                      defaultValue={getSettingValue('primary_color') || '#3b82f6'}
                      onBlur={(e) => handleSettingUpdate('primary_color', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    defaultValue={getSettingValue('logo_url')}
                    onBlur={(e) => handleSettingUpdate('logo_url', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon-url">Favicon URL</Label>
                  <Input
                    id="favicon-url"
                    defaultValue={getSettingValue('favicon_url')}
                    onBlur={(e) => handleSettingUpdate('favicon_url', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout Settings</CardTitle>
                <CardDescription>Configure layout and navigation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode Available</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to switch to dark mode
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('dark_mode_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('dark_mode_enabled', checked.toString())
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Navigation</Label>
                    <p className="text-sm text-muted-foreground">
                      Use compact navigation by default
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('compact_navigation') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('compact_navigation', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Platform Version</Label>
                    <p className="text-sm font-mono">{systemInfo?.version ?? '1.0.0'}</p>
                  </div>
                  <div>
                    <Label>Database Status</Label>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Connected</span>
                    </div>
                  </div>
                  <div>
                    <Label>Uptime</Label>
                    <p className="text-sm">{systemInfo?.uptime ?? '24 hours'}</p>
                  </div>
                  <div>
                    <Label>Memory Usage</Label>
                    <p className="text-sm">{systemInfo?.memoryUsage ?? '45%'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>Control platform availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to restrict access
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('maintenance_mode') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('maintenance_mode', checked.toString())
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    defaultValue={getSettingValue('maintenance_message')}
                    onBlur={(e) => handleSettingUpdate('maintenance_message', e.target.value)}
                    placeholder="The platform is currently undergoing maintenance..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Recovery</CardTitle>
                <CardDescription>Database backup and recovery options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable scheduled database backups
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('auto_backup_enabled') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('auto_backup_enabled', checked.toString())
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency (hours)</Label>
                  <Input
                    id="backup-frequency"
                    type="number"
                    defaultValue={getSettingValue('backup_frequency')}
                    onBlur={(e) => handleSettingUpdate('backup_frequency', e.target.value)}
                  />
                </div>
                <Button variant="outline" className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Create Manual Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs & Monitoring</CardTitle>
                <CardDescription>System logs and monitoring configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select defaultValue={getSettingValue('log_level') || 'info'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-retention">Log Retention (days)</Label>
                  <Input
                    id="log-retention"
                    type="number"
                    defaultValue={getSettingValue('log_retention_days')}
                    onBlur={(e) => handleSettingUpdate('log_retention_days', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Performance Monitoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable performance monitoring
                    </p>
                  </div>
                  <Switch
                    defaultChecked={getSettingValue('performance_monitoring') === 'true'}
                    onCheckedChange={(checked) => 
                      handleSettingUpdate('performance_monitoring', checked.toString())
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
