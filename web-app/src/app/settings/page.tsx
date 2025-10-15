"use client"

import { useState } from "react";
import { Settings, User, Bell, Shield, Eye, Palette, Key, Database, Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { IndexerSettings } from "@/components/settings/IndexerSettings";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and security
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="indexers" className="gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Indexers</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and public profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" placeholder="Your display name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="@username" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll use this for notifications and account recovery
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself..." 
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Brief description for your profile. Maximum 160 characters.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://your-website.com" />
                </div>

                <Separator />

                <div className="flex justify-end gap-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indexers Tab */}
          <TabsContent value="indexers" className="space-y-6">
            <IndexerSettings />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your content and activity
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="text-base">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get push notifications for important updates
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-4">Email me when...</h4>
                  <div className="space-y-4">
                    {[
                      "Someone views my content",
                      "Someone shares my content",
                      "I receive a comment or reply",
                      "My content is trending",
                      "Weekly summary of my activity",
                      "New features and updates"
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Switch id={item.toLowerCase().replace(/\s/g, '-')} defaultChecked />
                        <Label htmlFor={item.toLowerCase().replace(/\s/g, '-')} className="font-normal">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-4">
                  <Button variant="outline">Reset to Default</Button>
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Change Password</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa" className="text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Connected Wallets</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your connected Web3 wallets
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">MetaMask</p>
                          <p className="text-sm text-muted-foreground">0x742d...4b2a</p>
                        </div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Active Sessions</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    See where you&apos;re logged in and manage your sessions
                  </p>
                  <Button variant="outline">View All Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Controls</CardTitle>
                <CardDescription>
                  Manage your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to everyone
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show Activity</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your publishing activity on your profile
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={analyticsTracking}
                    onCheckedChange={setAnalyticsTracking}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Anonymous Publishing</Label>
                    <p className="text-sm text-muted-foreground">
                      Publish content without revealing your identity
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button>Save Privacy Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export, backup, or delete your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of all your content and activity
                  </p>
                  <Button variant="outline">Request Data Export</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Backup Keys</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Securely backup your Ed25519 signing keys
                  </p>
                  <Button variant="outline">Download Backup</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2 text-destructive">Danger Zone</h4>
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <h5 className="font-medium mb-1">Delete All Content</h5>
                        <p className="text-sm text-muted-foreground mb-2">
                          Permanently delete all your published content
                        </p>
                        <Button variant="destructive" size="sm">Delete Content</Button>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-1">Delete Account</h5>
                        <p className="text-sm text-muted-foreground mb-2">
                          Permanently delete your account and all associated data
                        </p>
                        <Button variant="destructive" size="sm">Delete Account</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
