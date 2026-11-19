'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function reviewProof(formData: FormData) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s || s.userType !== 'admin') return;
  const id = String(formData.get('id') ?? '');
  const verdict = String(formData.get('verdict') ?? '');
  if (!id || (verdict !== 'approve' && verdict !== 'reject')) return;
  if (verdict === 'approve') {
    // Proof flip + player verified flip + audit entry must be all-or-nothing.
    await prisma.$transaction(async (tx) => {
      const proof = await tx.verificationProof.update({
        where: { id },
        data: { status: 'approved', reviewedAt: new Date(), reviewerId: s.userId },
      });
      await tx.user.update({ where: { id: proof.userId }, data: { verified: true } });
      await tx.auditLog.create({
        data: { userId: s.userId, action: 'proof_approved', detail: JSON.stringify({ proofId: id, playerId: proof.userId }) },
      });
    });
  } else {
    const reviewerNote = String(formData.get('reviewerNote') ?? '').trim().slice(0, 280) || null;
    await prisma.$transaction(async (tx) => {
      await tx.verificationProof.update({
        where: { id },
        data: { status: 'rejected', reviewedAt: new Date(), reviewerId: s.userId, reviewerNote },
      });
      await tx.auditLog.create({
        data: { userId: s.userId, action: 'proof_rejected', detail: JSON.stringify({ proofId: id, note: reviewerNote }) },
      });
    });
  }
  revalidatePath('/admin/verify');
  redirect('/admin/verify');
}
