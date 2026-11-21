'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function adminSetMatchStatus(formData: FormData) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:manage')) redirect('/player');

  const matchId = String(formData.get('matchId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!matchId || !['open', 'closed'].includes(status)) redirect('/admin/matches?e=invalid');

  await prisma.match.update({ where: { id: matchId }, data: { status } });
  try {
    await prisma.auditLog.create({ data: { userId: s.userId, action: 'match_status', detail: JSON.stringify({ matchId, status }) } });
  } catch { /* audit must not block */ }
  revalidatePath('/admin/matches');
  redirect('/admin/matches?done=1');
}
