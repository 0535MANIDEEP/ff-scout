import 'server-only';
import { prisma } from '@/shared/db/client';

export async function findHost(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { postingPausedUntil: true },
  });
}

