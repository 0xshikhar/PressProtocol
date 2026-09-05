import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Env } from '../types';

let cachedPrisma: any = null;

export function getPrismaClient(env: Env) {
  if (!env.DATABASE_URL) {
    return null;
  }

  if (cachedPrisma) {
    return cachedPrisma;
  }

  try {
    const client = new PrismaClient({
      datasourceUrl: env.DATABASE_URL,
    }).$extends(withAccelerate());

    cachedPrisma = client;
    return client;
  } catch (err) {
    console.error('Failed to initialize Prisma Edge client:', err);
    return null;
  }
}

export interface StoredContentRecord {
  cid: string;
  title: string;
  tags: string[];
  publisherPubKey: string;
  signature: string;
  userId?: string | null;
  mirrors?: Array<{ type: string; url: string; available: boolean }>;
}

export async function indexContentInDB(
  env: Env,
  data: StoredContentRecord
): Promise<boolean> {
  const prisma = getPrismaClient(env);
  if (!prisma) return false;

  try {
    // Find or create identity if publisherPubKey is provided
    if (data.publisherPubKey) {
      await prisma.identity.upsert({
        where: { publicKey: data.publisherPubKey },
        update: {},
        create: {
          publicKey: data.publisherPubKey,
          ...(data.userId ? { userId: data.userId } : {}),
        },
      }).catch(() => {});
    }

    // Upsert content cache
    const content = await prisma.content.upsert({
      where: { cid: data.cid },
      update: {
        title: data.title,
        tags: data.tags,
        publisherPubKey: data.publisherPubKey,
        signature: data.signature,
      },
      create: {
        cid: data.cid,
        title: data.title,
        tags: data.tags,
        publisherPubKey: data.publisherPubKey,
        signature: data.signature,
        ...(data.userId ? { userId: data.userId } : {}),
      },
    });

    // Create mirror entries if provided
    if (data.mirrors && data.mirrors.length > 0) {
      for (const m of data.mirrors) {
        await prisma.mirror.create({
          data: {
            contentId: content.id,
            type: m.type,
            url: m.url,
            available: m.available,
          },
        }).catch(() => {});
      }
    }

    return true;
  } catch (err) {
    console.error(`Failed to index content CID ${data.cid} in DB:`, err);
    return false;
  }
}

export async function getRecentContentFromDB(env: Env, limit: number = 20) {
  const prisma = getPrismaClient(env);
  if (!prisma) return [];

  try {
    const contents = await prisma.content.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        mirrors: true,
      },
    });
    return contents;
  } catch (err) {
    console.error('Failed to query recent content from DB:', err);
    return [];
  }
}
