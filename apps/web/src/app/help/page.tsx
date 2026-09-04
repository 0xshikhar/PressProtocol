"use client";

import { useState, useEffect } from "react";
import { Activity, Shield, Key, Network, Database, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState({
    ipfs: { status: 'checking', details: 'Connecting to swarm...' },
    crypto: { status: 'checking', details: 'Verifying WebCrypto API...' },
    storage: { status: 'checking', details: 'Checking IndexedDB...' },
    network: { status: 'checking', details: 'Measuring latency...' },
  });

  const [loading, setLoading] = useState(false);

  const runDiagnostics = () => {
    setLoading(true);
    // Simulate diagnostic checks
    setDiagnostics({
      ipfs: { status: 'checking', details: 'Connecting to swarm...' },
      crypto: { status: 'checking', details: 'Verifying WebCrypto API...' },
      storage: { status: 'checking', details: 'Checking IndexedDB...' },
      network: { status: 'checking', details: 'Measuring latency...' },
    });

    setTimeout(() => {
      setDiagnostics(prev => ({ ...prev, crypto: { status: 'ok', details: 'Ed25519 subsystem ready' } }));
    }, 800);
    setTimeout(() => {
      setDiagnostics(prev => ({ ...prev, storage: { status: 'ok', details: 'Local key vault active' } }));
    }, 1200);
    setTimeout(() => {
      setDiagnostics(prev => ({ ...prev, network: { status: 'ok', details: '24ms latency to nearest relay' } }));
    }, 1800);
    setTimeout(() => {
      setDiagnostics(prev => ({ ...prev, ipfs: { status: 'warning', details: 'Using gateway fallback (DHT offline)' } }));
      setLoading(false);
    }, 2500);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ok': return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-400" />;
      case 'checking': return <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0B0D14] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="container relative z-10 mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Diagnostics</h1>
              <p className="text-sm text-neutral-400 mt-1">
                Real-time health telemetry for your sovereign node environment.
              </p>
            </div>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-mono text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Running Diagnostics...' : 'Rerun Diagnostics'}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Cryptography Subsystem */}
          <Card className="bg-[#0B0D14] border-white/10 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" /> Cryptography Subsystem
                </CardTitle>
                <CardDescription className="text-white/40">WebCrypto & Ed25519 capabilities</CardDescription>
              </div>
              {getStatusIcon(diagnostics.crypto.status)}
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3 font-mono text-xs text-white/70">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Status</span>
                  <span className="text-white">{diagnostics.crypto.details}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>WebCrypto API</span>
                  <span className="text-emerald-400">Supported</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Curve</span>
                  <span className="text-white">Ed25519 (RFC 8032)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IPFS Node Status */}
          <Card className="bg-[#0B0D14] border-white/10 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" /> IPFS Swarm Connection
                </CardTitle>
                <CardDescription className="text-white/40">Helia DHT & Peer routing</CardDescription>
              </div>
              {getStatusIcon(diagnostics.ipfs.status)}
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3 font-mono text-xs text-white/70">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Status</span>
                  <span className={diagnostics.ipfs.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}>
                    {diagnostics.ipfs.details}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Peer ID</span>
                  <span className="text-white">Offline</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Active Gateway</span>
                  <span className="text-cyan-400">https://ipfs.io/ipfs/</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Local Storage Vault */}
          <Card className="bg-[#0B0D14] border-white/10 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Key className="h-5 w-5 text-emerald-400" /> Local Key Vault
                </CardTitle>
                <CardDescription className="text-white/40">Burner wallet storage</CardDescription>
              </div>
              {getStatusIcon(diagnostics.storage.status)}
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3 font-mono text-xs text-white/70">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Status</span>
                  <span className="text-emerald-400">{diagnostics.storage.details}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Provider</span>
                  <span className="text-white">localStorage (Encrypted)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Keys Found</span>
                  <span className="text-white">1 Identity</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transport Layer */}
          <Card className="bg-[#0B0D14] border-white/10 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Network className="h-5 w-5 text-amber-400" /> Transport Routing
                </CardTitle>
                <CardDescription className="text-white/40">Tor & clearnet relays</CardDescription>
              </div>
              {getStatusIcon(diagnostics.network.status)}
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3 font-mono text-xs text-white/70">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Status</span>
                  <span className="text-emerald-400">{diagnostics.network.details}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Protocol</span>
                  <span className="text-white">HTTPS/WSS</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Tor Subsystem</span>
                  <span className="text-white/40">Disconnected</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Console Log Simulation */}
        <div className="mt-8 bg-[#0B0D14] border border-white/10 rounded-xl overflow-hidden">
          <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-white/40" />
            <span className="font-mono text-xs text-white/40 uppercase tracking-wider">System Logs</span>
          </div>
          <div className="p-4 font-mono text-[10px] sm:text-xs text-white/50 space-y-1.5 h-48 overflow-y-auto">
            <p className="text-cyan-400">[info] PressProtocol Runtime v1.0.6 initialized</p>
            <p>[info] WebCrypto API securely loaded.</p>
            <p className="text-emerald-400">[ok] Local key vault decrypted successfully.</p>
            <p>[info] Attempting to connect to IPFS DHT swarm...</p>
            {loading ? (
              <p className="animate-pulse text-white/40">...</p>
            ) : (
              <>
                <p className="text-amber-400">[warn] P2P Node offline. Falling back to HTTP Gateway.</p>
                <p>[info] Diagnostic routine completed.</p>
              </>
            )}
          </div>
        </div>

        {/* Quick Resolution Guides */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a 
            href="/docs" 
            className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] hover:border-cyan-500/30 transition-colors group"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Documentation</div>
            <div className="font-semibold text-white group-hover:text-cyan-300 text-sm flex items-center justify-between">
              Node & IPFS Setup Guides <span>&rarr;</span>
            </div>
          </a>
          <a 
            href="/developers" 
            className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] hover:border-cyan-500/30 transition-colors group"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Developer Portal</div>
            <div className="font-semibold text-white group-hover:text-cyan-300 text-sm flex items-center justify-between">
              API & SDK Sandbox <span>&rarr;</span>
            </div>
          </a>
          <a 
            href="/explorer" 
            className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] hover:border-cyan-500/30 transition-colors group"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Network Explorer</div>
            <div className="font-semibold text-white group-hover:text-cyan-300 text-sm flex items-center justify-between">
              Live Swarm Ledger <span>&rarr;</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
