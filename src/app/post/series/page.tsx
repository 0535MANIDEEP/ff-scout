import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { MATCH } from '@/lib/config';
import { seriesEligibility } from '@/lib/series';
import { FREE_ENTRY_NOTICE } from '@/lib/free-entry';
import { privateMetadata } from '@/lib/seo';
import { createSeries } from './actions';

export const metadata = privateMetadata('Create a weekly series, Final Circle');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LOCKED_COPY = (eligibility: Awaited<ReturnType<typeof seriesEligibility>>) =>
  `${eligibility.qualified} of ${MATCH.trustLadderMinMatches} completed matches hosted so far. You need ${MATCH.trustLadderMinMatches} hosted matches with at least ${MATCH.trustLadderMinJoins} joiners each to unlock weekly series.`;

export default async function PostSeries({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/player');

  const sp = await searchParams;
  const eligibility = await seriesEligibility(s.id);

  const PAUSED = 'Posting is paused on this account after a payment report. It reopens automatically after seven days.';
  const title = sp.e === 'paused' ? PAUSED : sp.e ? `You cannot create a series yet. ${LOCKED_COPY(eligibility)}` : `You can create a weekly series. ${LOCKED_COPY(eligibility)}`;

  if (!eligibility.unlocked) {
    return (
      <div className="page-narrow">
        <h1>Weekly series</h1>
        <p className="subtext" style={{ marginTop: 10 }}>{title}</p>
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <div>
          <h1>Create a weekly series</h1>
          <p className="subtext" style={{ marginTop: 8 }}>
            {eligibility.qualified} of {MATCH.trustLadderMinMatches} hosted matches. A weekly match appears on the board. Match terms travel with the series; joins are final.
          </p>
        </div>
        <a href="/player/posted" className="btn-ghost" style={{ textDecoration: 'none' }}>Your matches</a>
      </div>

      <form action={createSeries} style={{ marginTop: 20, display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="label">Title<input className="input" name="title" placeholder="Friday BR Squad Night" required maxLength={90} /></label>
          <label className="label">Mode
            <select className="input" name="mode" required>
              {MATCH.modes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="label">Game type
            <select className="input" name="gameType" required>
              {MATCH.gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="label">City<input className="input" name="city" placeholder="Hyderabad" required minLength={2} maxLength={80} /></label>
        </div>
        <p className="small" style={{ color: 'var(--muted)' }}>{FREE_ENTRY_NOTICE}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <label className="label">Day
            <select className="input" name="dayOfWeek" required>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </label>
          <label className="label">Start time<input className="input" name="startTimeLocal" type="time" defaultValue="20:00" required /></label>
          <label className="label">Duration
            <select className="input" name="durationMinutes" required>
              {MATCH.durationOptionsMinutes.map(v => <option key={v} value={v} selected={v === MATCH.defaultDurationMinutes}>{v} min</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="label">Online
            <select className="input" name="online" required>
              <option value="no">In-person</option>
              <option value="yes">Online</option>
            </select>
          </label>
        </div>
        <button className="btn" type="submit" style={{ marginTop: 6 }}>Create series</button>
      </form>
    </div>
  );
}
