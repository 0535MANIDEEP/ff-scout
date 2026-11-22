import { prisma } from '@/shared/db/client';

// DPDP erasure: remove a user's row and everything linked to it.
// Order matters: joins first, then matches this user organized (cascade removes
// their rosters), then rate-limit rows keyed on the account's email.
// Audit references are nulled, not deleted: the log records that an action
// happened, not who did it. Throws on unexpected failure; the caller reports.
export async function eraseAccount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) throw new Error('user not found');

  await prisma.matchEntry.deleteMany({ where: { playerId: userId } });
  await prisma.match.deleteMany({ where: { organizerId: userId } });
  await prisma.rateLimitEntry.deleteMany({ where: { key: { contains: `:${user.email}` } } });
  await prisma.auditLog.updateMany({ where: { userId }, data: { userId: null } });
  await prisma.user.delete({ where: { id: userId } });
}
