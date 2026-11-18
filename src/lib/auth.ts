import { SignJWT, jwtVerify } from 'jose';

export const runtime = 'nodejs';

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

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
