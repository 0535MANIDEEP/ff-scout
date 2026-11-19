import { z } from 'zod';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { fetchLiveProfile } from '@/lib/ff-upstream';

// Exactly the regions the provider documents (https://api.gameskinbo.com/documentation).
const REGIONS = ['bd', 'ind', 'br', 'us', 'sac', 'na', 'th', 'id', 'sg', 'pk'] as const;

const schema = z.object({
  uid: z.string().regex(/^\d{5,15}$/, 'UID is 5 to 15 digits'),
  region: z.enum(REGIONS),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

// Pool half: our own verified data, free and unlimited. Only approved proofs
// for verified players count, so this row can never overstate a player.
async function poolLookup(uid: string) {
  try {
    const proof = await prisma.verificationProof.findFirst({
      where: { gameUid: uid, status: 'approved', user: { verified: true, userType: 'player' } },
      orderBy: { reviewedAt: 'desc' },
      select: { user: { select: { displayName: true, rank: true, role: true, iglCapable: true } } },
    });
    if (!proof) return { found: false };
    return { found: true, displayName: proof.user.displayName, rank: proof.user.rank, role: proof.user.role, iglCapable: proof.user.iglCapable };
  } catch {
    // Pool miss must not take the page down; the live half still answers.
    return { found: false };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = schema.safeParse({
    uid: url.searchParams.get('uid') ?? '',
    region: url.searchParams.get('region') ?? 'ind',
  });
  if (!parsed.success) {
    const bad = parsed.error.issues[0]?.path[0];
    const message = bad === 'region' ? 'Pick a supported region.' : 'Enter a UID of 5 to 15 digits.';
    return json({ error: message }, 422);
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = await checkRateLimit(`uidcheck:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.ok) return json({ error: 'Too many checks in a short while. Try again in a few minutes.' }, 429);

  const { uid, region } = parsed.data;
  const [pool, live] = await Promise.all([poolLookup(uid), fetchLiveProfile(uid, region)]);
  return json({ uid, pool, live });
}
