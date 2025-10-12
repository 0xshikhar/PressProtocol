import { headers } from 'next/headers';

export interface AuthUser {
    userId: string;
    address: string;
}

export function getAuthUser(): AuthUser | null {
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    const address = headersList.get('x-user-address');

    if (!userId || !address) {
        return null;
    }

    return { userId, address };
} 