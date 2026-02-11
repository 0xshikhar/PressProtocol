// hooks/useAuth.ts
import { usePrivy } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';

export function useAuth() {
    const {
        login: privyLogin,
        logout: privyLogout,
        authenticated,
        user,
        ready,
    } = usePrivy();

    const [isLoading, setIsLoading] = useState(false);
    const [isAutoSigningIn, setIsAutoSigningIn] = useState(false);

    // Map Privy's authenticated state to our isAuthenticated
    const isAuthenticated = authenticated;

    // Get the wallet address from Privy user
    const address = user?.wallet?.address;

    const login = useCallback(async () => {
        setIsLoading(true);
        try {
            await privyLogin();
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [privyLogin]);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await privyLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [privyLogout]);

    // Auto-login check
    useEffect(() => {
        if (ready && !authenticated && !isLoading) {
            const checkExistingSession = async () => {
                setIsAutoSigningIn(true);
                try {
                    // Privy handles this automatically, but we can add custom logic here if needed
                } catch (error) {
                    console.error('Auto sign-in error:', error);
                } finally {
                    setIsAutoSigningIn(false);
                }
            };

            checkExistingSession();
        }
    }, [ready, authenticated, isLoading]);

    return {
        login,
        logout,
        isLoading: isLoading || ready,
        isAuthenticated,
        user,
        isAutoSigningIn,
        address
    };
}
