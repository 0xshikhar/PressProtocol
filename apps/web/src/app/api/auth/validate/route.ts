import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(request: NextRequest) {
    const user = getAuthUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return the authenticated user data from JWT (stateless)
    return NextResponse.json({ 
        user: {
            walletAddress: user.address,
        }
    });
} 