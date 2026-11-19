import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'FAQ, Final Circle',
  description: 'Who pays, how rank verification works, what happens when a player tries to cheat. Honest answers for Free Fire tournament organizers across India.',
};

const faqs = [
  {
    q: 'Why do organizers pay and players never do?',
    a: 'The organizer saves hours of DMs and re-verification; the player gets a verified shot at a paid roster. The side whose work shrinks pays; the side who wins on skill gets paid.'
  },
  {
    q: 'I am hosting a prize match, not a big tournament. Does it work for me?',
    a: 'Yes. Anyone putting up a prize and running a Free Fire match — café owner, fest lead, guild captain, YouTuber, college society, sponsor activation — hits the same wall: which of these 60 applicants actually has the rank they claim? We don\'t bracket or broadcast your match; we make sure the players who show up are real.',
  },
  {
    q: 'How does verification work?',
    a: 'A player uploads a screenshot of their Free Fire ranked page plus their in-game UID. A verifier checks the tier against the shot, the UID against the tier, and the freshness of the image. No AI decides rank. If the upload convinces, the player enters the pool; if not, the player gets the reason and can re-upload.'
  },
  {
    q: 'What if a player fakes a screenshot or a UID?',
    a: 'The UID in the screenshot will not match a fresh upload next season or another account. The player stays out of the pool. Organizers who spot an anomaly flag it, and repeated flags get the account removed from the pool.'
  },
  {
    q: 'How much does an unlock cost?',
    a: 'Pilot: free. At launch, ₹499 per event — not per seat, not per player. One unlock covers the shortlist for the whole event.'
  },
  {
    q: 'How do I get my prize match on Final Circle?',
    a: `Email date, prize pool and city to ${BRAND.email}. There is no listing process yet; pilot partners are onboarded city by city as capacity allows, starting with Hyderabad.`
  },
  {
    q: 'Can I try the shortlist before paying anything?',
    a: 'Yes. The pilot is free for every registered tournament. When payments launch, each new event costs ₹499; the pilot remains free until then.'
  },
];

export default function FAQ() {
  return (
    <div className="page-narrow">
      <h1>Frequently asked</h1>
      <p className="subtext" style={{ marginTop: 12 }}>
        The questions we hear most from FF tournament organizers, casters, guild captains, answered plainly.
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
