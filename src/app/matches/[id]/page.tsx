import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { normalizeTeamName } from '@/lib/team';
import { joinMatch, leaveMatch, reportMatch } from './actions';

export const metadata = { title: 'Match, Final Circle' };

const ERRORS: Record<string, string> = {
  already: "You're already on this roster.",
  full: 'This match is full.',
  closed: 'This match is closed.',
  retry: 'Someone just took the last slot. Try once more.',
  reported: 'You already reported this match.',
  invalid: 'Something was missing. Try again.',
  team: 'Team name must be 2–30 characters.',
};

export default async function MatchDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;

  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');

  const match = await prisma.match.findUnique({
    where: { id },
    select: {
      id: true, title: true, mode: true, gameType: true, entry: true, entryFee: true,
      prize: true, prizePool: true, status: true, date: true, city: true, online: true,
      slots: true, contact: true, notes: true,
      organizer: { select: { displayName: true } },
      _count: { select: { entries: true } },
    },
  });
  if (!match) redirect('/matches');

  const joined = s
    ? await prisma.matchEntry.findFirst({ where: { matchId: id, playerId: s.userId }, select: { id: true } })
    : null;

  const closed = match.status !== 'open';
  const full = match.slots != null && match.slots <= 0;

  const profile = s
    ? await prisma.user.findUnique({ where: { id: s.userId }, select: { teamName: true } })
    : null;
  const prefillTeam = profile?.teamName ? normalizeTeamName(profile.teamName) : '';
  const isEsportsish = match.mode === 'esports' || match.mode === 'competitive';

  return (
    <div className="page-narrow">
      <Link href="/matches" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 28 }}>← All matches</Link>
      <span className="eyebrow-inline" style={{ marginTop: 20 }}>{match.gameType} · {match.mode}</span>
      <h1 style={{ marginTop: 10 }}>{match.title}</h1>
      <p className="subtext" style={{ marginTop: 6 }}>
        {match.online ? 'Online' : match.city} · {new Date(match.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })} · posted by {match.organizer.displayName}
      </p>

      {sp.joined && <p className="approved" style={{ marginTop: 12 }}>You are on this roster.</p>}
      {sp.e && ERRORS[sp.e] && <p style={{ color: 'var(--risk)', marginTop: 12, fontSize: 13 }}>{ERRORS[sp.e]}</p>}
      {sp.reported && <p className="approved" style={{ marginTop: 12 }}>Thanks, reported.</p>}

      <section className="card" style={{ marginTop: 20 }}>
        <div className="kv"><span>Entry</span><span>{match.entry === 'paid' ? `Paid · ${match.entryFee ?? 'see contact'}` : 'Free'}</span></div>
        <div className="kv"><span>Prize</span><span>{match.prize === 'pool' ? `Pool · ${match.prizePool ?? 'see notes'}` : 'None'}</span></div>
        <div className="kv"><span>Slots</span><span>{match.slots != null ? `${match.slots} left` : 'Unlimited'}</span></div>
        <div className="kv"><span>Joined</span><span>{match._count.entries}</span></div>
        {match.contact && <div className="kv"><span>Contact</span><span>{match.contact}</span></div>}
        {match.notes && <p className="subtext" style={{ marginTop: 12 }}>{match.notes}</p>}
        <p className="small" style={{ marginTop: 12, color: 'var(--muted)' }}>
          Entry fees and prize pools are settled directly between you and the host. Final Circle never handles money.
        </p>
      </section>

      <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {closed ? (
          <span className="chip">Closed</span>
        ) : full ? (
          <span className="chip">Full</span>
        ) : joined ? (
          <form action={leaveMatch}>
            <input type="hidden" name="matchId" value={match.id} />
            <button className="btn-ghost" type="submit">Leave this match</button>
          </form>
        ) : s ? (
          <form action={joinMatch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {isEsportsish && (
              <label className="label" style={{ margin: 0 }}>Team / Guild name
                <input className="input" name="teamName" defaultValue={prefillTeam} placeholder="Optional, helps hosts group squads" maxLength={30} />
              </label>
            )}
            <input type="hidden" name="matchId" value={match.id} />
            <button className="btn" type="submit">Join this match</button>
          </form>
        ) : (
          <Link href="/login" className="btn" style={{ textDecoration: 'none' }}>Log in to join</Link>
        )}
      </div>

      <details style={{ marginTop: 20 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13 }}>Report this match</summary>
        <form action={reportMatch} style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          <input type="hidden" name="matchId" value={match.id} />
          <label className="label">Why are you reporting it?<textarea className="input" name="reason" rows={3} maxLength={300} required /></label>
          <div><button className="btn-ghost" type="submit">Send report</button></div>
        </form>
      </details>
    </div>
  );
}
