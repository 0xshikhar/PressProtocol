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
                >
                    {isLoggingIn ? 'Connecting...' : 'Connect Wallet'}
                </Button>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-blue-50 text-primary rounded-md text-sm font-medium border border-blue-100">
                        {user?.wallet?.address ?
                            `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` :
                            user?.email?.address || 'Connected'}
                    </div>
                    <Button
                        onClick={logout}
                        variant="destructive"
                        size="sm"
                    >
                        Disconnect
                    </Button>
                </div>
            )}

            {error && <p className="text-destructive text-sm w-full mt-2">{error}</p>}
        </div>
    );
}
