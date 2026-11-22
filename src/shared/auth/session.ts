import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/shared/db/client';

export const SESSION_COOKIE_NAME = 'fc_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  userType: 'player' | 'sponsor' | 'admin';
  postingPausedUntil: Date | null;
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSessionToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  });
  return token;
}

export async function readSessionUserId(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const row = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { userId: true, expiresAt: true, revokedAt: true },
  });
  if (!row || row.revokedAt || row.expiresAt.getTime() <= Date.now()) return null;
  return row.userId;
}

export async function revokeSessionToken(token: string | undefined): Promise<void> {
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const userId = await readSessionUserId(jar.get(SESSION_COOKIE_NAME)?.value);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, userType: true, postingPausedUntil: true },
  });
  if (!user) return null;
  return user as SessionUser;
}
