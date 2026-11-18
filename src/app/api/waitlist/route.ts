import { z } from 'zod';
import { prisma } from '@/lib/db';

const schema = z.object({ email: z.string().email(), segment: z.enum(['organizer','player','sponsor']).default('organizer'), city: z.string().trim().max(80).optional() });

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return new Response('Bad request', { status: 400 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return new Response('Invalid input', { status: 422 });
  try {
    await prisma.waitlistEntry.upsert({
      where: { email: parsed.data.email },
      create: { email: parsed.data.email, segment: parsed.data.segment, city: parsed.data.city || null },
      update: { segment: parsed.data.segment, city: parsed.data.city || null },
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
