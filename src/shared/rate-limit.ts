import { prisma } from '@/shared/db/client';

export type RateLimitOutcome = { ok: true } | { ok: false; retryAfterSeconds: number };

const WINDOW_MS = 15 * 60 * 1000;         // 15 minutes
const MAX_ATTEMPTS = 8;

export async function checkRateLimit(key: string, maxAttempts = MAX_ATTEMPTS, windowMs = WINDOW_MS): Promise<RateLimitOutcome> {
  try {
    const windowStart = new Date(Date.now() - windowMs);
    await prisma.rateLimitEntry.deleteMany({
      where: { key, createdAt: { lt: windowStart } },
    });
    const recent = await prisma.rateLimitEntry.count({
      where: { key, createdAt: { gte: windowStart } },
    });
    if (recent >= maxAttempts) {
      const oldest = await prisma.rateLimitEntry.findFirst({
        where: { key, createdAt: { gte: windowStart } },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      });
      const retryAfterSeconds = oldest
        ? Math.max(1, Math.ceil((oldest.createdAt.getTime() + windowMs - Date.now()) / 1000))
        : Math.ceil(windowMs / 1000);
      return { ok: false, retryAfterSeconds };
    }
    await prisma.rateLimitEntry.create({ data: { key } });
    return { ok: true };
  } catch {
    // If the rate limit table fails, refuse closed. Never let an outage widen login access.
    return { ok: false, retryAfterSeconds: 60 };
  }
}
