// @ts-ignore
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function initPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (err: any) {
    console.warn('Prisma client unavailable, falling back to sovereign in-memory proxy:', err?.message || err);
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        return new Proxy({}, {
          get(_modelTarget, method) {
            return async () => {
              throw new Error(`Database operation prisma.${String(prop)}.${String(method)}() called, but PrismaClient is not initialized or database is unavailable in pure sovereign mode.`);
            };
          }
        });
      }
    });
  }
}

export const prisma = initPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
