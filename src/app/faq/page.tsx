import Link from 'next/link';

export const metadata = {
  title: 'FAQ — FF Scout',
  description: 'Who pays, how verification works, what happens if someone lies.',
};

const faqs = [
  { q: 'Why does FF Scout charge organizers but not players?', a: 'The organizer gets the shortlist. The player gets match money from the event pool. Players never pay. Organisers pay only when they actually need a roster, not before.' },
  { q: 'How does rank verification work?', a: 'Two screenshots of the Free Fire ranked page are uploaded. Each is eye-verified by the FF Scout admin for rank tier and handle. No AI decides rank; no automation selects winners.' },
  { q: 'What if a player lies about their rank?', a: 'The screenshot sequence will not match your uploaded screenshot, or the UID will not match. Verification fails; the player is not in the pool. In the off chance of an in-person anomaly at an event, organizers can flag and remove at a roster review step.' },
  { q: 'Is there a free trial unlock?', a: 'The CSV shortlist is gated behind ₹499. A full demo unlock will be available at the first live event. Until then, fees are frozen.' },
  { q: 'Can a tournament org pay ₹499 for its whole event?', a: 'Yes. One ₹499 unlock per event, regardless of size.' },
  { q: 'How do I get my tournament listed?', a: 'Send the date, prize pool, and city to admin@ffscout.dev (or any organizer contact shown on signup page). We review and list within 24 hours.' },
];

export default function FAQ() {
  return (
    <main className="shell" style={{ padding: '48px 0 96px', maxWidth: 760 }}>
      <h1>FAQ</h1>
      <p className="subtext" style={{ marginTop: 12 }}>Honest answers about pricing, verification and rosters.</p>
      <dl style={{ marginTop: 24 }}>
        {faqs.map(({ q, a }) => (
          <div key={q} style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
            <dt style={{ fontWeight: 700, marginBottom: 6 }}>{q}</dt>
            <dd className="subtext" style={{ margin: 0 }}>{a}</dd>
          </div>
        ))}
      </dl>
      <p style={{ marginTop: 32 }}>
        <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link>
      </p>
    </main>
  );
}
