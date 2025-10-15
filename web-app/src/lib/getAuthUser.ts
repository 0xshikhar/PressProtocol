import { headers } from 'next/headers';

export interface AuthUser {
    address: string;
}

export function getAuthUser(): AuthUser | null {
    const headersList = headers();
    const address = headersList.get('x-user-address');

    if (!address) {
        return null;
    }

    return { address };
} 