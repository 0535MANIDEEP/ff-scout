import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { publicMetadata } from '@/lib/seo';

export const metadata = publicMetadata(
  'Terms of use, Final Circle',
  'Free entry only, no money handled by Final Circle, and the rules for hosts, players and sponsors.',
  '/terms',
);

export default function Terms() {
  return (
    <div className="page-narrow">
      <h1>Terms</h1>
      <p className="subtext" style={{ marginTop: 12 }}>
        Final Circle is a free notice board for Free Fire matches in India. 18+ only. Every listing is free entry. Final Circle does not collect, hold, transfer or pay money.
      </p>

      <h2 style={{ marginTop: 24 }}>Hosts</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Posting a match is free. Every listing is free entry, with no advertised cash prize.</li>
        <li>Players enter their own rank and role. Those details are self-declared. Final Circle does not verify them.</li>
        <li>You see who joined, with display name, UID, BR and CS ranks, role and city. Players entered those details themselves.</li>
        <li>Do not ask players to pay to join. A payment request reported by two players who joined closes the match automatically and pauses your posting for seven days.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Players</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Joining is free. Never pay an entry fee, deposit or stake to join a listing.</li>
        <li>Your rank is self-declared. Final Circle does not verify players or issue verified badges.</li>
        <li>Final Circle does not collect, hold or pay money, does not run escrow and does not settle money disputes.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Sponsors</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Sponsors may place a message on the board or fund a free event. Players still pay nothing to join.</li>
        <li>Final Circle handles no sponsor money and advertises no cash prize on any listing. Read <Link href="/advertise" style={{ color: 'var(--accent)' }}>Advertise</Link> for placements.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Enforcement</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Report a match in the app first. Open the match, choose Report this match, pick a category and add a short note. If two players who joined the same match report a payment request, the match closes automatically and the host cannot post for seven days. No human reviews the report before this happens.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        If you cannot use the app, write to <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}>{BRAND.email}</a>. If it is still unresolved, you may approach the Online Gaming Authority of India within 30 days. This is a report path, not a promise about how quickly a match dispute is settled. The full rules are on <Link href="/safety" style={{ color: 'var(--accent)' }}>Safety and legal</Link>.
      </p>

      <h2 style={{ marginTop: 24 }}>Non-affiliation</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is not affiliated with Garena International II Private Limited, or with any Free Fire tournament host. Free Fire and Garena are trademarks of Garena International II Private Limited. All references to them in this document are for identification and compatibility only.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        This is background, not legal advice. India&apos;s PROGA 2025 and the 2026 Rules are why the board stays free entry with no advertised cash prize. A qualified lawyer must review the final product and copy before launch.
      </p>
      <p style={{ marginTop: 32 }}><Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link></p>
    </div>
  );
}
