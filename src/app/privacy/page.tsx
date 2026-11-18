import Link from 'next/link';

export const metadata = {
  title: 'Privacy — FF Scout',
  description: 'What FF Scout collects, why, and how you can ask for it to be removed.',
};

export default function Privacy() {
  return (
    <div className="shell" style={{ padding: '48px 0 96px', maxWidth: 760 }}>
      <h1>Privacy</h1>
      <p className="subtext" style={{ marginTop: 12 }}>Last updated: 18 November 2026. India-focused.</p>

      <h2 style={{ marginTop: 24 }}>What we collect</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Identity:</strong> email address, display name</li>
        <li><strong>Game:</strong> rank tier, loadout preference, IGN</li>
        <li><strong>Proof:</strong> two screenshots uploaded by the player</li>
        <li><strong>Event context (organizers only):</strong> tournament name and city</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>What we do not collect</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Device identifiers, web history, analytics beyond page views</li>
        <li>UPI/payment information beyond the single one-time event unlock</li>
        <li>Voice recordings, videos, chat messages between organizers and players</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Your rights</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Email admin@ffscout.dev. We respond within 72 hours. For deletion, we remove your row and all verification evidence. For a copy of what we hold, we export a CSV of your data.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        We are not a data-broker. No we do not sell your email or phone number to any third party. No we do not sell user lists to sponsors. When a sponsor activation happens, we describe the cohort as "100+ verified FF rosters in [city]" — never person-level.
      </p>
      <p style={{ marginTop: 32 }}><Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link></p>
    </div>
  );
}
