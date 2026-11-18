import { z } from 'zod';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.email(),
  segment: z.enum(['organizer','player','sponsor']).default('organizer'),
  city: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return new Response('Bad request', { status: 400 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return new Response('Invalid input', { status: 422 });
  // One email gets one submission per hour, this is a signup, not a mailer.
  const rl = await checkRateLimit(`waitlist:${parsed.data.email.trim().toLowerCase()}`, 3, 60 * 60 * 1000);
  if (!rl.ok) {
    return new Response(JSON.stringify({ ok: false, error: 'Too many attempts. Try later.' }), { status: 429, headers: { 'content-type': 'application/json' } });
  }
  try {
    await prisma.waitlistEntry.upsert({
      where: { email: parsed.data.email.trim().toLowerCase() },
      create: { email: parsed.data.email.trim().toLowerCase(), segment: parsed.data.segment, city: parsed.data.city || null },
      update: { segment: parsed.data.segment, city: parsed.data.city || null },
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
