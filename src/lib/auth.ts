import { SignJWT, jwtVerify } from 'jose';

// Signing key for session cookies. The hard-coded 'dev-only' fallback exists
// so a local developer never sees "could not verify session" on day one —
// but production must set SESSION_SECRET via the hosted platform's env.
// If you change this string, every cookie signed with the old one dies at
// the next deploy; all users will be logged out once.
const encoder = new TextEncoder();
const secret = encoder.encode(
  process.env.SESSION_SECRET || 'dev-only-not-for-production-ff-scout-secret-key-very-long'
);

export interface SessionPayload {
  userId: string;
  userType: 'player' | 'organizer' | 'admin';
  displayName: string;
  email: string;
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

// Returns null for every failure (missing token, wrong key, expired) — the
// caller must treat null as "not logged in", never as an internal error.
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
