import 'server-only';
import { prisma } from '@/shared/db/client';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(d: { email: string; passwordHash: string; displayName: string }) {
  return prisma.user.create({
    data: {
      email: d.email,
      passwordHash: d.passwordHash,
      displayName: d.displayName,
      userType: 'player',
      city: 'India',
      role: 'rusher',
      consentedAt: new Date(),
      ageConfirmed: true,
    },
  });
}

export async function writeAudit(userId: string, action: 'login' | 'signup', detail: string) {
  try {
    await prisma.auditLog.create({ data: { userId, action, detail } });
  } catch { /* never let an audit-write failure block auth */ }
}
