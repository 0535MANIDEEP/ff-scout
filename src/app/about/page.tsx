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
        Final Circle started from a brutal observation: Indian college and grassroots Free Fire organizers recruit from group chats that spill into 200-member rectangles. 90% of applications are spam, the 10% real ones end up nowhere because nobody verifies them. Organisers waste 6–10 hours per tournament just verifying ranks, and organizers put out fake claims themselves because there is no verification layer for themselves or their brand activation partners.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is one person's attempt to compress that 8 hours into a single verified shortlist with filter, export and contact. One side pays — at launch, ₹499 per event. Pilot phase: free. the other side earns a role on a verified roster that pays out of the tournament prize pool.
      </p>

      <h2 style={{ marginTop: 32 }}>Who this is for</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Tournament organizers:</strong> vet 50 players in under 10 minutes</li>
        <li><strong>College fest leads:</strong> no ad hoc Google Forms; one export</li>
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
