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
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0B0D14]/80 backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.12),transparent_70%)]" />

        <div className="container relative z-10 mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              <Settings className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">Protocol Settings</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Configure your wallet, privacy, and content discovery preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="indexers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-[#08090E] border border-white/[0.08] p-1 rounded-lg text-zinc-400 gap-1 h-auto">
            <TabsTrigger value="indexers" className="rounded-md py-2 text-xs font-medium gap-2 data-[state=active]:bg-[#15151C] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/10 transition-all">
              <Server className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Indexers</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-md py-2 text-xs font-medium gap-2 data-[state=active]:bg-[#15151C] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/10 transition-all">
              <Wallet className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-md py-2 text-xs font-medium gap-2 data-[state=active]:bg-[#15151C] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/10 transition-all">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-md py-2 text-xs font-medium gap-2 data-[state=active]:bg-[#15151C] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/10 transition-all">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Indexers Tab */}
          <TabsContent value="indexers" className="space-y-6">
            <IndexerSettings />
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="border-white/[0.08] bg-[#0D0D12] text-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans font-semibold text-white">Wallet & Identity</CardTitle>
                <CardDescription className="text-neutral-400">
                  Manage your Web3 wallet and anonymous identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-neutral-200">Connected Wallet</h4>
                  <p className="text-sm text-neutral-400 mb-4">
                    Your wallet is used for anonymous content signing
                  </p>
                  <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">MetaMask</p>
                        <p className="text-xs font-mono text-cyan-300">0x742d...4b2a</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs">Disconnect</Button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-sm font-medium mb-2 text-neutral-200">Ed25519 Signing Key</h4>
                  <p className="text-sm text-neutral-400 mb-4">
                    Your public key used for content verification
                  </p>
                  <div className="p-4 bg-black/60 border border-white/10 rounded-xl font-mono text-xs break-all text-cyan-300">
                    ed25519:1234567890abcdef...
                  </div>
                  <Button className="mt-3 border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs" variant="outline" size="sm">
                    Copy Public Key
                  </Button>
                </div>

                <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-300">
                  <p className="text-xs leading-relaxed">
                    <strong>🔐 Privacy Note:</strong> Your wallet is only used for signing. Content is published 
                    to IPFS without revealing your identity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-white/[0.08] bg-[#0D0D12] text-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans font-semibold text-white">Privacy & Publishing</CardTitle>
                <CardDescription className="text-zinc-400">
                  Control how your content is published and discovered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium text-white">Anonymous Publishing Mode</div>
                    <p className="text-xs text-zinc-400">
                      Publish with temporary identity without connecting wallet
                    </p>
                  </div>
                  <Switch
                    checked={anonymousPublishing}
                    onCheckedChange={setAnonymousPublishing}
                  />
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium text-white">Use Tor Gateways</div>
                    <p className="text-xs text-zinc-400">
                      Route IPFS traffic through Tor for enhanced privacy (slower)
                    </p>
                  </div>
                  <Switch
                    checked={useTor}
                    onCheckedChange={setUseTor}
                  />
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium text-white">IPFS Gateway Mirrors</div>
                    <p className="text-xs text-zinc-400">
                      Create multiple gateway mirrors for better availability
                    </p>
                  </div>
                  <Switch
                    checked={useIPFSMirrors}
                    onCheckedChange={setUseIPFSMirrors}
                  />
                </div>

                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-300">
                  <p className="text-xs leading-relaxed">
                    <strong>⚠️ Trade-offs:</strong> More privacy = slower performance. Tor adds latency, 
                    disabling indexers makes discovery slower, but both maximize anonymity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="border-white/[0.08] bg-[#0D0D12] text-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans font-semibold text-white">Backup & Recovery</CardTitle>
                <CardDescription className="text-neutral-400">
                  Secure your signing keys and content manifests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-neutral-200">Backup Signing Keys</h4>
                  <p className="text-xs text-neutral-400 mb-4">
                    Download encrypted backup of your Ed25519 signing keys
                  </p>
                  <Button variant="outline" className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs">Download Key Backup</Button>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-sm font-medium mb-2 text-neutral-200">Export Content Manifest</h4>
                  <p className="text-xs text-neutral-400 mb-4">
                    Export list of all your published content CIDs
                  </p>
                  <Button variant="outline" className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs">Export Manifest (JSON)</Button>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-sm font-medium mb-2 text-neutral-200">Local Storage</h4>
                  <p className="text-xs text-neutral-400 mb-4">
                    Clear cached data and preferences stored in your browser
                  </p>
                  <Button variant="outline" className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs">Clear Local Data</Button>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300">
                  <p className="text-xs leading-relaxed">
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
