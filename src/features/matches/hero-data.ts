import { prisma } from '@/shared/db/client';

export interface HeroMatchEntry {
  id: string;
  title: string;
  mode: string;
  gameType: string;
  date: Date;
  city: string;
  entry: string;
  prize: string;
}

export interface HeroContext {
  openMatchCount: number;
  totalPlayers: number;
  matches: HeroMatchEntry[];
}

// Hero reads counts and the latest open matches on every request. Deliberately
// no invented numbers — every figure comes from the database exactly as it is.
export async function buildHeroContext(): Promise<HeroContext> {
  const [openMatchCount, totalPlayers, matches] = await Promise.all([
    prisma.match.count({ where: { status: 'open' } }),
    prisma.user.count({ where: { userType: 'player' } }),
    prisma.match.findMany({
      where: { status: 'open' },
      orderBy: { date: 'asc' },
      take: 6,
      select: { id: true, title: true, mode: true, gameType: true, date: true, city: true, entry: true, prize: true },
    }),
  ]);
  return { openMatchCount, totalPlayers, matches };
}
