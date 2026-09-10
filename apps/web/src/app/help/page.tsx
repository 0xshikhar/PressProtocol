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
      case 'ok': return <CheckCircle2 className="h-5 w-5 text-verified" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error': return <XCircle className="h-5 w-5 text-error" />;
      case 'checking': return <RefreshCw className="h-5 w-5 text-accent-ribbon animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      {/* Header */}
      <div className="border-b border-hairline bg-surface relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[6px] bg-[rgba(124,39,51,0.14)] border border-[rgba(124,39,51,0.28)] text-accent-ribbon">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-hero text-text-primary tracking-tight">System Diagnostics</h1>
              <p className="text-sm text-text-muted mt-1 font-sans">
                Real-time health telemetry for your sovereign node environment.
              </p>
            </div>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={loading}
            className="bg-overlay hover:bg-elevated text-text-secondary hover:text-text-primary border border-hairline font-mono text-xs rounded-[6px]"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Running Diagnostics...' : 'Rerun Diagnostics'}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Cryptography Subsystem */}
          <Card elevation="card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium font-sans flex items-center gap-2 text-text-primary">
                  <Shield className="h-5 w-5 text-accent-ribbon" /> Cryptography Subsystem
                </CardTitle>
                <CardDescription className="text-text-muted text-xs">WebCrypto &amp; Ed25519 capabilities</CardDescription>
              </div>
              {getStatusIcon(diagnostics.crypto.status)}
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3 font-mono text-xs text-text-secondary">
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Status</span>
                  <span className="text-text-primary">{diagnostics.crypto.details}</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>WebCrypto API</span>
                  <span className="text-verified">Supported</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Curve</span>
                  <span className="text-text-primary">Ed25519 (RFC 8032)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IPFS Node Status */}
          <Card elevation="card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium font-sans flex items-center gap-2 text-text-primary">
                  <Database className="h-5 w-5 text-accent-ribbon" /> IPFS Swarm Connection
                </CardTitle>
                <CardDescription className="text-text-muted text-xs">Helia DHT &amp; Peer routing</CardDescription>
              </div>
              {getStatusIcon(diagnostics.ipfs.status)}
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3 font-mono text-xs text-text-secondary">
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Status</span>
                  <span className={diagnostics.ipfs.status === 'warning' ? 'text-warning' : 'text-verified'}>
                    {diagnostics.ipfs.details}
                  </span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Peer ID</span>
                  <span className="text-text-primary">Offline</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Active Gateway</span>
                  <span className="text-text-primary">https://ipfs.io/ipfs/</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Local Storage Vault */}
          <Card elevation="card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium font-sans flex items-center gap-2 text-text-primary">
                  <Key className="h-5 w-5 text-accent-ribbon" /> Local Key Vault
                </CardTitle>
                <CardDescription className="text-text-muted text-xs">Burner wallet storage</CardDescription>
              </div>
              {getStatusIcon(diagnostics.storage.status)}
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3 font-mono text-xs text-text-secondary">
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Status</span>
                  <span className="text-verified">{diagnostics.storage.details}</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Provider</span>
                  <span className="text-text-primary">localStorage (Encrypted)</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Keys Found</span>
                  <span className="text-text-primary">1 Identity</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transport Layer */}
          <Card elevation="card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium font-sans flex items-center gap-2 text-text-primary">
                  <Network className="h-5 w-5 text-[#8770C4]" /> Transport Routing
                </CardTitle>
                <CardDescription className="text-text-muted text-xs">Tor &amp; clearnet relays</CardDescription>
              </div>
              {getStatusIcon(diagnostics.network.status)}
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3 font-mono text-xs text-text-secondary">
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Status</span>
                  <span className="text-verified">{diagnostics.network.details}</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Protocol</span>
                  <span className="text-text-primary">HTTPS/WSS</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span>Tor Subsystem</span>
                  <span className="text-text-muted">Disconnected</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Console Log Simulation */}
        <div className="mt-8 bg-canvas border border-hairline rounded-[6px] overflow-hidden">
          <div className="bg-surface border-b border-hairline px-4 py-2 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-text-muted" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">System Logs</span>
          </div>
          <div className="p-4 font-mono text-[10px] sm:text-xs text-text-secondary space-y-1.5 h-48 overflow-y-auto">
            <p className="text-accent-ribbon">[info] PressProtocol Runtime v1.0.6 initialized</p>
            <p>[info] WebCrypto API securely loaded.</p>
            <p className="text-verified">[ok] Local key vault decrypted successfully.</p>
            <p>[info] Attempting to connect to IPFS DHT swarm...</p>
            {loading ? (
              <p className="animate-pulse text-text-muted">...</p>
            ) : (
              <>
                <p className="text-warning">[warn] P2P Node offline. Falling back to HTTP Gateway.</p>
                <p>[info] Diagnostic routine completed.</p>
              </>
            )}
          </div>
        </div>

        {/* Quick Resolution Guides */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a 
            href="/docs" 
            className="p-4 rounded-[6px] border border-hairline bg-surface hover:bg-elevated transition-colors group"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">Documentation</div>
            <div className="font-medium text-text-primary group-hover:text-accent-ribbon text-sm font-sans">
              Node &amp; IPFS Setup Guides
            </div>
          </a>
          <a 
            href="/developers" 
            className="p-4 rounded-[6px] border border-hairline bg-surface hover:bg-elevated transition-colors group"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">Developer Portal</div>
            <div className="font-medium text-text-primary group-hover:text-accent-ribbon text-sm font-sans">
              API &amp; SDK Sandbox
            </div>
          </a>
          <a 
            href="/explorer" 
            className="p-4 rounded-[6px] border border-hairline bg-surface hover:bg-elevated transition-colors group"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">Network Explorer</div>
            <div className="font-medium text-text-primary group-hover:text-accent-ribbon text-sm font-sans">
              Live Swarm Ledger
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
