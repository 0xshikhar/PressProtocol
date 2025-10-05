import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { publicKey } = body;

    if (!publicKey) {
      return NextResponse.json(
        { error: "Public key is required" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: authUser.wallet.address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: authUser.wallet.address,
        },
      });
    }

    // Create identity
    const identity = await prisma.identity.create({
      data: {
        userId: user.id,
        publicKey,
      },
    });

    return NextResponse.json({
      success: true,
      identity: {
        id: identity.id,
        publicKey: identity.publicKey,
        createdAt: identity.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating identity:", error);
    return NextResponse.json(
      { error: "Failed to create identity" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: authUser.wallet.address },
      include: {
        identities: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ identities: [] });
    }

    return NextResponse.json({
      identities: user.identities.map((i) => ({
        id: i.id,
        publicKey: i.publicKey,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching identities:", error);
    return NextResponse.json(
      { error: "Failed to fetch identities" },
      { status: 500 }
    );
  }
}
