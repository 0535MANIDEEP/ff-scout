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
        Final Circle started from one observation: Indian prize-money Free Fire hosts recruit from group chats where almost everything is spam, outdated rank, or fantasy. Real players get buried in that same pile, and hosts waste time reading through it.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is one board where hosts post matches and players join. There is no approval step and no paid tier. Posting is free while we are in pilot, and players never pay the platform. Entry fees and prizes are notes between host and players. Final Circle handles no money.
      </p>

      <h2 style={{ marginTop: 32 }}>Who this is for</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Hosts:</strong> post a match and see who joined, with UID and rank</li>
        <li><strong>College fest leads:</strong> post the event once and let players join themselves</li>
        <li><strong>Gaming café owners:</strong> fill weekly scrims</li>
        <li><strong>Sponsor activation leads:</strong> reach players who opted in</li>
        <li><strong>Players:</strong> find matches and get noticed by sponsors you allow</li>
      </ul>

      <h2 style={{ marginTop: 32 }}>What Final Circle is not</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is not a bracket builder, a stats site, a streaming platform, or a complete feature CRM. It is one match board: hosts post, players join. Everything else stops.
      </p>

      <p style={{ marginTop: 32 }}>
        <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link>
      </p>
    </div>
  );
}
