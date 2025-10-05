import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple in-memory cache to prevent duplicate checks
const recentChecks: Record<string, number> = {};
const CACHE_TTL = 5000; // 5 seconds

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const normalizedAddress = address;

    // Check if we've recently processed this address
    const lastChecked = recentChecks[normalizedAddress];
    const now = Date.now();

    if (lastChecked && now - lastChecked < CACHE_TTL) {
        console.log(`Using cached result for address: ${normalizedAddress}`);
        // Return the same result without hitting the database again
        return NextResponse.json({ exists: true, cached: true });
    }

    // Update the cache
    recentChecks[normalizedAddress] = now;

    // Clean up old cache entries periodically
    if (Object.keys(recentChecks).length > 100) {
        for (const addr in recentChecks) {
            if (now - recentChecks[addr] > CACHE_TTL) {
                delete recentChecks[addr];
            }
        }
    }

    try {
        console.log(`Checking database for user with address: ${normalizedAddress}`);
        const user = await prisma.user.findUnique({
            where: { walletAddress: normalizedAddress },
            select: { id: true }
        });

        return NextResponse.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking user:', error);
        return NextResponse.json({ error: 'Failed to check user' }, { status: 500 });
    }
} 