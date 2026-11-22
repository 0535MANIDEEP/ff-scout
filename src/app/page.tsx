import Link from 'next/link';
import { Hero } from './components/Hero';
import { Wire } from '@/components/Wire';
import { Reveal } from '@/components/Reveal';
import { buildHeroContext } from '@/features/matches/hero-data';
import { GLOBAL_DISCLOSURE } from '@/features/disclosure/copy';
import { BRAND } from '@/shared/config/brand';

export const revalidate = 300;

// Without a reachable DATABASE_URL (e.g. first deploy before Neon is wired in),
// render the landing with honest zeros instead of a 500. The error is logged for ops.
async function getHeroContextSafe() {
  try {
    return await buildHeroContext();
  } catch (err) {
    console.error('hero context unavailable:', err);
    return { openMatchCount: 0, totalPlayers: 0, matches: [] };
  }
}

const SECTION = 'border-t border-[#CFC8B9] py-16 max-[860px]:py-12 max-[600px]:py-8';
const SHELL = 'mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4';
const H2 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H3 = 'text-lg font-bold leading-[1.2] tracking-[-0.01em] text-ink';
const LEAD = 'mt-3 max-w-[62ch] text-lg leading-[1.6] text-ink';
const CARD = 'rounded-card border border-[#CFC8B9] bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-[10px] whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 py-[14px] text-center text-base font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default async function HomePage() {
  const ctx = await getHeroContextSafe();
  return (
    <>
      <Hero ctx={ctx} />
      <Wire />

      <section className={`${SECTION} bg-panel`}>
        <div className={SHELL}>
          <Reveal>
            <h2 className={`max-w-[42ch] ${H2}`}>One board for hosts and players</h2>
            <p className={LEAD}>A host posts a match with its mode and entry rule. A player opens it and joins. No one approves the post first.</p>
          </Reveal>
          <div className="mt-9 grid grid-cols-3 gap-6 max-[860px]:grid-cols-2 max-[600px]:mt-6 max-[600px]:grid-cols-1 max-[600px]:gap-4">
            <Reveal className="h-full" delay={0}>
              <article className={`${CARD} h-full`}>
                <h3 className={`mb-2 ${H3}`}>Do both with one account</h3>
                <p className="text-sm leading-[1.6] text-muted">Post a casual BR night or a ranked CS match, then join other people&apos;s matches. You do not need a separate host account.</p>
              </article>
            </Reveal>
            <Reveal className="h-full" delay={120}>
              <article className={`${CARD} h-full`}>
                <h3 className={`mb-2 ${H3}`}>BR, CS or a mix</h3>
                <p className="text-sm leading-[1.6] text-muted">Casual, competitive, ranked or scrim. Every listing states free entry. No listing advertises a cash prize.</p>
              </article>
            </Reveal>
            <Reveal className="h-full" delay={240}>
              <article className={`${CARD} h-full`}>
                <h3 className={`mb-2 ${H3}`}>Sponsors pay for the board</h3>
                <p className="text-sm leading-[1.6] text-muted">Brands pay for a placement or fund a free event. Players join without paying, and Final Circle holds no money.</p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <div className={SHELL}>
          <Reveal>
            <h2 className={H2}>From group chats to a board</h2>
            <p className={LEAD}>A match post keeps the mode, entry rule and roster in one place instead of a long chat thread.</p>
          </Reveal>
          <Reveal delay={80}><div className="overflow-x-auto rounded-card border border-[#CFC8B9] [-webkit-overflow-scrolling:touch]"><table className="mt-6 w-full border-collapse text-sm [&>tbody>tr:last-child>td]:border-b-0">
            <thead><tr><th className="border-b border-[#CFC8B9] bg-[#E4DFD1] px-4 py-3 text-left align-top font-mono text-xs tracking-[0.06em] text-ink">Use case</th><th className="border-b border-[#CFC8B9] bg-[#E4DFD1] px-4 py-3 text-left align-top font-mono text-xs tracking-[0.06em] text-ink">Group chat</th><th className="border-b border-[#CFC8B9] bg-[#E4DFD1] px-4 py-3 text-left align-top font-mono text-xs tracking-[0.06em] text-ink">On the board</th></tr></thead>
            <tbody>
              <tr><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Café weekly scrim</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Flyers reposted and players asking who is in</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">One match post with a roster and UIDs before the day</td></tr>
              <tr><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">College fest event</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Hours spent screening rank screenshots</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Players join the listing themselves. Ranks are self-declared.</td></tr>
              <tr><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Guild trial</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Applicants buried in a chat</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">A post with slots, with the joiner list visible to the host</td></tr>
            </tbody>
          </table></div></Reveal>
        </div>
      </section>

      <section className={`${SECTION} border-t-line`}>
        <div className={SHELL}>
          <Reveal>
            <h2 className={H2}>{GLOBAL_DISCLOSURE}</h2>
            <p className={LEAD}>Every match on the board is free entry. We do not advertise cash prizes, collect money or verify players. The full rules are on the safety page.</p>
            <Link href="/safety" className={GHOST}>
              Read safety and legal
            </Link>
            <Link href="/learn" className={`${GHOST} ml-[10px]`}>
              Open the field guide
            </Link>
          </Reveal>
        </div>
      </section>

      <section className={SECTION}>
        <div className={SHELL}>
          <Reveal>
            <p className="max-w-[52ch] text-base leading-[1.6] text-muted"><strong>Independent site.</strong> {BRAND.name} is a community match board for Indian Free Fire players. It is not affiliated with Garena, Free Fire, any government body or any esports organisation. {BRAND.trademark}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
