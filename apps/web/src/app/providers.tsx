'use client';

import * as React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import 'dotenv/config';

import {
    mainnet,
    sepolia
} from 'wagmi/chains';
import { agentChain } from '@/lib/customChain';
import { createConfig } from 'wagmi';
import { http } from 'viem';

// Configure wagmi client
const config = createConfig({
    chains: [mainnet, sepolia, agentChain],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [agentChain.id]: http(),
    },
});

const queryClient = new QueryClient();

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    const content = mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>;

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {PRIVY_APP_ID && PRIVY_APP_ID.length > 5 ? (
                    <PrivyProvider
                        appId={PRIVY_APP_ID}
                        config={{
                            loginMethods: ['wallet', 'email', 'google'],
                            appearance: {
                                theme: 'dark',
                                accentColor: '#06B6D4',
                            },
                            embeddedWallets: {
                                createOnLogin: 'users-without-wallets',
                            },
                        }}
                    >
                        {content}
                    </PrivyProvider>
                ) : (
                    content
                )}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
