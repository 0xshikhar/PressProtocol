import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const user = getAuthUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                walletAddress: true,
                username: true,
                createdAt: true,
                lastLoginAt: true,
            }
        });

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: userData });
    } catch (error) {
        console.error('Error validating token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 