'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function setMatchStatus(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:manage')) redirect('/player');

  const matchId = String(formData.get('matchId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!matchId || !['open', 'closed'].includes(status)) redirect('/player/posted?e=invalid');

  const match = await prisma.match.findUnique({ where: { id: matchId }, select: { organizerId: true } });
  if (!match || match.organizerId !== s.userId) redirect('/player/posted?e=forbidden');

  await prisma.match.update({ where: { id: matchId }, data: { status } });
  revalidatePath('/player/posted');
  redirect('/player/posted?done=1');
}
