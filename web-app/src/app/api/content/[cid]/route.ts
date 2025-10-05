import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    const { cid } = params;

    const content = await prisma.content.findUnique({
      where: { cid },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
            avatar: true,
          },
        },
        identity: {
          select: {
            publicKey: true,
          },
        },
        mirrors: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const mirrors = content.mirrors.reduce(
      (acc, m) => {
        acc[m.type as "ipfs" | "tor" | "gateway"] = {
          url: m.url,
          available: m.available,
          latency: m.latency,
        };
        return acc;
      },
      {} as Record<string, any>
    );

    // Determine recommended mirror based on availability and latency
    let recommended: "ipfs" | "tor" | "gateway" = "gateway";
    if (mirrors.ipfs?.available) {
      recommended = "ipfs";
    } else if (mirrors.tor?.available) {
      recommended = "tor";
    }

    return NextResponse.json({
      cid: content.cid,
      title: content.title,
      content: content.content,
      tags: content.tags,
      createdAt: content.createdAt,
      mirrors,
      recommended,
      publisher: {
        walletAddress: content.user.walletAddress,
        username: content.user.username,
        avatar: content.user.avatar,
        pubkey: content.identity.publicKey,
        signature: content.signature,
      },
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
