'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/shared/db/client';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/shared/auth/permissions';
import { createMatch as createMatchInService } from '@/features/matches/service';

export async function createMatch(formData: FormData) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/player');

  const input = {
    title: formData.get('title'),
    mode: formData.get('mode'),
    gameType: formData.get('gameType'),
    date: formData.get('date'),
    durationMinutes: formData.get('durationMinutes'),
    city: formData.get('city'),
    online: formData.get('online') ?? 'no',
    slots: formData.get('slots') || undefined,
    contact: formData.get('contact') || undefined,
    notes: formData.get('notes') || undefined,
  };
  let result: { title: string };
  try {
    result = await createMatchInService(input);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHENTICATED') redirect('/login');
      if (err.message === 'PAUSED') redirect('/post?e=paused');
      if (err.message === 'RATE_LIMIT') redirect('/post?e=rate');
      if (err.message === 'INVALID') redirect('/post?e=invalid');
      if (err.message === 'BAD_DATE') redirect('/post?e=date');
    }
    throw err;
  }

  try {
    await prisma.auditLog.create({ data: { userId: s.id, action: 'match_create', detail: JSON.stringify({ title: result.title }) } });
  } catch { /* audit must not block the post */ }
  redirect('/player/posted?done=1');
}
