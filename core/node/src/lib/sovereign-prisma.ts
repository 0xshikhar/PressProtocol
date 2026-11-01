import { embeddedDB, EmbeddedContent, EmbeddedMirror } from './embedded-db.js';

/**
 * PrismaClient-shaped compatibility layer backed by the embedded JSON store, used when
 * DATABASE_URL is not configured (pure sovereign mode). Implements the subset of the
 * Prisma query API the node actually uses, so routes/services run unchanged.
 */

type Where = Record<string, any>;
type Query = { where?: Where; include?: Where; select?: Where; orderBy?: Where; take?: number; skip?: number };

function withIncludes(content: EmbeddedContent, include?: Where) {
  const item: any = { ...content };
  if (include?.user) {
    const user = content.userId ? embeddedDB.findUserById(content.userId) : null;
    const fields = include.user === true ? null : include.user.select;
    item.user = user
      ? fields
        ? Object.fromEntries(Object.keys(fields).map((k) => [k, (user as any)[k]]))
        : user
      : null;
  }
  if (include?.mirrors) {
    item.mirrors = embeddedDB.listMirrors(content.id);
  }
  return item;
}

function withSelect(item: any, select?: Where) {
  if (!select) return item;
  return Object.fromEntries(Object.keys(select).filter((k) => select[k]).map((k) => [k, item[k]]));
}

function matchesWhere(item: EmbeddedContent, where?: Where): boolean {
  if (!where) return true;
  if (where.OR) return where.OR.some((w: Where) => matchesWhere(item, w));
  if (where.userId !== undefined && item.userId !== where.userId) return false;
  if (where.cid !== undefined && item.cid !== where.cid) return false;
  if (where.publisherPubKey !== undefined && item.publisherPubKey !== where.publisherPubKey) return false;
  if (where.tags?.hasSome && !where.tags.hasSome.some((t: string) => item.tags.includes(t))) return false;
  if (where.title?.contains && !item.title.toLowerCase().includes(String(where.title.contains).toLowerCase())) return false;
  return true;
}

function applyPaging<T>(items: T[], query: Query): T[] {
  const skip = query.skip || 0;
  const take = query.take ?? items.length;
  return items.slice(skip, skip + take);
}

const user = {
  findUnique: async ({ where }: Query) => {
    if (where?.walletAddress) return embeddedDB.findUserByWallet(where.walletAddress);
    if (where?.id) return embeddedDB.findUserById(where.id);
    return null;
  },
  create: async ({ data }: { data: any }) => embeddedDB.upsertUser(data),
};

const identity = {
  findFirst: async ({ where }: Query) => (where?.userId ? embeddedDB.findIdentityByUserId(where.userId) : null),
  findUnique: async ({ where }: Query) => (where?.publicKey ? embeddedDB.findIdentityByPubKey(where.publicKey) : null),
  findMany: async ({ where }: Query = {}) => {
    const all = embeddedDB.listIdentities();
    return where?.userId ? all.filter((i: any) => i.userId === where.userId) : all;
  },
  create: async ({ data }: { data: any }) => embeddedDB.addIdentity(data),
};

const content = {
  create: async ({ data }: { data: any }) =>
    embeddedDB.saveContent({
      cid: data.cid,
      title: data.title,
      tags: data.tags || [],
      publisherPubKey: data.publisherPubKey,
      signature: data.signature || '',
      userId: data.userId || null,
    }),
  findUnique: async (query: Query) => {
    const record = query.where?.cid ? embeddedDB.getContent(query.where.cid) : null;
    return record ? withIncludes(record, query.include) : null;
  },
  findMany: async (query: Query = {}) => {
    const all = embeddedDB.listRecentContent(Number.MAX_SAFE_INTEGER, 0);
    const filtered = all.filter((c) => matchesWhere(c, query.where));
    if (query.orderBy?.createdAt === 'asc') filtered.reverse(); // listRecentContent is desc by default
    const paged = applyPaging(filtered, query);
    return paged.map((c) => withSelect(withIncludes(c, query.include), query.select));
  },
  count: async (query: Query = {}) =>
    embeddedDB.listRecentContent(Number.MAX_SAFE_INTEGER, 0).filter((c) => matchesWhere(c, query.where)).length,
};

const mirror = {
  findMany: async (query: Query = {}) => {
    let items: EmbeddedMirror[] = query.where?.contentId ? embeddedDB.listMirrors(query.where.contentId) : [];
    if (query.where?.available !== undefined) items = items.filter((m) => m.available === query.where!.available);
    if (query.orderBy?.latency === 'asc') {
      items = [...items].sort((a, b) => (a.latency ?? Number.MAX_SAFE_INTEGER) - (b.latency ?? Number.MAX_SAFE_INTEGER));
    }
    return applyPaging(items, query).map((m) => ({ ...m, lastCheck: new Date(m.lastCheck) }));
  },
  createMany: async ({ data }: { data: Array<{ contentId: string; type: string; url: string; available?: boolean; latency?: number | null }> }) => {
    const byContent = new Map<string, typeof data>();
    for (const m of data) {
      byContent.set(m.contentId, [...(byContent.get(m.contentId) || []), m]);
    }
    let count = 0;
    for (const [contentId, items] of byContent) {
      count += embeddedDB.addMirrors(contentId, items).length;
    }
    return { count };
  },
  update: async ({ where, data }: { where: Where; data: any }) => {
    const updated = embeddedDB.updateMirror(where.id, {
      available: data.available,
      latency: data.latency,
      lastCheck: data.lastCheck,
    });
    if (!updated) throw new Error(`Mirror "${where.id}" not found`);
    return { ...updated, lastCheck: new Date(updated.lastCheck) };
  },
};

export const sovereignPrisma = {
  user,
  identity,
  content,
  mirror,
  $queryRaw: async () => [{ '1': 1 }],
  $disconnect: async () => undefined,
};

export type SovereignPrisma = typeof sovereignPrisma;
