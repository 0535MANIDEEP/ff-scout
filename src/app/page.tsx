import Link from 'next/link';
import { Hero } from './components/Hero';
import { Wire } from '@/components/Wire';
import { Reveal } from '@/components/Reveal';
import { buildHeroContext } from '@/features/matches/hero-data';
import { GLOBAL_DISCLOSURE } from '@/features/disclosure/copy';

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

      <section className={SECTION} aria-labelledby="fig2">
        <div className={SHELL}>
          <div className="hidden">
            <h2 className="mb-2 text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink" id="fig2"><span>FIG. 2</span> THE WHOLE LOOP, NOTHING HIDDEN</h2>
            <div>
              {[
                ['01', 'POST', 'A host posts a match: mode, BR or CS, free entry only, no advertised prize. No approval queue.'],
                ['02', 'JOIN', 'Players browse the board and tap Join. Instant RSVP, no reviewer, no queue.'],
                ['03', 'ROSTER', 'The host sees who joined, with UID and self-declared BR/CS ranks. Players see the board, not each other.'],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <div>{n}</div>
                  <h3 className={H3}>{t}</h3>
                  <p className="leading-[1.65]">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${SECTION} bg-panel`}>
        <div className={SHELL}>
          <Reveal>
            <h2 className={`max-w-[42ch] ${H2}`}>One board, both sides of the lobby</h2>
            <p className={LEAD}>Players post the games they are hosting and join the ones they want. We run the board, not the gate.</p>
          </Reveal>
          <div className="mt-9 grid grid-cols-3 gap-6 max-[860px]:grid-cols-2 max-[600px]:mt-6 max-[600px]:grid-cols-1 max-[600px]:gap-4">
            <Reveal delay={0}><article className={CARD}>
              <h3 className={`mb-2 ${H3}`}>1. Players host and join</h3>
              <p className="text-sm leading-[1.6] text-muted">One account does both. Post a casual BR night or a ranked CS scrim, then join other people's matches. No separate host account, no approval step.</p>
            </article></Reveal>
            <Reveal delay={120}><article className={CARD}>
              <h3 className={`mb-2 ${H3}`}>2. Every mode, every type</h3>
              <p className="text-sm leading-[1.6] text-muted">Casual, competitive, ranked or scrim. BR, CS or a mixed BR/CS night. Every listing is free entry. No cash prize is advertised here.</p>
            </article></Reveal>
            <Reveal delay={240}><article className={CARD}>
              <h3 className={`mb-2 ${H3}`}>3. Sponsors fund the board</h3>
              <p className="text-sm leading-[1.6] text-muted">Brands can fund a placement or a free event by email. Players never pay and Final Circle never handles money.</p>
            </article></Reveal>
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <div className={SHELL}>
          <Reveal><h2 className={H2}>What this replaces</h2>
            <p className={LEAD}>No more 200-member WhatsApp groups, no DMs from people who never show, no chasing UIDs the day of the event.</p></Reveal>
          <Reveal delay={80}><div className="overflow-x-auto rounded-card border border-[#CFC8B9] [-webkit-overflow-scrolling:touch]"><table className="mt-6 w-full border-collapse text-sm [&>tbody>tr:last-child>td]:border-b-0">
            <thead><tr><th className="border-b border-[#CFC8B9] bg-[#E4DFD1] px-4 py-3 text-left align-top font-mono text-xs tracking-[0.06em] text-ink">Format</th><th className="border-b border-[#CFC8B9] bg-[#E4DFD1] px-4 py-3 text-left align-top font-mono text-xs tracking-[0.06em] text-ink">Before Final Circle</th><th className="border-b border-[#CFC8B9] bg-[#E4DFD1] px-4 py-3 text-left align-top font-mono text-xs tracking-[0.06em] text-ink">With Final Circle</th></tr></thead>
            <tbody>
              <tr><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Café weekly scrim</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">WhatsApp flyers, 30+ no-shows, wrong roles on the day</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">A posted match, players RSVP, a roster with UIDs before match day</td></tr>
              <tr><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">College fest FF event</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Random entrants, hours lost screening ranks</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">A listing players join themselves, BR or CS, free entry stated up front</td></tr>
              <tr><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Guild trial</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">Hundreds of applicants in a group chat</td><td className="border-b border-[#CFC8B9] px-4 py-3 text-left align-top">A match post with slots, joiners listed for the poster only</td></tr>
            </tbody>
          </table></div></Reveal>
        </div>
      </section>

      <section className={`${SECTION} border-t-line`}>
        <div className={SHELL}>
          <Reveal>
            <h2 className={H2}>{GLOBAL_DISCLOSURE}</h2>
            <p className={LEAD}>Every listing on the board is free entry. We do not advertise cash prizes, collect money or verify players. India&apos;s PROGA 2025 and the 2026 Rules are background, not a legal compliance promise. A lawyer review is still required before launch.</p>
            <Link href="/safety" className={GHOST}>
              Read the disclosure
            </Link>
            <Link href="/learn" className={`${GHOST} ml-[10px]`}>
              Read the field guide
            </Link>
          </Reveal>
        </div>
      </section>

      <section className={SECTION}>
        <div className={SHELL}>
          <Reveal>
            <p className="max-w-[52ch] text-lg leading-[1.55] text-muted max-[600px]:text-base"><strong>Independent site, not official.</strong> Final Circle is a community match board for Indian Free Fire players. Not affiliated with, endorsed by, or connected to Garena, Free Fire, any government body, or any esports organization. Free Fire and Garena are trademarks of Garena International II Private Limited.</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
