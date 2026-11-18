import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <span className="eyebrow"><span className="dot" /> verified grassroots FF roster network</span>
            <h1>Stop picking hope-filled rosters<br /><span>for your next fest.</span></h1>
            <p className="subtext" style={{ maxWidth: '34ch' }}>
              Verified Indian Free Fire players in one searchable pool. College organizers filter by role and subtype, unlock a shortlist, and run the fest. No forms. No group chats of random IGNs.
            </p>
            <div className="cta-row">
              <Link href="/sign-up" className="btn">Join the pool</Link>
              <Link href="/organizer/sign-up" className="btn-ghost">I run a fest</Link>
            </div>
            <div className="kpis">
              <div className="kpi"><div className="kpi-num">5</div><div className="kpi-label">seeded demo players, real signups open</div></div>
              <div className="kpi"><div className="kpi-num">2</div><div className="kpi-label">roles pools live now: players and organizers</div></div>
              <div className="kpi"><div className="kpi-num">₹499</div><div className="kpi-label">price for organizers (locked)</div></div>
            </div>
          </div>

          <div className="mock-card">
            <div className="player-tile">
              <div className="avatar">??</div>
              <div>
                <div className="tile-title">RushKing_21 <span className="chip chip-sapphire">Heroic</span></div>
                <div className="tile-sub">VJIT · Rusher · verified screenshot</div>
              </div>
            </div>
            <div className="player-tile">
              <div className="avatar">iE</div>
              <div>
                <div className="tile-title">iG_Lx0 <span className="chip chip-emerald">Master</span></div>
                <div className="tile-sub">Ganjikhana · AWM sniper · ADPR 3.6</div>
              </div>
            </div>
            <div className="player-tile">
              <div className="avatar">Hc</div>
              <div>
                <div className="tile-title">Honor_Chur <span className="chip chip-balanced">Diamond</span></div>
                <div className="tile-sub">VJIT · Support · gloo-wall extraordinaire</div>
              </div>
            </div>
            <p className="small" style={{ marginTop: 14 }}>Sample data from the seeded demo pool. Real signups open now.</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--panel)', borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>One problem, one answer</h2>
          <p className="lead">Organisers running college Free Fire tournaments call shotgun rosters from WhatsApp text groups. Players lie about rank, no screening, and half the roster flakes the day of. FF Scout puts one verified player pool between the organiser and the tournament.</p>
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
              <p>Rusher, AWM Sniper, Support, Anchor, IGL, Lurker. Organiser filters by what is actually needed.</p>
            </div>
            <div className="card">
              <h3>One ₹499 unlock per event</h3>
              <p>No subscription. No seat pricing. Pay once per tournament, get a shortlist export.</p>
            </div>
            <div className="card">
              <h3>₹0 for players</h3>
              <p>Players never pay. Organiser pays per event only when they actually need the roster.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>FF competitive roles that organisers ask for</h2>
          <table className="roles-table">
            <thead>
              <tr><th>Role</th><th>Loadout</th><th>What organisers check</th></tr>
            </thead>
            <tbody>
              <tr><td>IGL</td><td>M1887 + Vest 3</td><td>Voicecomms, clutch history</td></tr>
              <tr><td>Rusher</td><td>M1887 / M1014 + nade</td><td>Rush success, first kill rate</td></tr>
              <tr><td>AWM Sniper</td><td>AWM + 6 scope</td><td>Headshot rate, ADPR</td></tr>
              <tr><td>Support</td><td>M1014 + gloo + medkit</td><td>Revivals per match</td></tr>
              <tr><td>Anchor</td><td>XM8 + Caliber</td><td>Survivability in endgame</td></tr>
              <tr><td>Lurker</td><td>Mini14 / Dragunov</td><td>Flank kills in late circle</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--panel)', borderTop: '1px solid var(--line)' }}>
        <div className="shell">
          <h2>₹499 or you don't get the list</h2>
          <p className="lead">One unlock per college fest. Not once a month, not a monthly subscription. Pay only when your fest is actually starting.</p>
        </div>
      </section>
    </>
  );
}
