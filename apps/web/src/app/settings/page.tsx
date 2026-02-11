"use client"

import { useState } from "react";
import { Settings, Wallet, Shield, Database, Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndexerSettings } from "@/components/settings/IndexerSettings";

export default function SettingsPage() {
  const [anonymousPublishing, setAnonymousPublishing] = useState(false);
  const [useTor, setUseTor] = useState(false);
  const [useIPFSMirrors, setUseIPFSMirrors] = useState(true);

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
                Configure your wallet, privacy, and content discovery preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="indexers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="indexers" className="gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Indexers</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Indexers Tab */}
          <TabsContent value="indexers" className="space-y-6">
            <IndexerSettings />
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet & Identity</CardTitle>
                <CardDescription>
                  Manage your Web3 wallet and anonymous identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Connected Wallet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your wallet is used for anonymous content signing
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
                  <h4 className="text-sm font-medium mb-2">Ed25519 Signing Key</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your public key used for content verification
                  </p>
                  <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm break-all">
                    ed25519:1234567890abcdef...
                  </div>
                  <Button className="mt-3" variant="outline" size="sm">
                    Copy Public Key
                  </Button>
                </div>

                <Separator />

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>🔐 Privacy Note:</strong> Your wallet is only used for signing. Content is published 
                    to IPFS without revealing your identity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Publishing</CardTitle>
                <CardDescription>
                  Control how your content is published and discovered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Anonymous Publishing Mode</div>
                    <p className="text-sm text-muted-foreground">
                      Publish with temporary identity without connecting wallet
                    </p>
                  </div>
                  <Switch
                    checked={anonymousPublishing}
                    onCheckedChange={setAnonymousPublishing}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Use Tor Gateways</div>
                    <p className="text-sm text-muted-foreground">
                      Route IPFS traffic through Tor for enhanced privacy (slower)
                    </p>
                  </div>
                  <Switch
                    checked={useTor}
                    onCheckedChange={setUseTor}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">IPFS Gateway Mirrors</div>
                    <p className="text-sm text-muted-foreground">
                      Create multiple gateway mirrors for better availability
                    </p>
                  </div>
                  <Switch
                    checked={useIPFSMirrors}
                    onCheckedChange={setUseIPFSMirrors}
                  />
                </div>

                <Separator />

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>⚠️ Trade-offs:</strong> More privacy = slower performance. Tor adds latency, 
                    disabling indexers makes discovery slower, but both maximize anonymity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Recovery</CardTitle>
                <CardDescription>
                  Secure your signing keys and content manifests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Backup Signing Keys</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download encrypted backup of your Ed25519 signing keys
                  </p>
                  <Button variant="outline">Download Key Backup</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Export Content Manifest</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export list of all your published content CIDs
                  </p>
                  <Button variant="outline">Export Manifest (JSON)</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Local Storage</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Clear cached data and preferences stored in your browser
                  </p>
                  <Button variant="outline">Clear Local Data</Button>
                </div>

                <Separator />

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>💡 Tip:</strong> Your content lives on IPFS permanently. Backups are for recovering 
                    your signing identity and keeping track of what you&apos;ve published.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
