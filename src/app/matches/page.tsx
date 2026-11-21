import Link from 'next/link';
import { prisma } from '@/lib/db';
import { MATCH } from '@/lib/config';

export const metadata = { title: 'Matches, Final Circle' };
export const dynamic = 'force-dynamic';

export default async function MatchesBoard({ searchParams }: { searchParams: Promise<{ mode?: string; type?: string; city?: string; entry?: string; prize?: string }> }) {
  const sp = await searchParams;
  const mode = MATCH.modes.includes(sp.mode ?? '') ? sp.mode : undefined;
  const type = MATCH.gameTypes.includes(sp.type ?? '') ? sp.type : undefined;
  const entry = MATCH.entry.includes(sp.entry ?? '') ? sp.entry : undefined;
  const prize = MATCH.prize.includes(sp.prize ?? '') ? sp.prize : undefined;
  const city = sp.city?.trim().slice(0, 80);

  const matches = await prisma.match.findMany({
    where: {
      status: 'open',
      ...(mode ? { mode } : {}),
      ...(type ? { gameType: type } : {}),
      ...(entry ? { entry } : {}),
      ...(prize ? { prize } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    },
    orderBy: { date: 'asc' },
    take: 60,
    select: {
      id: true, title: true, mode: true, gameType: true, entry: true, entryFee: true,
      prize: true, prizePool: true, date: true, city: true, online: true, slots: true,
      organizer: { select: { displayName: true } },
    },
  });

  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <div>
          <span className="eyebrow-inline">THE BOARD · OPEN MATCHES</span>
          <h1 style={{ marginTop: 10 }}>Find a match</h1>
        </div>
        <Link href="/post" className="btn-ghost" style={{ textDecoration: 'none' }}>Post a match</Link>
      </div>

      <form method="get" action="/matches" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18, alignItems: 'flex-end' }}>
        <label className="label" style={{ margin: 0 }}>Mode
          <select className="input" name="mode" defaultValue={mode ?? ''} style={{ minWidth: 130 }}>
            <option value="">All modes</option>
            {MATCH.modes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="label" style={{ margin: 0 }}>Type
          <select className="input" name="type" defaultValue={type ?? ''} style={{ minWidth: 120 }}>
            <option value="">All types</option>
            {MATCH.gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="label" style={{ margin: 0 }}>Entry
          <select className="input" name="entry" defaultValue={entry ?? ''} style={{ minWidth: 110 }}>
            <option value="">Any entry</option>
            {MATCH.entry.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="label" style={{ margin: 0 }}>Prize
          <select className="input" name="prize" defaultValue={prize ?? ''} style={{ minWidth: 110 }}>
            <option value="">Any prize</option>
            {MATCH.prize.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="label" style={{ margin: 0 }}>City<input className="input" name="city" defaultValue={city ?? ''} placeholder="City contains…" style={{ minWidth: 150 }} /></label>
        <button className="btn" type="submit">Filter</button>
        {(mode || type || entry || prize || city) && <Link href="/matches" className="btn-ghost" style={{ textDecoration: 'none' }}>Clear</Link>}
      </form>

      {matches.length === 0 ? (
        <p className="subtext" style={{ marginTop: 28 }}>Nothing posted yet. You are looking at an honest board — the first match appears when someone posts it.</p>
      ) : (
        <div className="list" style={{ marginTop: 20 }}>
          {matches.map(m => (
            <Link key={m.id} href={`/matches/${m.id}`} className="rowitem" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: 16 }}>{m.title}</strong>
                <div className="small" style={{ marginTop: 2 }}>
                  {m.gameType} · {m.mode} · {m.online ? 'Online' : m.city} · {new Date(m.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
                <div className="small" style={{ color: 'var(--muted)' }}>posted by {m.organizer.displayName}</div>
              </div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div className="chip">{m.entry === 'paid' ? `Paid${m.entryFee ? ` · ${m.entryFee}` : ''}` : 'Free entry'}</div>
                <div className="small" style={{ marginTop: 6 }}>{m.prize === 'pool' ? `Prize ${m.prizePool ?? ''}` : 'No prize'}</div>
                {m.slots ? <div className="small" style={{ marginTop: 4 }}>{m.slots} slots</div> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
