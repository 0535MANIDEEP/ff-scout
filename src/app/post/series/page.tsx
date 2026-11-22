import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/shared/auth/permissions';
import { MATCH } from '@/shared/config/match';
import { seriesEligibility } from '@/features/series/service';
import { FREE_ENTRY_NOTICE } from '@/features/disclosure/copy';
import { privateMetadata } from '@/shared/seo';
import { createSeries } from './actions';
import { Field } from '@/shared/ui/Field';
import { Button } from '@/shared/ui/Button';

export const metadata = privateMetadata('Create a weekly series, Final Circle');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LOCKED_COPY = (eligibility: Awaited<ReturnType<typeof seriesEligibility>>) =>
  `${eligibility.qualified} of ${MATCH.trustLadderMinMatches} completed matches hosted so far. You need ${MATCH.trustLadderMinMatches} hosted matches with at least ${MATCH.trustLadderMinJoins} joiners each to unlock weekly series.`;

const NARROW = 'mx-auto w-full max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const LABEL_FLUSH = 'block text-sm font-bold text-ink';
const INPUT = 'w-full min-h-11 rounded-lg border border-[#CFC8B9] bg-[#FDFCF8] px-4 text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const FIELD = 'text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

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
      <div className={NARROW}>
        <h1 className={H1}>Weekly series</h1>
        <p className={`mt-[10px] ${SUBTEXT}`}>{title}</p>
      </div>
    );
  }

  return (
    <div className={NARROW}>
      <div className="mt-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className={H1}>Create a weekly series</h1>
          <p className={`mt-2 ${SUBTEXT}`}>
            {eligibility.qualified} of {MATCH.trustLadderMinMatches} hosted matches. A weekly match appears on the board. Match terms travel with the series; joins are final.
          </p>
        </div>
        <a href="/player/posted" className={GHOST}>Your matches</a>
      </div>

      <form action={createSeries} className="mt-5 grid gap-[14px]">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" id="title" name="title" placeholder="Friday BR Squad Night" required maxLength={90} className={FIELD} />
          <label className={LABEL_FLUSH}>Mode
            <select className={INPUT} name="mode" required>
              {MATCH.modes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className={LABEL_FLUSH}>Game type
            <select className={INPUT} name="gameType" required>
              {MATCH.gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <Field label="City" id="city" name="city" placeholder="Hyderabad" required minLength={2} maxLength={80} className={FIELD} />
        </div>
        <p className="text-sm text-muted">{FREE_ENTRY_NOTICE}</p>
        <div className="grid grid-cols-3 gap-3">
          <label className={LABEL_FLUSH}>Day
            <select className={INPUT} name="dayOfWeek" required>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </label>
          <Field label="Start time" id="startTimeLocal" name="startTimeLocal" type="time" defaultValue="20:00" required className={FIELD} />
          <label className={LABEL_FLUSH}>Duration
            <select className={INPUT} name="durationMinutes" required>
              {MATCH.durationOptionsMinutes.map(v => <option key={v} value={v} selected={v === MATCH.defaultDurationMinutes}>{v} min</option>)}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className={LABEL_FLUSH}>Online
            <select className={INPUT} name="online" required>
              <option value="no">In-person</option>
              <option value="yes">Online</option>
            </select>
          </label>
        </div>
        <Button type="submit" className="mt-[6px]">Create series</Button>
      </form>
    </div>
  );
}
