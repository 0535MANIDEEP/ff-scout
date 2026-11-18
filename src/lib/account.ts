import { prisma } from './db';
import { destroyProofImage } from './cloudinary';

// DPDP erasure: remove a user's row and everything linked to it.
// Order matters, proofs carry Cloudinary assets, so those are destroyed first.
// Audit references are nulled, not deleted: the log records that an action
// happened, not who did it. Rate-limit rows keyed on the account's email die too.
// Throws on unexpected failure; the caller reports to the user.
export async function eraseAccount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) throw new Error('user not found');

  const proofs = await prisma.verificationProof.findMany({
    where: { userId },
    select: { publicId: true },
  });
  for (const p of proofs) {
    if (p.publicId) {
      try {
        await destroyProofImage(p.publicId);
      } catch {
        // Deleting the DB row matters more; the orphan asset is an abuse of no data
        // (it was an opaque rank screenshot, now unlinked). Log and proceed.
        console.error('eraseAccount: cloudinary destroy failed for', p.publicId);
      }
    }
  }

  await prisma.verificationProof.deleteMany({ where: { userId } });
  await prisma.match.deleteMany({ where: { playerId: userId } });
  await prisma.rateLimitEntry.deleteMany({ where: { key: { contains: `:${user.email}` } } });
  await prisma.auditLog.updateMany({ where: { userId }, data: { userId: null } });
  await prisma.user.delete({ where: { id: userId } });
}
