import 'server-only';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { identitySchemas } from './schema';
import { createUser, findUserByEmail, writeAudit } from './repository';
import {
  createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS,
  LEGACY_SESSION_COOKIE_NAME,
  type SessionUser,
} from '@/shared/auth/session';

export async function login(input: unknown): Promise<SessionUser | null> {
  const parsed = identitySchemas.login.safeParse(input);
  if (!parsed.success) return null;
  const email = parsed.data.email;
  const user = await findUserByEmail(email);
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) return null;
  const token = await createSessionToken(user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  await writeAudit(user.id, 'login', JSON.stringify({ email, type: user.userType }));
  return {
    id: user.id, email: user.email, displayName: user.displayName,
    userType: user.userType, postingPausedUntil: user.postingPausedUntil,
  };
}

export async function signUp(input: unknown): Promise<SessionUser> {
  const parsed = identitySchemas.signUp.parse(input);
  const email = parsed.email.toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) throw new Error('EMAIL_TAKEN');
  let user;
  try {
    user = await createUser({
      email,
      passwordHash: await hash(parsed.password, 12),
      displayName: parsed.displayName.trim(),
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new Error('EMAIL_TAKEN');
    }
    throw err;
  }
  const token = await createSessionToken(user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  await writeAudit(user.id, 'signup', JSON.stringify({ email }));
  return {
    id: user.id, email: user.email, displayName: user.displayName,
    userType: user.userType, postingPausedUntil: user.postingPausedUntil,
  };
}

export async function logout(): Promise<void> {
  const { revokeSessionToken } = await import('@/shared/auth/session');
  const jar = await cookies();
  await revokeSessionToken(jar.get(SESSION_COOKIE_NAME)?.value);
  jar.delete(SESSION_COOKIE_NAME);
  jar.delete(LEGACY_SESSION_COOKIE_NAME);
}
