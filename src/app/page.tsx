import Link from 'next/link';
import { Hero } from './components/Hero';
import { Wire } from '@/components/Wire';
import { Waitlist } from '@/components/Waitlist';
import { Reveal } from '@/components/Reveal';
import { buildHeroContext } from '@/lib/hero-data';
import { GLOBAL_DISCLOSURE } from '@/lib/free-entry';

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

export default async function HomePage() {
  const ctx = await getHeroContextSafe();
  return (
    <>
      <Hero ctx={ctx} />
      <Wire />

      <section className="section" aria-labelledby="fig2">
        <div className="shell">
          <div className="fig2">
            <div className="fig2-cap"><span id="fig2">FIG. 2</span> THE WHOLE LOOP, NOTHING HIDDEN</div>
            <div className="fig2-steps">
              {[
                ['01', 'POST', 'A host posts a match: mode, BR or CS, free entry only, no advertised prize. No approval queue.'],
                ['02', 'JOIN', 'Players browse the board and tap Join. Instant RSVP, no reviewer, no queue.'],
                ['03', 'ROSTER', 'The host sees who joined, with UID and self-declared BR/CS ranks. Players see the board, not each other.'],
              ].map(([n, t, d]) => (
                <div key={n} className="fig2-step">
                  <div className="fig2-num">{n}</div>
                  <h3 className="fig2-title">{t}</h3>
                  <p className="fig2-desc">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--panel)' }}>
        <div className="shell">
          <Reveal>
            <h2 style={{ maxWidth: '42ch' }}>One board, both sides of the lobby</h2>
            <p className="lead" style={{ marginTop: 12 }}>Players post the games they are hosting and join the ones they want. Sponsors can discover the players who chose to be found. We run the board, not the gate.</p>
          </Reveal>
          <div className="grid-3" style={{ marginTop: 36 }}>
            <Reveal delay={0}><article className="card">
              <h3>1. Players host and join</h3>
              <p>One account does both. Post a casual BR night or a ranked CS scrim, then join other people's matches. No separate host account, no approval step.</p>
            </article></Reveal>
            <Reveal delay={120}><article className="card">
              <h3>2. Every mode, every type</h3>
              <p>Casual, competitive, ranked or scrim. BR, CS or a mixed BR/CS night. Every listing is free entry. No cash prize is advertised here.</p>
            </article></Reveal>
            <Reveal delay={240}><article className="card">
              <h3>3. Sponsors scout the opted-in</h3>
              <p>Players turn on sponsor visibility themselves. Sponsors see displayName, UID, BR/CS ranks, role and city, never an email address.</p>
            </article></Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <Reveal><h2>What this replaces</h2>
            <p className="lead" style={{ marginTop: 12 }}>No more 200-member WhatsApp groups, no DMs from people who never show, no chasing UIDs the day of the event.</p></Reveal>
          <Reveal delay={80}><div className="table-wrap"><table className="roles-table">
            <thead><tr><th>Format</th><th>Before Final Circle</th><th>With Final Circle</th></tr></thead>
            <tbody>
              <tr><td>Café weekly scrim</td><td>WhatsApp flyers, 30+ no-shows, wrong roles on the day</td><td>A posted match, players RSVP, a roster with UIDs before match day</td></tr>
              <tr><td>College fest FF event</td><td>Random entrants, hours lost screening ranks</td><td>A listing players join themselves, BR or CS, free entry stated up front</td></tr>
              <tr><td>Sponsor activation</td><td>Rank claims taken on faith</td><td>Players who opted in, with UID and self-declared rank on their profile</td></tr>
              <tr><td>Guild trial</td><td>Hundreds of applicants in a group chat</td><td>A match post with slots, joiners listed for the poster only</td></tr>
            </tbody>
          </table></div></Reveal>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <Reveal>
            <h2>{GLOBAL_DISCLOSURE}</h2>
            <p className="lead" style={{ marginTop: 12 }}>Every listing on the board is free entry. We do not advertise cash prizes, collect money or verify players. India&apos;s PROGA 2025 and the 2026 Rules are background, not a legal compliance promise. A lawyer review is still required before launch.</p>
            <Link href="/safety" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24, fontSize: 16, padding: '14px 24px' }}>
              Read the disclosure
            </Link>
            <Link href="/learn" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24, marginLeft: 10, fontSize: 16, padding: '14px 24px' }}>
              Read the field guide
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <Reveal>
            <p className="subtext" style={{ maxWidth: '52ch' }}><strong>Independent site, not official.</strong> Final Circle is a community match board for Indian Free Fire players. Not affiliated with, endorsed by, or connected to Garena, Free Fire, any government body, or any esports organization. Free Fire and Garena are trademarks of Garena International II Private Limited.</p>
            <h2 style={{ marginTop: 28 }}>Not in your city yet?</h2>
            <p className="lead" style={{ marginTop: 12 }}>Tell us where you play. The waitlist tells us which cities want matches.</p>
            <Waitlist />
          </Reveal>
        </div>
      </section>
    </>
  );
}
