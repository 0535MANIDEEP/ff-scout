import Link from 'next/link';

export const metadata = {
  title: 'FAQ, Final Circle',
  description: 'What it costs to post or join, how the match board works, and how sponsor discovery works. Honest answers for Indian Free Fire players and hosts.',
};

const faqs = [
  {
    q: 'Does it cost anything to post or join?',
    a: 'Posting is free while we are in pilot, and players never pay to join. Entry fees and prizes are notes between host and players. Final Circle handles no money.'
  },
  {
    q: 'I am hosting a prize match, not a big tournament. Does it work for me?',
    a: 'Yes. Café owners, fest leads, guild captains, YouTubers, college societies and sponsor activations can post a match. Players join themselves and the host sees who joined, with UID and rank. Final Circle does not bracket or broadcast your match.',
  },
  {
    q: 'How do I get my match on Final Circle?',
    a: 'Post it yourself. Use Post a match. It goes on the board immediately, free while we\'re in pilot.'
  },
];

export default function FAQ() {
  return (
    <div className="page-narrow">
      <h1>Frequently asked</h1>
      <p className="subtext" style={{ marginTop: 12 }}>
        The questions players and hosts ask most, answered plainly.
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
