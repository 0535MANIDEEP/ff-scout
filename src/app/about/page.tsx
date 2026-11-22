import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { publicMetadata } from '@/lib/seo';

export const metadata = publicMetadata(
  'About Final Circle, free-entry match board for India',
  'Who built Final Circle, why the board is free entry only, and who it helps.',
  '/about',
);

export default function About() {
  return (
    <div className="page-narrow">
      <h1>About Final Circle</h1>
      <p className="subtext" style={{ marginTop: 12 }}>Independent builder · {BRAND.city}, {BRAND.country} · Free Fire grassroots, 2026</p>

      <h2 style={{ marginTop: 32 }}>Why Final Circle exists</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle started from one observation: Indian Free Fire hosts recruit from group chats where almost everything is spam, outdated rank, or fantasy. Real players get buried in that same pile, and hosts waste time reading through it. {BRAND.founder}, an independent builder, put up one board to sort that out.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        Every listing here is free entry. That is a rule, not a pilot setting. Removing entry fees takes away the ditch-and-run scam where a host collects money and never shows up. It also keeps the board away from the money-game line in India&apos;s PROGA 2025 and the 2026 Rules, which took effect on 1 May 2026. We are not legal counsel. A lawyer review is still required before launch.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is one board where hosts post matches and players join. There is no approval queue and no checkout. Final Circle does not collect, hold or pay money, and does not advertise cash prizes.
      </p>

      <h2 style={{ marginTop: 32 }}>Who this is for</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Hosts:</strong> post a match and see who joined, with UID and rank</li>
        <li><strong>College fest leads:</strong> post the event once and let players join themselves</li>
        <li><strong>Gaming café owners:</strong> fill weekly scrims</li>
        <li><strong>Players:</strong> find matches and join free</li>
      </ul>

      <h2 style={{ marginTop: 32 }}>What Final Circle is not</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is not a bracket builder, a stats site, a streaming platform, a verification service or a money-game platform. It is one match board: hosts post, players join, ranks are self-declared. Everything else stops.
      </p>

      <p style={{ marginTop: 32 }}>
        <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link>
      </p>
    </div>
  );
}
