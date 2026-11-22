import 'server-only';
import { prisma } from '@/shared/db/client';
import { getCurrentUser, type SessionUser } from '@/shared/auth/session';
import { matchSchemas } from './schema';
import { findHost, listOpen } from './repository';
import { FREE_ENTRY_TERMS } from '@/features/disclosure/copy';
import { endsAtFor } from '@/features/trust/rules';
import { checkRateLimit } from '@/shared/rate-limit';
import type { Match } from '@prisma/client';

export type MatchCardDTO = {
  id: string; title: string; mode: string; gameType: string;
  date: string; city: string; online: boolean;
  slots: number | null; joined: number;
};

export function matchDTO(m: Match): MatchCardDTO {
  return {
    id: m.id, title: m.title, mode: m.mode, gameType: m.gameType,
    date: m.date.toISOString(), city: m.city, online: m.online,
    slots: m.slots, joined: 0,
  };
}

export async function createMatch(input: unknown): Promise<{ id: string; title: string }> {
  const user = await requireUser();
  const host = await findHost(user.id);
  if (host?.postingPausedUntil && host.postingPausedUntil.getTime() > Date.now()) {
    throw new Error('PAUSED');
  }
  const rl = await checkRateLimit(`postmatch:${user.id}`, 5, 15 * 60 * 1000);
  if (!rl.ok) throw new Error('RATE_LIMIT');
  const parsed = matchSchemas.create.safeParse(input);
  if (!parsed.success) throw new Error('INVALID');
  const d = parsed.data;
  if (d.date.getTime() < Date.now() - 60 * 60 * 1000) throw new Error('BAD_DATE');
  const match = await prisma.match.create({
    data: {
      organizerId: user.id,
      title: d.title, mode: d.mode, gameType: d.gameType,
      ...FREE_ENTRY_TERMS,
      status: 'open', date: d.date,
      endsAt: endsAtFor(d.date, d.durationMinutes),
      city: d.city, online: d.online === 'yes',
      slots: d.slots ?? null,
      contact: d.contact ?? null,
      notes: d.notes ?? null,
    },
  });
  return { id: match.id, title: d.title };
}

export async function joinMatch(matchId: string, teamName: string | null): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await requireUser();
  return prisma.$transaction(async tx => {
    const match = await tx.match.findUnique({ where: { id: matchId } });
    if (!match || match.status !== 'open') return { ok: false, reason: 'CLOSED' };
    if (match.organizerId === user.id) return { ok: false, reason: 'HOST' };
    const existing = await tx.matchEntry.findUnique({
      where: { matchId_playerId: { matchId, playerId: user.id } },
    });
    if (existing) return { ok: false, reason: 'DUPLICATE' };
    if (match.slots !== null) {
      const updated = await tx.match.updateMany({
        where: { id: matchId, slots: { gt: 0 } },
        data: { slots: { decrement: 1 } },
      });
      if (updated.count === 0) return { ok: false, reason: 'FULL' };
    } else {
      const stillOpen = await tx.match.count({ where: { id: matchId, status: 'open' } });
      if (stillOpen === 0) return { ok: false, reason: 'CLOSED' };
    }
    const teamStored = match.mode === 'esports' || match.mode === 'competitive' ? teamName || null : null;
    await tx.matchEntry.create({ data: { matchId, playerId: user.id, teamName: teamStored } });
    return { ok: true };
  }, { isolationLevel: 'Serializable' });
}

export async function listMatches(): Promise<MatchCardDTO[]> {
  const rows = await listOpen();
  return rows.map(r => ({
    id: r.id, title: r.title, mode: r.mode, gameType: r.gameType,
    date: r.date.toISOString(), city: r.city, online: r.online,
    slots: r.slots, joined: r._count.entries,
  }));
}

async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}
