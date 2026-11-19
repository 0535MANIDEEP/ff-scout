import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';

// CSV cells: quote when they contain a comma/quote/newline, and prefix any
// value that starts with = + - @ so a downloaded sheet can't execute formulas.
function csvCell(v: string): string {
  let out = v;
  if (/^[=+\-@]/.test(out)) out = `'${out}`;
  if (/[",\n\r]/.test(out)) out = `"${out.replace(/"/g, '""')}"`;
  return out;
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');
  if (session.userType !== 'organizer' && session.userType !== 'admin') redirect('/player');

  const players = await prisma.user.findMany({
    where: { userType: 'player', verified: true },
    orderBy: { rank: 'asc' },
    select: { displayName: true, rank: true, role: true, iglCapable: true, college: true, city: true, status: true, proofs: { select: { gameUid: true }, where: { status: 'approved' }, take: 1 } },
  });
  const header = 'handle,rank,role,igl,affiliation,city,status,gameUid';
  const rows = players.map(p =>
    [p.displayName, p.rank, p.role ?? '', p.iglCapable ? 'yes' : 'no', p.college ?? '', p.city, p.status, p.proofs[0]?.gameUid ?? ''].map(csvCell).join(',')
  );
  const body = [header, ...rows].join('\n');
  try {
    await prisma.auditLog.create({ data: { userId: session.userId, action: 'shortlist_download', detail: JSON.stringify({ count: players.length }) } });
  } catch { /* audit failure must not block the download */ }
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="ffscout-shortlist.csv"',
      'cache-control': 'no-store',
    },
  });
}
