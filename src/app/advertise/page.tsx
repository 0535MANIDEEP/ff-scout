import Link from 'next/link';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';
import { GLOBAL_DISCLOSURE } from '@/lib/free-entry';

export const metadata: Metadata = {
  title: 'Advertise and sponsor free events, Final Circle',
  description: 'Sponsor placements and sponsor-funded free events on a free-entry Free Fire match board. No player pays, and Final Circle handles no money.',
  alternates: { canonical: `${BRAND.url}/advertise` },
};

export default function Advertise() {
  return (
    <div className="page-narrow">
      <span className="eyebrow-inline" style={{ marginTop: 32 }}>SPONSORS · FREE EVENTS ONLY</span>
      <h1 style={{ marginTop: 10 }}>Advertise on Final Circle</h1>
      <p className="lead" style={{ marginTop: 12 }}>{GLOBAL_DISCLOSURE}</p>
      <p className="subtext" style={{ marginTop: 10 }}>
        We work with brands that want to reach grassroots Free Fire players in India. We do not work with real-money gaming, betting or anything that asks a player to pay to take part.
      </p>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>What we can offer</h2>
        <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
          <li><strong>Sponsor placement.</strong> A named line in the site footer, shown as sponsor, never disguised as a match result or a player endorsement.</li>
          <li><strong>Sponsor-funded free events.</strong> You fund an event and deliver any reward directly. Players join free and Final Circle never holds the money.</li>
          <li><strong>Opt-in discovery.</strong> Sponsors see only players who chose to be visible: display name, UID, BR and CS ranks, role and city. No email addresses, no contact lists.</li>
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>What we will not do</h2>
        <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
          <li>Advertise entry fees, cash prizes or anything that looks like a paid game.</li>
          <li>Hold, collect or pay out money from players or sponsors on the site.</li>
          <li>Sell a verified badge, a shortlist or a guaranteed player count.</li>
          <li>Publish a rate card before a real buyer agrees to real terms.</li>
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Data and disclosure</h2>
        <p className="subtext" style={{ marginTop: 10 }}>
          Sponsor placement is disclosed on the page where it appears. Affiliate links on the loadout page are also disclosed. Player data is opt-in and never includes email addresses. Reporting and removal rules are the same for everyone, including sponsors. Read the full notice on <Link href="/safety" style={{ color: 'var(--accent)' }}>Safety and legal</Link>.
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Talk to us</h2>
        <p className="subtext" style={{ marginTop: 10 }}>
          Email <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}>{BRAND.email}</a> with what you want to fund and when. We will reply with what we can honestly deliver. {BRAND.founder} handles this directly.
        </p>
      </section>

      <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href={`mailto:${BRAND.email}?subject=Sponsor%20enquiry`} className="btn" style={{ textDecoration: 'none' }}>Email the founder</a>
        <Link href="/matches" className="btn-ghost" style={{ textDecoration: 'none' }}>See the board</Link>
      </div>
    </div>
  );
}
