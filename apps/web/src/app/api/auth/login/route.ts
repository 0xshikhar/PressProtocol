import { NextRequest, NextResponse } from 'next/server';
import { generateJwtToken } from '@/lib/auth';
import { SiweMessage } from 'siwe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature } = body;

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      );
    }

    console.log('Message:', message);
    console.log('Signature:', signature);

    // Verify the SIWE message
    const siweMessage = new SiweMessage(message);
    const { success, data } = await siweMessage.verify({
      signature,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Get the address from the verified message
    const walletAddress = data.address;

    console.log('Wallet Address:', walletAddress);

    // Generate JWT token (stateless auth - no database)
    const token = generateJwtToken({
      address: walletAddress.toLowerCase(),
    });

    console.log('Token:', token);

    // Return token and user data
    return NextResponse.json({
      token,
      user: {
        walletAddress: walletAddress.toLowerCase(),
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 