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
        return <div className="px-4 py-2 bg-gray-500 text-white rounded animate-pulse">Loading...</div>;
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {!authenticated ? (
                <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    {isLoggingIn ? 'Connecting...' : 'Connect Wallet'}
                </Button>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-gray-100 text-gray-800 rounded">
                        {user?.wallet?.address ?
                            `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` :
                            user?.email?.address || 'Connected'}
                    </div>
                    <Button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Disconnect
                    </Button>
                </div>
            )}

            {error && <p className="text-red-500 w-full mt-2">{error}</p>}
        </div>
    );
}
