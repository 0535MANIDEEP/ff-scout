'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/shared/db/client';
import { getCurrentUser } from '@/shared/auth/session';
import { revalidatePath } from 'next/cache';
import { RANKS, ROLE_IDS } from '@/lib/config';
import { normalizeTeamName, isValidTeamName } from '@/lib/team';

const schema = z.object({
  displayName: z.string().trim().min(2).max(40),
  gameUid: z.string().regex(/^\d{5,15}$/, 'UID is 5 to 15 digits'),
  brRank: z.enum(RANKS as [string, ...string[]]),
  csRank: z.enum(RANKS as [string, ...string[]]),
  role: z.enum(ROLE_IDS),
  city: z.string().trim().min(2).max(80),
  teamName: z.string().trim().max(30).optional(),
});

export async function saveProfile(formData: FormData) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  const parsed = schema.safeParse({
    displayName: formData.get('displayName'),
    gameUid: formData.get('gameUid'),
    brRank: formData.get('brRank'),
    csRank: formData.get('csRank'),
    role: formData.get('role'),
    city: formData.get('city'),
    teamName: formData.get('teamName'),
  });
  if (!parsed.success) redirect('/player?e=invalid');
  const d = parsed.data;

  // partial-team rule (team-name feature): empty clears; 2–30 chars; longer rejected.
  const team = normalizeTeamName(d.teamName);
  if (team && !isValidTeamName(team)) redirect('/player?e=team');

  await prisma.user.update({
    where: { id: s.id },
    data: { displayName: d.displayName, gameUid: d.gameUid, brRank: d.brRank, csRank: d.csRank, role: d.role as any, city: d.city, teamName: team || null },
  });
  revalidatePath('/player');
  redirect('/player?done=1');
}

export async function leaveMatch(formData: FormData) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  const matchId = String(formData.get('matchId') ?? '');
  if (!matchId) redirect('/player?e=invalid');
  await prisma.matchEntry.deleteMany({ where: { matchId, playerId: s.id } });
  revalidatePath('/player');
  revalidatePath(`/matches/${matchId}`);
  redirect('/player?done=1');
}
