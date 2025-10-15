import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Stateless auth - no user database, all addresses are valid
    // This endpoint can be used for validation or other purposes
    return NextResponse.json({ exists: true });
} 