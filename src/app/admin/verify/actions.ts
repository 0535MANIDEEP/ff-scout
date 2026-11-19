'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export async function reviewProof(formData: FormData) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  const role = s ? roleFromDb(s.userType) : 'player';
  if (!s || !hasPermission(role, 'proof:review')) return;
  const id = String(formData.get('id') ?? '');
  const verdict = String(formData.get('verdict') ?? '');
  if (!id || (verdict !== 'approve' && verdict !== 'reject')) return;
  const reviewerNoteRaw = String(formData.get('reviewerNote') ?? '').trim().slice(0, 280);
  // Verifiers must always leave a reason on rejection; admins may reject silently.
  if (verdict === 'reject' && role === 'verifier' && !reviewerNoteRaw) return;
  if (verdict === 'approve') {
    // Proof flip + player verified flip + audit entry must be all-or-nothing.
    await prisma.$transaction(async (tx) => {
      const proof = await tx.verificationProof.update({
        where: { id },
        data: { status: 'approved', reviewedAt: new Date(), reviewerId: s.userId },
      });
      await tx.user.update({ where: { id: proof.userId }, data: { verified: true } });
      await tx.auditLog.create({
        data: { userId: s.userId, action: 'proof_approved', detail: JSON.stringify({ proofId: id, playerId: proof.userId, by: role }) },
      });
    });
  } else {
    const reviewerNote = reviewerNoteRaw || null;
    await prisma.$transaction(async (tx) => {
      await tx.verificationProof.update({
        where: { id },
        data: { status: 'rejected', reviewedAt: new Date(), reviewerId: s.userId, reviewerNote },
      });
      await tx.auditLog.create({
        data: { userId: s.userId, action: 'proof_rejected', detail: JSON.stringify({ proofId: id, note: reviewerNote, by: role }) },
      });
    });
  }
  revalidatePath('/admin/verify');
  redirect('/admin/verify');
}
