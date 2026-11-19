'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { eraseAccount } from '@/lib/account';

// DPDP: withdraw consent / erase on request. Admins cannot self-delete here , 
// a lockout of the only moderator is a worse risk than forcing one email.
export async function deleteAccount(formData: FormData): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (s.userType === 'admin') redirect('/settings?e=admin');
  const confirm = String(formData.get('confirm') ?? '').trim().toUpperCase();
  if (confirm !== 'DELETE') redirect('/settings?e=confirm');
  const email = s.email;
  await eraseAccount(s.userId);
  try {
    await prisma.auditLog.create({ data: { action: 'account_erased', detail: JSON.stringify({ email }) } });
  } catch {
    // best effort, the row is already gone
  }
  jar.delete(SESSION_COOKIE_NAME);
  redirect('/?erased=1');
}

export async function setAvailability(formData: FormData): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  const raw = String(formData.get('status') ?? '');
  if (!['looking', 'playing', 'inactive'].includes(raw)) redirect('/settings');
  await prisma.user.update({ where: { id: s.userId }, data: { status: raw } });
  try {
    await prisma.auditLog.create({ data: { userId: s.userId, action: 'availability_set', detail: raw } });
  } catch { /* audit must not block */ }
  redirect('/settings');
}

export async function setIgl(formData: FormData): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (s.userType !== 'player') redirect('/settings');
  const value = formData.get('igl') === 'on';
  await prisma.user.update({ where: { id: s.userId }, data: { iglCapable: value } });
  redirect('/settings');
}
