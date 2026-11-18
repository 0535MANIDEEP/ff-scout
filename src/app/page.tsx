import { Hero } from './components/Hero';
import Link from 'next/link';
import { Waitlist } from '@/components/Waitlist';

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="section" style={{ background: 'var(--panel)', borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>One organiser, one shortlist</h2>
          <p className="lead">Indian grassroots organizers juggle dozens of WhatsApp groups, sponsor sheets, and zero screening. FF Scout is one verified pool across cafés, fests, sponsors and guilds.</p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>Three things FF Scout does</h2>
          <div className="grid-2">
            <div className="card card-highlight">
              <h3>Verified profiles, not aspiration</h3>
              <p>Rank screenshot uploaded, admin-approved, one profile per person.</p>
            </div>
            <div className="card">
              <h3>Roles that match the job</h3>
              <p>Rusher, AWM Sniper, Support, Anchor, IGL, Lurker. Organisers filter by what the match needs.</p>
            </div>
            <div className="card">
              <h3>₹499 unlock, once per event</h3>
              <p>Pay once per tournament - café night, LAN series, fest, sponsor activation. Not monthly. Not per-seat.</p>
            </div>
            <div className="card">
              <h3>₹0 for players</h3>
              <p>Everyone registers free. Organisers pay only when they need the verified roster, never before.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>FF roles organisers ask for</h2>
          <p className="lead">Each profile tags one role and one weapon specialty. Sample from the demo seeds.</p>
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

      <section className="section" style={{ background: 'var(--panel)', borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>Your city not on the map yet?</h2>
          <p className="lead">Tell us where you run events. One email unlock gets you verified shortlists for your city once we onboard your neighborhood organizers.</p>
          <Waitlist />
        </div>
      </section>
    </>
  );
}
