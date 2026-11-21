import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { MATCH } from '@/lib/config';
import { seriesEligibility } from '@/lib/series';
import { FREE_ENTRY_NOTICE } from '@/lib/free-entry';
import { privateMetadata } from '@/lib/seo';
import { createMatch } from './actions';

export const metadata = privateMetadata('Post a match, Final Circle');

const ERRORS: Record<string, string> = {
  rate: 'Too many posts in a short while. Give it a few minutes.',
  invalid: 'Check the details, something is missing or too long.',
  paused: 'Posting is paused on this account after a payment report. It reopens automatically after seven days.',
  date: 'That date is already gone. Pick an upcoming one.',
};

export default async function PostMatch({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE_NAME)?.value ?? '');
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/player');

  const { e } = await searchParams;

  const eligibility = await seriesEligibility(s.userId);

  return (
    <div className="page-narrow">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <h1>Post a match</h1>
        <Link href="/player/posted" className="btn-ghost" style={{ textDecoration: 'none' }}>Your matches</Link>
      </div>
      <p className="subtext" style={{ marginTop: 8 }}>{FREE_ENTRY_NOTICE}</p>
      {eligibility.qualified > 0 && (
        <p className="subtext" style={{ marginTop: 10 }}>
          {eligibility.qualified} of {MATCH.trustLadderMinMatches} completed matches hosted so far.
        </p>
      )}
      {eligibility.unlocked && (
        <p className="subtext" style={{ marginTop: 4 }}>
          <a href="/post/series" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 13 }}>Set up a weekly series</a>
        </p>
      )}
      {e && ERRORS[e] && <p style={{ color: 'var(--risk)', marginTop: 12, fontSize: 13 }}>{ERRORS[e]}</p>}

      <form action={createMatch} style={{ marginTop: 20, display: 'grid', gap: 14 }}>
        <label className="label">Title<input className="input" name="title" placeholder="Friday BR Squad Night" required maxLength={90} /></label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="label">Mode
            <select className="input" name="mode" required>
              {MATCH.modes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="label">Game type
            <select className="input" name="gameType" required>
              {MATCH.gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="label">Duration
            <select className="input" name="durationMinutes" required>
              {MATCH.durationOptionsMinutes.map(v => <option key={v} value={v} selected={v === MATCH.defaultDurationMinutes}>{v} min</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="label">Date and time<input className="input" name="date" type="datetime-local" required /></label>
          <label className="label">City<input className="input" name="city" placeholder="Hyderabad" required maxLength={80} /></label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="label">Slots (optional)<input className="input" name="slots" type="number" min={1} placeholder="Unlimited" /></label>
          <label className="label">Contact (Discord / WhatsApp)<input className="input" name="contact" placeholder="How players reach you" maxLength={120} /></label>
        </div>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" name="online" value="yes" />
          <span>This match is played online, not at a venue.</span>
        </label>

        <label className="label">Notes<textarea className="input" name="notes" rows={3} maxLength={500} placeholder="Format, rules, lobby details, anything players must know." /></label>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" type="submit">Post match</button>
          <Link href="/matches" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
