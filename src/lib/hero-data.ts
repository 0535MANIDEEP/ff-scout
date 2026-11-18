import { prisma } from '@/lib/db';

export interface HeroRosterEntry {
  id: string;
  displayName: string;
  rank: string;
  role: string | null;
  college: string | null;
  city: string;
}

export interface HeroContext {
  totalVerified: number;
  pendingCount: number;
  collegeCount: number;
  roster: HeroRosterEntry[];
}

// Hero reads counts and the latest roster on every request. Deliberately
// no thank-you numbers and no auto-magic — counts come from the database
// exactly as they are today, warts and all.
export async function buildHeroContext(): Promise<HeroContext> {
  const [totalVerified, pendingCount, collegeRows, roster] = await Promise.all([
    prisma.user.count({ where: { userType: 'player', verified: true } }),
    prisma.verificationProof.count({ where: { status: 'pending' } }),
    prisma.user.findMany({
      where: { userType: 'player', verified: true, college: { not: null } },
      select: { college: true },
      distinct: ['college'],
    }),
    prisma.user.findMany({
      where: { userType: 'player', verified: true },
      select: { id: true, displayName: true, rank: true, role: true, college: true, city: true },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    }),
  ]);
  return { totalVerified, pendingCount, collegeCount: collegeRows.length, roster };
}
