'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb, dbRoleFor, ROLE_LABEL, type Role } from '@/lib/permissions';
import { prisma } from '@/lib/db';

const VALID: Role[] = ['player', 'verifier', 'organizer', 'admin'];

export async function setRole(formData: FormData) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'user:manage')) return;

  const userId = String(formData.get('userId') ?? '');
  const target = String(formData.get('role') ?? '') as Role;
  const reason = String(formData.get('reason') ?? '').trim().slice(0, 140);
  if (!userId || !VALID.includes(target)) redirect('/admin/roles?e=bad');
  // The audit log is only worth something if every change carries a reason.
  if (!reason) redirect('/admin/roles?e=reason');

  // Lockout guards, forget one of these and you've got a dead admin panel.
  if (userId === s.userId && target !== 'admin') redirect('/admin/roles?e=self');
  if (target !== 'admin') {
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { userType: true } });
    if (targetUser?.userType === 'admin') {
      const adminCount = await prisma.user.count({ where: { userType: 'admin' } });
      if (adminCount <= 1) redirect('/admin/roles?e=last');
    }
  }

  await prisma.$transaction(async (tx) => {
    const before = await tx.user.findUnique({ where: { id: userId }, select: { userType: true, email: true } });
    await tx.user.update({ where: { id: userId }, data: { userType: dbRoleFor(target) as 'player' | 'organizer' | 'admin' | 'moderator' } });
    await tx.auditLog.create({
      data: { userId: s.userId, action: 'role_change', detail: JSON.stringify({ target: userId, email: before?.email, from: before?.userType, to: target, reason, by: roleFromDb(s.userType) }) },
    });
  });
  revalidatePath('/admin/roles');
  redirect('/admin/roles?done=1');
}
