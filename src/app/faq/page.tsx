import Link from 'next/link';
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';
import { publicMetadata } from '@/lib/seo';

export const metadata = publicMetadata(
  'FAQ: free entry, no money handled, Final Circle',
  'Free entry, no money handled by Final Circle, reporting, and how the board works. Honest answers for Indian Free Fire players and hosts.',
  '/faq',
);

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'Does it cost anything?',
    a: 'No. Posting and joining are free. Every listing is free entry and Final Circle handles no money. 18+ only.',
  },
  {
    q: 'Can I advertise a cash prize or charge entry?',
    a: <>No. We do not advertise cash prizes or entry fees on any listing, and no player pays the platform to join. The reason is in <Link href="/safety" className="text-vermilion">Safety and legal</Link>.</>,
  },
  {
    q: 'Someone asked me to pay. What now?',
    a: <>Do not pay. Open the match and choose Report this match, pick the payment request category and add a short note. If two players who joined report the same payment request, the match closes automatically and the host cannot post for seven days. No human reviews the report first. If you cannot use the app, write to <a href={`mailto:${BRAND.email}`} className="text-vermilion">{BRAND.email}</a>. If it is still unresolved, you may approach the Online Gaming Authority of India within 30 days. More detail is on <Link href="/safety" className="text-vermilion">Safety and legal</Link>.</>,
  },
  {
    q: 'How does Final Circle earn?',
    a: 'Sponsor placements, disclosed affiliate links on the loadout page, and sponsor-funded free events. Players never pay the platform. There is no rate card and no checkout here.',
  },
  {
    q: 'Is this an official or registered e-sport?',
    a: <>No. Final Circle is an independent notice board, not an official Garena or Free Fire service and not a registered e-sport. We are not legal counsel and this is not a legal compliance promise. The background is on <Link href="/safety" className="text-vermilion">Safety and legal</Link>.</>,
  },
  {
    q: 'Does Final Circle verify ranks?',
    a: 'No. Players enter their own rank. We do not verify players or issue verified badges. Hosts see the rank a player entered.',
  },
  {
    q: 'I am hosting a small match, not a big tournament. Does it work for me?',
    a: 'Yes. Cafés, fest leads, guild captains, creators and college societies can post a match. Players join themselves and the host sees who joined, with UID and self-declared rank. Final Circle does not bracket or broadcast your match.',
  },
  {
    q: 'How do I get my match on Final Circle?',
    a: 'Post it yourself with Post a match. It goes on the board immediately. Posting is free and every listing is free entry.',
  },
];

const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default function FAQ() {
  return (
    <div className={NARROW}>
      <h1 className={H1}>Frequently asked</h1>
      <p className={`mt-3 ${SUBTEXT}`}>
        The questions players and hosts ask most, answered plainly.
      </p>
      <dl className="mt-6">
        {faqs.map(({ q, a }) => (
          <div key={q} className="mb-[22px] border-b border-line pb-[18px]">
            <dt className="mb-[6px] font-semibold">{q}</dt>
            <dd className={`m-0 ${SUBTEXT}`}>{a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 flex flex-wrap gap-[10px]">
        <Link href="/safety" className={BTN}>Read safety and legal</Link>
        <Link href="/" className={GHOST}>← Back home</Link>
      </p>
    </div>
  );
}
