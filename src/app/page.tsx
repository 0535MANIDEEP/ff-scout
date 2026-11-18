import Link from 'next/link';
import { Hero } from './components/Hero';
import { Waitlist } from '@/components/Waitlist';
import { Reveal } from '@/components/Reveal';
import { buildHeroContext } from '@/lib/hero-data';

export const dynamic = 'force-dynamic';

// Without a reachable DATABASE_URL (e.g. first deploy before Neon is wired in),
// render the landing with honest zeros instead of a 500. The error is logged for ops.
async function getHeroContextSafe() {
  try {
    return await buildHeroContext();
  } catch (err) {
    console.error('hero context unavailable:', err);
    return { totalVerified: 0, pendingCount: 0, collegeCount: 0, roster: [] };
  }
}

export default async function HomePage() {
  const ctx = await getHeroContextSafe();
  return (
    <>
      <Hero roster={ctx.roster} />

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <Reveal>
            <div className="kpis">
              <div className="kpi"><div className="kpi-num">{ctx.totalVerified}</div><div className="kpi-label">verified players across {ctx.collegeCount} affiliations</div></div>
              <div className="kpi"><div className="kpi-num">₹499</div><div className="kpi-label">per tournament, full refund until roster locks</div></div>
              <div className="kpi"><div className="kpi-num">24h</div><div className="kpi-label">from signup to unlock, screening by admin</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--panel)' }}>
        <div className="shell">
          <Reveal>
            <h2 style={{ maxWidth: '42ch' }}>A team for your tournament, in <span style={{ color: 'var(--accent)' }}>one shortlist</span></h2>
            <p className="lead" style={{ marginTop: 12 }}>Cafés, college fests, sponsored scrims and guild trials, verified Indian Free Fire rosters are scoped to your event, screened once by our admin, and locked the moment you approve them. You see the ranks; the players see your invite.</p>
          </Reveal>
          <div className="grid-3" style={{ marginTop: 36 }}>
            <Reveal delay={0}><article className="card">
              <h3>1. You tell us the event</h3>
              <p>Name it, date it, city. Pick the combat roles you need, Rusher, AWM Sniper, Support, Anchor, Lurker. IGL is assigned per squad, not picked from a menu. No fluff, no learning curve.</p>
            </article></Reveal>
            <Reveal delay={120}><article className="card">
              <h3>2. We screen once</h3>
              <p>Players upload rank screenshots. Admin eye-verifies each manually. Nothing enters the pool without our sign-off, ever.</p>
            </article></Reveal>
            <Reveal delay={240}><article className="card">
              <h3>3. You unlock in ₹499</h3>
              <p>Per event, not per player. Full refund if roster doesn't work for your match. We take the risk, not you.</p>
            </article></Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <Reveal><h2>What this actually replaces</h2>
          <p className="lead" style={{ marginTop: 12 }}>No more 200-member WhatsApp groups, no fake ranks, no ghost players on the day. One shortlist, paid only if it works.</p></Reveal>
          <Reveal delay={80}><div className="table-wrap"><table className="roles-table">
            <thead><tr><th>Format</th><th>Before FF Scout</th><th>With FF Scout</th></tr></thead>
            <tbody>
              <tr><td>Café weekly scrim</td><td>WhatsApp flyers, 30+ no-shows, wrong roles on day</td><td>10 verified players with ranked screenshots, confirmed 5 days ahead</td></tr>
              <tr><td>College fest FF event</td><td>Random entrants, admin hours wasted screening rank</td><td>₹499 unlock, one admin-verified roster, ready to play</td></tr>
              <tr><td>Sponsor activation</td><td>Unverified "pros" sponsored to look credible</td><td>Verified Heroic players only, performance conditional on match-day</td></tr>
              <tr><td>Guild trial</td><td>Hundreds of applicants, wrong ROLE</td><td>Shortlisted by role/rank, ₹999/yr, unlimited trials</td></tr>
            </tbody>
          </table></div></Reveal>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <Reveal>
            <h2>₹499 unlocks verified roster access</h2>
            <p className="lead" style={{ marginTop: 12 }}>One purchase per event covers your entire shortlist. Refund until roster locks. If you don&apos;t like the picks, we don&apos;t charge.</p>
            <Link href="/organizer/sign-up" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24, fontSize: 16, padding: '14px 24px' }}>
              Start your tournament →
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <Reveal>
            <h2>Not in your city yet?</h2>
            <p className="lead" style={{ marginTop: 12 }}>Tell us where you organise events. Once we onboard your city, sponsors start buying from your verified rosters, ₹499 locked refund until your first match.</p>
            <Waitlist />
          </Reveal>
        </div>
      </section>
    </>
  );
}
