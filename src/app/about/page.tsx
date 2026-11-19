import Link from 'next/link';

export const metadata = {
  title: 'About, Final Circle',
  description: 'Who built Final Circle, why, and who it helps.',
};

export default function About() {
  return (
    <div className="page-narrow">
      <h1>About Final Circle</h1>
      <p className="subtext" style={{ marginTop: 12 }}>Independent builder · India · Free Fire grassroots, 2026</p>

      <h2 style={{ marginTop: 32 }}>Why Final Circle exists</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle started from one observation: Indian prize-money Free Fire hosts recruit from group chats where almost everything is spam, outdated rank, or fantasy. The few real players get buried in that same pile, because nothing in those chats verifies a single screenshot against a UID.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is one person's attempt to take that pile and produce one verified shortlist with filters, export and contact. The pipeline is deliberately not a one-person bottleneck: trusted verifiers review with a full audit trail, and revocable access. One side pays — at launch, ₹499 per event. Pilot phase: free. The other side gets a verified spot on a roster that pays out of the tournament prize pool.
      </p>

      <h2 style={{ marginTop: 32 }}>Who this is for</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Tournament organizers:</strong> filter 50 players by role, rank and affiliation in minutes, not DMs</li>
        <li><strong>College fest leads:</strong> no ad hoc Google Forms; one CSV export</li>
        <li><strong>Gaming café owners:</strong> fill weekly scrims</li>
        <li><strong>Sponsor activation leads:</strong> reach verified FF cohorts</li>
        <li><strong>Players:</strong> get verified, get picked, get paid from your prize pool</li>
      </ul>

      <h2 style={{ marginTop: 32 }}>What Final Circle is not</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is not a bracket builder, a stats site, a streaming platform, or a complete feature CRM. It is one page: a verified roster filter. Everything else stops.
      </p>

      <p style={{ marginTop: 32 }}>
        <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link>
      </p>
    </div>
  );
}
