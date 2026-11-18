import Link from 'next/link';
import { Hero } from './components/Hero';
import { Waitlist } from '@/components/Waitlist';
import { buildHeroContext } from '@/lib/hero-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const ctx = await buildHeroContext();
  return (
    <>
      <Hero roster={ctx.roster} />

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>Indian grassroots, one pool</h2>
          <p className="lead">Cafés, fest leads, sponsors and guild scouts juggle dozens of WhatsApp groups and zero screening. FF Scout is one verified pool across the country — no leaked rosters, no fake ranks, no missing members on the day.</p>
          <div className="kpis">
            <div className="kpi"><div className="kpi-num">{ctx.totalVerified}</div><div className="kpi-label">verified players</div></div>
            <div className="kpi"><div className="kpi-num">{ctx.pendingCount}</div><div className="kpi-label">pending proofs</div></div>
            <div className="kpi"><div className="kpi-num">{ctx.collegeCount}</div><div className="kpi-label">affiliations represented</div></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--panel)', borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>What FF Scout actually does</h2>
          <div className="grid-2">
            <div className="card card-highlight">
              <h3>Verified, not aspiration</h3>
              <p>Rank screenshot uploaded, admin manually eye-verified. One profile per person. Players who lie are removed permanently.</p>
            </div>
            <div className="card">
              <h3>Filters that match the job</h3>
              <p>Rusher, AWM Sniper, Support, Anchor, IGL, Lurker. Organisers filter by role needed for the event — not weapon preference.</p>
            </div>
            <div className="card">
              <h3>₹499 to unlock one event</h3>
              <p>Pay only when your tournament actually needs the roster. Not monthly. Not per-seat. Never before a real sign-up.</p>
            </div>
            <div className="card">
              <h3>₹0 for players</h3>
              <p>Players never pay a rupee. Organizers pay only when they need verified rosters. The verification queue is free.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>FF roles organisers ask for</h2>
          <p className="lead">Each verified profile is tagged one role and one skill priority.</p>
          <table className="roles-table">
            <thead><tr><th>Role</th><th>Loadout</th><th>What organisers check</th></tr></thead>
            <tbody>
              <tr><td>IGL</td><td>M1887 + Vest 3</td><td>Voicecomms, clutch history</td></tr>
              <tr><td>Rusher</td><td>M1887 / M1014 + nade</td><td>Rush success, first kill rate</td></tr>
              <tr><td>AWM Sniper</td><td>AWM + 6x scope</td><td>Headshot rate, ADPR</td></tr>
              <tr><td>Support</td><td>M1014 + gloo + medkit</td><td>Revivals per match</td></tr>
              <tr><td>Anchor</td><td>XM8 + Caliber</td><td>Endgame survivability</td></tr>
              <tr><td>Lurker</td><td>Mini14 / Dragunov</td><td>Flank kills in late circle</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>Not in your city yet?</h2>
          <p className="lead">Tell us where you organise events. Once we onboard your neighbourhood organisers, your city gets unlocked — ₹499 to the event, full refund if the roster fails.</p>
          <Waitlist />
        </div>
      </section>
    </>
  );
}
