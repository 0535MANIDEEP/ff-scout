import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import { RANKS } from '@/lib/config';

// CSV cells: quote when they contain a comma/quote/newline, and prefix any
// value that starts with = + - @ so a downloaded sheet can't execute formulas.
function csvCell(v: string): string {
  let out = v;
  if (/^[=+\-@]/.test(out)) out = `'${out}`;
  if (/[",\n\r]/.test(out)) out = `"${out.replace(/"/g, '""')}"`;
  return out;
}

export async function GET(request: Request) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'talent:export')) redirect('/player');

  const url = new URL(request.url);
  const city = url.searchParams.get('city')?.trim().slice(0, 80);
  const rank = RANKS.includes(url.searchParams.get('rank') ?? '') ? url.searchParams.get('rank')! : undefined;
  const role = url.searchParams.get('role') ?? undefined;

  const players = await prisma.user.findMany({
    where: {
      userType: 'player',
      visibleToSponsors: true,
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(rank ? { OR: [{ brRank: rank }, { csRank: rank }] } : {}),
      ...(role ? { role: role as 'rusher' | 'sniper' | 'support' | 'anchor' | 'lurker' } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 5000,
    select: { displayName: true, gameUid: true, brRank: true, csRank: true, role: true, city: true },
  });

  const header = 'displayName,gameUid,brRank,csRank,role,city';
  const rows = players.map(p =>
    [p.displayName, p.gameUid ?? '', p.brRank ?? '', p.csRank ?? '', p.role ?? '', p.city].map(csvCell).join(','),
  );
  const body = [header, ...rows].join('\n');

  try {
    await prisma.auditLog.create({ data: { userId: s.id, action: 'talent_export', detail: JSON.stringify({ count: players.length }) } });
  } catch { /* audit failure must not block the download */ }

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="final-circle-candidates.csv"',
      'cache-control': 'no-store',
    },
  });
}
