import 'server-only';
import { prisma } from '@/shared/db/client';

export async function findHost(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { postingPausedUntil: true },
  });
}

export async function listOpen() {
  return prisma.match.findMany({
    where: { status: 'open' },
    orderBy: { date: 'asc' },
    select: {
      id: true, title: true, mode: true, gameType: true, date: true,
      city: true, online: true, slots: true,
      _count: { select: { entries: true } },
    },
  });
}
