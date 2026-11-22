import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/shared/auth/session';
import { hasPermission, roleFromDb } from '@/shared/auth/permissions';
import { MATCH } from '@/shared/config/match';
import { seriesEligibility } from '@/features/series/service';
import { FREE_ENTRY_NOTICE } from '@/features/disclosure/copy';
import { privateMetadata } from '@/shared/seo';
import { createMatch } from './actions';
import { Field } from '@/shared/ui/Field';
import { Button } from '@/shared/ui/Button';

export const metadata = privateMetadata('Post a match');

const ERRORS: Record<string, string> = {
  rate: 'Too many posts in a short while. Give it a few minutes.',
  invalid: 'Check the details, something is missing or too long.',
  paused: 'Posting is paused on this account after a payment report. It reopens automatically after seven days.',
  date: 'That date is already gone. Pick an upcoming one.',
};

const NARROW = 'mx-auto w-full max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const LABEL_FLUSH = 'block text-sm font-bold text-ink';
const INPUT = 'w-full min-h-11 rounded-lg border border-[#CFC8B9] bg-[#FDFCF8] px-4 text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const FIELD = 'text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const GHOST_BASE = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';
const GHOST = `${GHOST_BASE} text-sm`;
const GHOST_SM = `${GHOST_BASE} text-[13px]`;

export default async function PostMatch({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'match:create')) redirect('/player');

  const { e } = await searchParams;

  const eligibility = await seriesEligibility(s.id);

  return (
    <div className={NARROW}>
      <div className="mt-8 flex items-baseline justify-between gap-4">
        <h1 className={H1}>Post a match</h1>
        <Link href="/player/posted" className={GHOST}>Your matches</Link>
      </div>
      <p className={`mt-2 ${SUBTEXT}`}>{FREE_ENTRY_NOTICE}</p>
      {eligibility.qualified > 0 && (
        <p className={`mt-[10px] ${SUBTEXT}`}>
          {eligibility.qualified} of {MATCH.trustLadderMinMatches} completed matches hosted so far.
        </p>
      )}
      {eligibility.unlocked && (
        <p className={`mt-1 ${SUBTEXT}`}>
          <a href="/post/series" className={GHOST_SM}>Set up a weekly series</a>
        </p>
      )}
      {e && Object.prototype.hasOwnProperty.call(ERRORS, e) && <p className="mt-3 text-[13px] text-risk">{ERRORS[e]}</p>}

      <form action={createMatch} className="mt-5 grid gap-[14px]">
        <Field label="Title" id="title" name="title" placeholder="Friday BR Squad Night" required maxLength={90} className={FIELD} />

        <div className="grid grid-cols-2 gap-3">
          <label className={LABEL_FLUSH}>Mode
            <select className={INPUT} name="mode" required>
              {MATCH.modes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className={LABEL_FLUSH}>Game type
            <select className={INPUT} name="gameType" required>
              {MATCH.gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={LABEL_FLUSH}>Duration
            <select className={INPUT} name="durationMinutes" required>
              {MATCH.durationOptionsMinutes.map(v => <option key={v} value={v} selected={v === MATCH.defaultDurationMinutes}>{v} min</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date and time" id="date" name="date" type="datetime-local" required className={FIELD} />
          <Field label="City" id="city" name="city" placeholder="Your city" required maxLength={80} className={FIELD} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Slots (optional)" id="slots" name="slots" type="number" min={1} placeholder="Unlimited" className={FIELD} />
          <Field label="Contact" id="contact" name="contact" placeholder="How players reach you" maxLength={120} className={FIELD} />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="online" value="yes" />
          <span>This match is played online, not at a venue.</span>
        </label>

        <label className={LABEL_FLUSH}>Requirements<textarea className={`${INPUT} py-0`} name="notes" rows={3} maxLength={500} placeholder="Format, rules, lobby details, anything players must know." /></label>
        <p className="mt-1 text-sm text-muted">Role, mic, experience or skill in your own words.</p>

        <div className="flex gap-[10px]">
          <Button type="submit">Post match</Button>
          <Link href="/matches" className={GHOST}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
