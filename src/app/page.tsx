import Link from 'next/link';
import { Hero } from './components/Hero';
import { Wire } from '@/components/Wire';
import { Waitlist } from '@/components/Waitlist';
import { Reveal } from '@/components/Reveal';
import { buildHeroContext } from '@/lib/hero-data';
// ISR, not per-request SSR: the hero shows a counter, not an audit log.
// 5 minutes of staleness is honest; a Neon hit on every visit is a bill risk.
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
            <div className="fig2-cap"><span id="fig2">FIG. 2</span> THE WHOLE PIPELINE, NOTHING HIDDEN</div>
            <div className="fig2-steps">
              {[
                ['01', 'UPLOAD', 'Player uploads rank screenshot + UID. 30 seconds, once.'],
                ['02', 'THE EYE', 'A human verifier checks the tier, the ID, the date of the shot.'],
                ['03', 'CSV', 'Organizer filters by role, tier and city, hits export.'],
                ['04', 'MATCH DAY', 'Verified roster locks the roster. Organizer runs the show.'],
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
            <h2 style={{ maxWidth: '42ch' }}>A team for your tournament, in <span style={{ color: 'var(--accent)' }}>one shortlist</span></h2>
            <p className="lead" style={{ marginTop: 12 }}>Cafés, college fests, sponsored scrims and guild trials, verified Indian Free Fire rosters for your event, screened by a human verifier. You filter, export the CSV, and work the list from WhatsApp like you always have — with ranks you can trust.</p>
          </Reveal>
          <div className="grid-3" style={{ marginTop: 36 }}>
            <Reveal delay={0}><article className="card">
              <h3>1. You tell us the event</h3>
              <p>Name it, date it, city. Pick the combat roles you need, Rusher, AWM Sniper, Support, Anchor, Lurker. IGL is assigned per squad, not picked from a menu. No fluff, no learning curve.</p>
            </article></Reveal>
            <Reveal delay={120}><article className="card">
              <h3>2. We screen once</h3>
              <p>Players upload rank screenshots. Every one is checked by hand before it enters the pool. Nothing gets in unscreened.</p>
            </article></Reveal>
            <Reveal delay={240}><article className="card">
              <h3>3. You unlock it free (pilot)</h3>
              <p>Per event, not per player. At launch: ₹499 per event, full refund until roster locks. Pilot phase: free. Either way, we hold the risk.</p>
            </article></Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <Reveal><h2>What this actually replaces</h2>
          <p className="lead" style={{ marginTop: 12 }}>No more 200-member WhatsApp groups, no fake ranks, no ghost players on the day. One shortlist, paid only if it works.</p></Reveal>
          <Reveal delay={80}><div className="table-wrap"><table className="roles-table">
            <thead><tr><th>Format</th><th>Before Final Circle</th><th>With Final Circle</th></tr></thead>
            <tbody>
              <tr><td>Café weekly scrim</td><td>WhatsApp flyers, 30+ no-shows, wrong roles on day</td><td>10 verified players with ranked screenshots, in your CSV the same day</td></tr>
              <tr><td>College fest FF event</td><td>Random entrants, hours wasted screening rank</td><td>Verified roster, valid for your event — free in pilot</td></tr>
              <tr><td>Sponsor activation</td><td>Unverified "pros" sponsored to look credible</td><td>Verified Heroic players, publicly visible dev history and rank</td></tr>
              <tr><td>Guild trial</td><td>Hundreds of applicants, wrong role</td><td>Shortlisted by role and rank, ₹499 per event at launch, free in pilot</td></tr>
            </tbody>
          </table></div></Reveal>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <Reveal>
            <h2>₹499 per event — at launch. Pilot is free.</h2>
            <p className="lead" style={{ marginTop: 12 }}>No payment flow exists yet; the pilot charges nothing. At launch, ₹499 covers your whole event shortlist — not per seat, not per player. Refund until you lock the roster. Players never pay.</p>
            <Link href="/organizer/sign-up" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24, fontSize: 16, padding: '14px 24px' }}>
              Start your tournament →
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <Reveal>
            <p className="subtext" style={{ maxWidth: '52ch' }}><strong>Independent site, not official.</strong> Final Circle is a community-built roster shortlist for Indian FF organizers. Not affiliated with, endorsed by, or connected to Garena, Free Fire, any government body, or any esports organization. Free Fire and Garena are trademarks of Garena International II Private Limited.</p>
            <h2 style={{ marginTop: 28 }}>Not in your city yet?</h2>
            <p className="lead" style={{ marginTop: 12 }}>Tell us where you organise events. We onboard grassroots partners city by city, starting with India.</p>
            <Waitlist />
          </Reveal>
        </div>
      </section>
    </>
  );
}
