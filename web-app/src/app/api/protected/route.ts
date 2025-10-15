import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(request: NextRequest) {
    const user = getAuthUser();
    console.log('auth user:', user);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return authenticated user data from JWT (stateless)
    return NextResponse.json({
        user: {
            walletAddress: user.address,
        }
    });
} 