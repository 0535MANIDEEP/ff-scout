import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/db/client';
import { getCurrentUser } from '@/shared/auth/session';
import { reportSchemas } from './schema';
import {
  PAYMENT_REPORT_CATEGORY, PAYMENT_REPORT_THRESHOLD, PAYMENT_REPORT_PAUSE_DAYS,
} from '@/features/disclosure/copy';

export type ReportResult =
  | { ok: true; enforced: boolean }
  | { ok: false; reason: 'UNAUTHENTICATED' | 'INVALID' | 'DUPLICATE' };

export async function reportMatch(input: unknown): Promise<ReportResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: 'UNAUTHENTICATED' };

  const parsed = reportSchemas.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'INVALID' };
  const d = parsed.data;

  let enforced = false;
  try {
    await prisma.$transaction(async tx => {
      await tx.report.create({
        data: {
          matchId: d.matchId, reporterId: user.id,
          category: d.category, reason: d.reason,
        },
      });
      if (d.category !== PAYMENT_REPORT_CATEGORY) return;
      const joinedReports = await tx.report.count({
        where: {
          matchId: d.matchId,
          category: PAYMENT_REPORT_CATEGORY,
          reporter: { entries: { some: { matchId: d.matchId } } },
        },
      });
      if (joinedReports < PAYMENT_REPORT_THRESHOLD) return;
      const match = await tx.match.findUnique({
        where: { id: d.matchId },
        select: { organizerId: true, status: true },
      });
      if (!match || match.status === 'closed') return;
      await tx.match.update({ where: { id: d.matchId }, data: { status: 'closed' } });
      await tx.user.updateMany({
        where: { id: match.organizerId, postingPausedUntil: null },
        data: { postingPausedUntil: new Date(Date.now() + PAYMENT_REPORT_PAUSE_DAYS * 86400000) },
      });
      // The audit write belongs in the ACTION after the transaction (see Step 3).
      enforced = true;
    }, { isolationLevel: 'Serializable' });
    return { ok: true, enforced };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { ok: false, reason: 'DUPLICATE' };
    }
    throw err;
  }
}
