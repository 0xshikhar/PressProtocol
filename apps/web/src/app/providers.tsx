'use client';

import * as React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    const content = mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>;

    return PRIVY_APP_ID && PRIVY_APP_ID.length > 5 ? (
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
    );
}
