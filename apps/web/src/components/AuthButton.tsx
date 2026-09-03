"use client"
import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export function AuthButton() {
    const {
        login,
        logout,
        authenticated,
        user,
        ready,
        connectWallet
    } = usePrivy();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string>();

    const handleLogin = async () => {
        try {
            setError(undefined);
            setIsLoggingIn(true);
            await login();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to login');
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (!ready) {
        return <Button disabled className="animate-pulse">Loading...</Button>;
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {!authenticated ? (
                <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    size="sm"
                    className="bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15 hover:border-cyan-400/40 font-mono text-xs h-9 px-4 rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex items-center gap-2 tracking-wide"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>{isLoggingIn ? 'Authenticating...' : 'Connect Identity'}</span>
                </Button>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[#08090E] text-emerald-300 rounded-md text-xs font-mono border border-emerald-500/25 flex items-center gap-2 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(61,214,140,0.8)]" />
                        <span className="text-zinc-500 text-[10px] uppercase font-sans">Ed25519</span>
                        <span>
                            {user?.wallet?.address ?
                                `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` :
                                user?.email?.address || 'Connected'}
                        </span>
                    </div>
                    <Button
                        onClick={logout}
                        variant="ghost"
                        size="sm"
                        className="text-xs font-mono text-zinc-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2.5 rounded-md border border-white/[0.08] hover:border-red-500/30 transition-all"
                    >
                        Disconnect
                    </Button>
                </div>
            )}

            {error && <p className="text-destructive text-sm w-full mt-2">{error}</p>}
        </div>
    );
}
