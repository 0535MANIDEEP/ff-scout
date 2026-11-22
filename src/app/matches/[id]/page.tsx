import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/shared/auth/session';
import { prisma } from '@/shared/db/client';
import { normalizeTeamName } from '@/features/matches/team';
import { FREE_ENTRY_NOTICE, PAYMENT_REPORT_CATEGORY, PAYMENT_REPORT_THRESHOLD } from '@/features/disclosure/copy';
import { publicMetadata } from '@/shared/seo';
import { joinMatch, leaveMatch, reportMatch } from './actions';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let title = 'Match';
  try {
    const match = await prisma.match.findUnique({ where: { id }, select: { title: true } });
    if (match) title = match.title;
  } catch { /* metadata must never break the page */ }
  return publicMetadata(title, 'A free-entry Free Fire match listing on Final Circle. No money handled by the site.', `/matches/${id}`);
}

const ERRORS: Record<string, string> = {
  already: "You're already on this roster.",
  full: 'This match is full.',
  closed: 'This match is closed.',
  retry: 'Someone just took the last slot. Try once more.',
  reported: 'You already reported this match.',
  invalid: 'Pick a reason, add a short note, then try again.',
  team: 'Team name must be 2–30 characters.',
};

const REPORT_CATEGORIES: Array<[string, string]> = [
  [PAYMENT_REPORT_CATEGORY, 'Asking players to pay'],
  ['fake_match', 'Match is fake or already over'],
  ['other', 'Something else'],
];

const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const EYEBROW = 'block font-mono text-xs font-semibold tracking-[0.08em] text-muted';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const SMALL = 'text-sm text-muted';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const APPROVED = 'font-mono text-sm font-bold text-[#1F6B3A]';
const RISK = 'text-[13px] text-risk';
const LABEL = 'mb-2 block text-sm font-bold text-ink';
const LABEL_FLUSH = 'block text-sm font-bold text-ink';
const INPUT = 'w-full min-h-11 rounded-lg border border-[#CFC8B9] bg-[#FDFCF8] px-4 text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';
const CHIP = 'inline-flex min-h-7 items-center whitespace-nowrap rounded-full border border-[#CFC8B9] bg-[#E4DFD1] px-3 font-mono text-xs font-bold text-ink';
const CARD = 'rounded-card border border-[#CFC8B9] bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const KV = 'flex justify-between gap-4 border-b border-[#CFC8B9] py-3 text-sm last:border-b-0 [&>span:first-child]:font-mono [&>span:first-child]:text-xs [&>span:first-child]:text-muted';

export default async function MatchDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;

  const s = await getCurrentUser();

  const match = await prisma.match.findUnique({
    where: { id },
    select: {
      id: true, title: true, mode: true, gameType: true,
      status: true, date: true, city: true, online: true,
      slots: true, contact: true, notes: true,
      organizer: { select: { displayName: true } },
      _count: { select: { entries: true } },
    },
  });
  if (!match) redirect('/matches');

  const joined = s
    ? await prisma.matchEntry.findFirst({ where: { matchId: id, playerId: s.id }, select: { id: true } })
    : null;

  const joinedPaymentReports = await prisma.report.count({
    where: {
      matchId: id,
      category: PAYMENT_REPORT_CATEGORY,
      reporter: { entries: { some: { matchId: id } } },
    },
  });

  const closed = match.status !== 'open';
  const full = match.slots != null && match.slots <= 0;

  const profile = s
    ? await prisma.user.findUnique({ where: { id: s.id }, select: { teamName: true } })
    : null;
  const prefillTeam = profile?.teamName ? normalizeTeamName(profile.teamName) : '';
  const isEsportsish = match.mode === 'esports' || match.mode === 'competitive';

  return (
    <div className={NARROW}>
      <Link href="/matches" className={`mt-7 inline-flex ${GHOST}`}>← All matches</Link>
      <span className={`mt-5 ${EYEBROW}`}>{match.gameType} · {match.mode}</span>
      <h1 className={`mt-[10px] ${H1}`}>{match.title}</h1>
      <p className={`mt-[6px] ${SUBTEXT}`}>
        {match.online ? 'Online' : match.city} · {new Date(match.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })} · posted by {match.organizer.displayName}
      </p>

      {sp.joined && <p className={`mt-3 ${APPROVED}`}>You are on this roster.</p>}
      {sp.e && ERRORS[sp.e] && <p className={`mt-3 ${RISK}`}>{ERRORS[sp.e]}</p>}
      {sp.reported && <p className={`mt-3 ${APPROVED}`}>Thanks, reported.{sp.enforced ? ' This match is closed and the host cannot post for seven days.' : ''}</p>}
      {joinedPaymentReports >= PAYMENT_REPORT_THRESHOLD && (
        <p className={`mt-3 ${RISK}`}>
          {joinedPaymentReports} joined players reported a payment request. This match is closed automatically.
        </p>
      )}

      <section className={`mt-5 ${CARD}`}>
        <div className={KV}><span>Entry</span><span>Free</span></div>
        <div className={KV}><span>Slots</span><span>{match.slots != null ? `${match.slots} left` : 'Unlimited'}</span></div>
        <div className={KV}><span>Joined</span><span>{match._count.entries}</span></div>
        {match.contact && <div className={KV}><span>Contact</span><span>{match.contact}</span></div>}
        {match.notes && <p className={`mt-3 ${SUBTEXT}`}><span className="font-bold">Requirements: </span>{match.notes}</p>}
        <p className={`mt-3 ${SMALL}`}>
          {FREE_ENTRY_NOTICE} See <Link href="/safety" className="text-vermilion">Safety and legal</Link> for the reporting rule.
        </p>
      </section>

      <div className="mt-[18px] flex flex-wrap items-center gap-[10px]">
        {closed ? (
          <span className={CHIP}>Closed</span>
        ) : full ? (
          <span className={CHIP}>Full</span>
        ) : joined ? (
          <form action={leaveMatch}>
            <input type="hidden" name="matchId" value={match.id} />
            <button className={GHOST} type="submit">Leave this match</button>
          </form>
        ) : s ? (
          <form action={joinMatch} className="flex flex-wrap items-center gap-[10px]">
            {isEsportsish && (
              <label className={LABEL_FLUSH}>Team / Guild name
                <input className={INPUT} name="teamName" defaultValue={prefillTeam} placeholder="Optional, helps hosts group squads" maxLength={30} />
              </label>
            )}
            <input type="hidden" name="matchId" value={match.id} />
            <button className={BTN} type="submit">Join this match</button>
          </form>
        ) : (
          <Link href="/login" className={BTN}>Log in to join</Link>
        )}
      </div>

      <details className="mt-5">
        <summary className="cursor-pointer text-[13px]">Report this match</summary>
        <form action={reportMatch} className="mt-[10px] grid gap-2">
          <input type="hidden" name="matchId" value={match.id} />
          <label className={LABEL}>What is wrong?
            <select className={INPUT} name="category" required>
              {REPORT_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className={LABEL}>Short note<textarea className={INPUT} name="reason" rows={3} maxLength={300} required /></label>
          <div><button className={GHOST} type="submit">Send report</button></div>
        </form>
      </details>
    </div>
  );
}
