'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser, SESSION_COOKIE_NAME } from '@/shared/auth/session';
import { prisma } from '@/shared/db/client';
import { eraseAccount } from '@/features/identity/account';

// DPDP: withdraw consent / erase on request. Admins cannot self-delete here —
// a lockout of the only admin is a worse risk than forcing one email.
export async function deleteAccount(formData: FormData): Promise<void> {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (s.userType === 'admin') redirect('/settings?e=admin');
  const confirm = String(formData.get('confirm') ?? '').trim().toUpperCase();
  if (confirm !== 'DELETE') redirect('/settings?e=confirm');
  const email = s.email;
  await eraseAccount(s.id);
  try {
    await prisma.auditLog.create({ data: { action: 'account_erased', detail: JSON.stringify({ email }) } });
  } catch {
    // best effort, the row is already gone
  }
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  redirect('/?erased=1');
}
