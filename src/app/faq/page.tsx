import Link from 'next/link';

export const metadata = {
  title: 'FAQ — FF Scout',
  description: 'Who pays, how rank verification works, what happens when a player tries to cheat. Honest answers for Free Fire tournament organizers across India.',
};

const faqs = [
  {
    q: 'Why does FF Scout charge organizers and never the players?',
    a: 'The organizer is the one getting the shortlist they need to run their Free Fire tournament — the rosters, the ranks, the IDs. A player should never pay to climb into the same pool as other hopefuls. Events pay the entry fee; the prize goes to the players in their event.'
  },
  {
    q: 'How does rank verification actually work?',
    a: 'A player uploads screenshots of their Free Fire ranked page. The admin cross-checks the rank tier, the player ID shown, and the time of the screenshot. No AI decides rank; a person reviews every upload. If the upload is convincing, the player is in the pool. If not, it is rejected and the player can re-upload.'
  },
  {
    q: 'What if a player tries to lie about their rank?',
    a: 'The UID and screenshot sequence will not match the previous verification. The player stays out of the pool. Organizers who find an anomaly can flag the player — flagged multiple times and handled by admin.'
  },
  {
    q: 'How much does it cost to unlock a shortlist?',
    a: '₹499 per tournament event. Not per seat, not per player — per event. One unlock covers the shortlist for the whole event.'
  },
  {
    q: 'How do organizers get their tournament listed on FF Scout?',
    a: 'Email date, prize pool, and city to admin@ffscout.dev. Within one working day we will verify the event and get it into the organizer shortlist preview.'
  },
  {
    q: 'Is there a free trial or a plan to test the shortlist before paying?',
    a: 'Every tournament registered on FF Scout gets one preview of their roster shortlist — enough to see they are using it. Beyond that, each event costs ₹499.'
  },
];

export default function FAQ() {
  return (
    <div className="shell" style={{ padding: '48px 0 96px', maxWidth: 760 }}>
      <h1>Frequently asked</h1>
      <p className="subtext" style={{ marginTop: 12 }}>
        The questions we hear most from FF tournament organizers, casters, guild captains — answered plainly.
      </p>
      <dl style={{ marginTop: 24 }}>
        {faqs.map(({ q, a }) => (
          <div key={q} style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
            <dt style={{ fontWeight: 600, marginBottom: 6 }}>{q}</dt>
            <dd className="subtext" style={{ margin: 0 }}>{a}</dd>
          </div>
        ))}
      </dl>
      <p style={{ marginTop: 32 }}>
        <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link>
      </p>
    </div>
  );
}
