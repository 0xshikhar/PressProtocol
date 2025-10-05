import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import { prisma } from '@/lib/prisma'; // Assuming you have a Prisma client setup

export async function GET(request: NextRequest) {
    const user = getAuthUser();
    console.log('auth user:', user);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Example: Get user data from database
        const userData = await prisma.user.findUnique({
            where: { id: user.userId }
        });

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: userData.id,
                walletAddress: userData.walletAddress,
                username: userData.username,
                createdAt: userData.createdAt,
                lastLoginAt: userData.lastLoginAt,
                // Include other fields as needed
            }
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 