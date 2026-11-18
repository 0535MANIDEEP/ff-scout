import { PrismaClient } from '@prisma/client';

// In development, Hot Module Reload re-imports this file on every change,
// which would leak connections. Pin the client to globalThis so the pool
// survives reloads and only lives in one place per process.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
