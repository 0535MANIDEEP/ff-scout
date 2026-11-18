'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function reviewProof(formData: FormData) {
  const jar = await cookies();
  const token = jar.get('ffscout_session')?.value;
  const s = token ? await verifySession(token) : null;
  if (!s || s.userType !== 'admin') return;
  const id = String(formData.get('id'));
  const verdict = String(formData.get('verdict'));
  if (verdict === 'approve') {
    await prisma.verificationProof.update({ where: { id }, data: { status: 'approved', reviewedAt: new Date(), reviewerId: s.userId } });
    const proof = await prisma.verificationProof.findUnique({ where: { id } });
    if (proof) await prisma.user.update({ where: { id: proof.userId }, data: { verified: true } });
  } else {
    await prisma.verificationProof.update({ where: { id }, data: { status: 'rejected', reviewedAt: new Date(), reviewerId: s.userId } });
  }
  revalidatePath('/admin/verify');
  redirect('/admin/verify');
}
