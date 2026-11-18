import { SignJWT, jwtVerify } from 'jose';

// Signing key for session cookies. The hard-coded 'dev-only' fallback exists
// so a local developer never sees "could not verify session" on day one , 
// but production must set SESSION_SECRET via the hosted platform's env.
// If you change this string, every cookie signed with the old one dies at
// the next deploy; all users will be logged out once.
const encoder = new TextEncoder();

// Resolved lazily on first use, not at import time, importing this module
// (e.g. during `next build`'s module evaluation) must never crash the build.
// In production, a missing SESSION_SECRET throws here so the app fails fast
// instead of signing cookies with a key that ships in source.
function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (s) return encoder.encode(s);
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET is not set. Refusing to sign or verify sessions in production with the in-source development key.');
  }
  return encoder.encode('dev-only-not-for-production-ff-scout-secret-key-very-long');
}

export interface SessionPayload {
  userId: string;
  userType: 'player' | 'organizer' | 'admin';
  displayName: string;
  email: string;
}

// One definition of the session cookie, httpOnly, lax, and `secure` in
// production only (local dev runs over http, where Secure cookies are dropped).
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export const SESSION_COOKIE_NAME = 'ffscout_session';

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

// Returns null for every failure (missing token, wrong key, expired), the
// caller must treat null as "not logged in", never as an internal error.
export async function verifySession(token: string): Promise<SessionPayload | null> {
  const secret = getSecret(); // throws in production when SESSION_SECRET is unset, loud, not silent
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
