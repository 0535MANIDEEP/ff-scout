import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const jar = await cookies();
  const token = jar.get('ffscout_session')?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect('/login');
  if (session.userType !== 'organizer' && session.userType !== 'admin') redirect('/player');

  const players = await prisma.user.findMany({
    where: { userType: 'player', verified: true },
    orderBy: { rank: 'asc' },
  });
  const header = 'handle,rank,role,affiliation,city,status';
  const rows = players.map(p =>
    [p.displayName, p.rank, p.role ?? '', p.college ?? '', p.city].join(',')
  );
  const body = [header, ...rows].join('\n');
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="ffscout-shortlist.csv"',
      'cache-control': 'no-store',
    },
  });
}
