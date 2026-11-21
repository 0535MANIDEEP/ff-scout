'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { RANKS, ROLE_IDS } from '@/lib/config';

const schema = z.object({
  displayName: z.string().trim().min(2).max(40),
  gameUid: z.string().regex(/^\d{5,15}$/, 'UID is 5 to 15 digits'),
  brRank: z.enum(RANKS as [string, ...string[]]),
  csRank: z.enum(RANKS as [string, ...string[]]),
  role: z.enum(ROLE_IDS),
  city: z.string().trim().min(2).max(80),
});

export async function saveProfile(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  const parsed = schema.safeParse({
    displayName: formData.get('displayName'),
    gameUid: formData.get('gameUid'),
    brRank: formData.get('brRank'),
    csRank: formData.get('csRank'),
    role: formData.get('role'),
    city: formData.get('city'),
  });
  if (!parsed.success) redirect('/player?e=invalid');
  const d = parsed.data;
  await prisma.user.update({
    where: { id: s.userId },
    data: { displayName: d.displayName, gameUid: d.gameUid, brRank: d.brRank, csRank: d.csRank, role: d.role as any, city: d.city },
  });
  revalidatePath('/player');
  redirect('/player?done=1');
}

export async function setSponsorVisibility(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  const visible = formData.get('visible') === 'on';
  await prisma.user.update({ where: { id: s.userId }, data: { visibleToSponsors: visible } });
  revalidatePath('/player');
  redirect('/player?done=1');
}

export async function leaveMatch(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  const matchId = String(formData.get('matchId') ?? '');
  if (!matchId) redirect('/player?e=invalid');
  await prisma.matchEntry.deleteMany({ where: { matchId, playerId: s.userId } });
  revalidatePath('/player');
  revalidatePath(`/matches/${matchId}`);
  redirect('/player?done=1');
}
