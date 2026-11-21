import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'Terms, Final Circle',
  description: 'Host, player and sponsor obligations under Final Circle.',
};

export default function Terms() {
  return (
    <div className="page-narrow">
      <h1>Terms</h1>

      <h2 style={{ marginTop: 24 }}>Hosts</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Posting a match is free while we are in pilot. Players never pay to join</li>
        <li>Entry fees and prize pools are notes on the listing. Final Circle handles no money; hosts and players settle directly</li>
        <li>Ranks are entered by players. Hosts confirm them in-game</li>
        <li>Disputes go to <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}>{BRAND.email}</a> within 14 days of the event</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Players</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Payment milestones (prize distribution) are handled inside the tournament, not by Final Circle</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Sponsors</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Sponsor discovery is opt-in. Sponsors see the profile details a player shares, never an email address</li>
        <li>Sponsor accounts are free while we are in pilot</li>
        <li>Final payment arrangements happen between sponsor and prize-pool operator, not Final Circle</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Non-affiliation</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is not affiliated with Garena International II Private Limited, or with any Free Fire tournament organiser. Free Fire and Garena are trademarks of Garena International II Private Limited. All references to them in this document are for identification and compatibility only.
      </p>
      <p style={{ marginTop: 32 }}><Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link></p>
    </div>
  );
}
