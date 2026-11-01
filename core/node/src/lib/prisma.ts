// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { sovereignPrisma } from './sovereign-prisma.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function initPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  if (!env.DATABASE_URL) {
    // Pure sovereign mode: serve the Prisma API from the embedded JSON store on disk
    console.log('📁 DATABASE_URL not set — using the embedded sovereign store (DATA_DIR/db/store.json)');
    return sovereignPrisma as unknown as PrismaClient;
  }
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (err: any) {
    console.warn('Prisma client unavailable, falling back to sovereign in-memory proxy:', err?.message || err);
    return sovereignPrisma as unknown as PrismaClient;
  }
}

export const prisma = initPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
