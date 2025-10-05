import { NextRequest, NextResponse } from 'next/server';
import { generateJwtToken } from '@/lib/auth';
import { SiweMessage } from 'siwe';
import { prisma } from '@/lib/prisma';

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

    // Find or create user in database
    const user = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: { lastLoginAt: new Date() },
      create: {
        walletAddress: walletAddress.toLowerCase(),
        lastLoginAt: new Date(),
      },
    });

    console.log('User:', user);

    // Generate JWT token
    const token = generateJwtToken({
      userId: user.id,
      address: user.walletAddress,
    });

    console.log('Token:', token);

    // Return token and user data
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        avatar: user.avatar,
        bio: user.bio,
        NFTid: user.NFTid
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