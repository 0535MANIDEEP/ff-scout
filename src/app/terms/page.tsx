import Link from 'next/link';

export const metadata = {
  title: 'Terms — FF Scout',
  description: 'Organizer, player and sponsor obligations under FF Scout.',
};

export default function Terms() {
  return (
    <div className="shell" style={{ padding: '48px 0 96px', maxWidth: 760 }}>
      <h1>Terms</h1>

      <h2 style={{ marginTop: 24 }}>Organizers</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>One event unlock covers only that one tournament or scrim series</li>
        <li>₹499 is non-refundable once the shortlist CSV has been downloaded</li>
        <li>Factual accuracy is required — FF Scout verifies ranks but organizers must still confirm finals</li>
        <li>Disputes go to admin@ffscout.dev within 14 days of the event</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Players</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>You verify once, then you keep the verified badge until you choose to delete your account</li>
        <li>Verification is by admin eye-review, not automation; it takes time — plan accordingly</li>
        <li>Players who upload fake screenshots are banned permanently and any verified roster place for them is re-offered</li>
        <li>Payment milestones (prize distribution) are handled inside the tournament, not by FF Scout</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Sponsors</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Sponsor activations list the number of verified players and the city; no player list is exposed</li>
        <li>₹15,000 flat unlock per activation cohort; refund conditions depend on verification outcome</li>
        <li>Final payment arrangements happen between sponsor and prize-pool operator, not FF Scout</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Non-affiliation</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        FF Scout is not affiliated with Garena International II Private Limited, or with any Free Fire tournament organiser. Free Fire and Garena are trademarks of Garena International II Private Limited. All references to them in this document are for identification and compatibility only.
      </p>
      <p style={{ marginTop: 32 }}><Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link></p>
    </div>
  );
}
