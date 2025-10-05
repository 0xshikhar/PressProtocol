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
    const { title, content, tags, cid, signature, identityId, mirrors } = body;

    if (!title || !content || !cid || !signature || !identityId) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Verify identity belongs to user
    const identity = await prisma.identity.findUnique({
      where: { id: identityId },
    });

    if (!identity || identity.userId !== user.id) {
      return NextResponse.json(
        { error: "Invalid identity" },
        { status: 403 }
      );
    }

    // Create content record
    const newContent = await prisma.content.create({
      data: {
        cid,
        title,
        content,
        tags: tags || [],
        signature,
        userId: user.id,
        identityId,
      },
    });

    // Create mirror records
    if (mirrors) {
      const mirrorData = [];
      if (mirrors.ipfs) {
        mirrorData.push({
          contentId: newContent.id,
          type: "ipfs",
          url: mirrors.ipfs.url,
          available: mirrors.ipfs.available ?? true,
          latency: mirrors.ipfs.latency,
        });
      }
      if (mirrors.tor) {
        mirrorData.push({
          contentId: newContent.id,
          type: "tor",
          url: mirrors.tor.url,
          available: mirrors.tor.available ?? true,
          latency: mirrors.tor.latency,
        });
      }
      if (mirrors.gateway) {
        mirrorData.push({
          contentId: newContent.id,
          type: "gateway",
          url: mirrors.gateway.url,
          available: mirrors.gateway.available ?? true,
          latency: mirrors.gateway.latency,
        });
      }

      await prisma.mirror.createMany({
        data: mirrorData,
      });
    }

    return NextResponse.json({
      success: true,
      content: newContent,
      shareUrl: `anonpress://${cid}`,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);

    const where = tags && tags.length > 0 ? { tags: { hasSome: tags } } : {};

    const contents = await prisma.content.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      contents: contents.map((c) => ({
        cid: c.cid,
        title: c.title,
        tags: c.tags,
        createdAt: c.createdAt,
        publisher: {
          walletAddress: c.user.walletAddress,
          username: c.user.username,
          avatar: c.user.avatar,
          publicKey: c.identity.publicKey,
        },
        mirrors: c.mirrors.reduce(
          (acc, m) => {
            acc[m.type as "ipfs" | "tor" | "gateway"] = {
              url: m.url,
              available: m.available,
              latency: m.latency,
            };
            return acc;
          },
          {} as Record<string, any>
        ),
      })),
    });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json(
      { error: "Failed to fetch contents" },
      { status: 500 }
    );
  }
}
