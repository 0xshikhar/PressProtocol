"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AuthButton() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string>();

  const handleLogin = async () => {
    try {
      setError(undefined);
      setIsLoggingIn(true);
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!ready) {
    return (
      <Button disabled className="h-9 px-4 font-mono text-xs rounded-[6px] opacity-60">
        Loading...
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap font-sans">
      {!authenticated ? (
        <Button
          onClick={handleLogin}
          disabled={isLoggingIn}
          size="sm"
          className="bg-surface hover:bg-overlay text-primary border border-hairline hover:border-focus font-mono text-xs h-9 px-4 rounded-[6px] transition-all flex items-center gap-2 tracking-wide"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span>{isLoggingIn ? "Authenticating..." : "Connect Identity"}</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-surface text-primary rounded-[6px] text-xs font-mono border border-hairline flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-verified" />
            <span className="text-muted text-[10px] uppercase font-mono">Ed25519</span>
            <span className="tnum">
              {user?.wallet?.address
                ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                : user?.email?.address || "Connected"}
            </span>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-xs font-mono text-muted hover:text-primary hover:bg-overlay h-8 px-2.5 rounded-[6px] border border-hairline hover:border-focus transition-all"
          >
            Disconnect
          </Button>
        </div>
      )}

      {error && <p className="text-error text-xs w-full mt-2 font-mono">{error}</p>}
    </div>
  );
}
