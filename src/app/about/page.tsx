import Link from 'next/link';
import { BRAND } from '@/shared/config/brand';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'About',
  'Why every Final Circle match is free entry, who the board is for, and what it does not do.',
  '/about',
);

const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H2 = 'text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const LIST = 'list-disc pl-[18px] text-lg leading-[1.55] text-muted max-[600px]:text-base [&>li]:leading-[1.65]';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default function About() {
  return (
    <div className={NARROW}>
      <h1 className={H1}>About Final Circle</h1>
      <p className={`mt-3 ${SUBTEXT}`}>Independent site · {BRAND.city}, {BRAND.country} · 2026</p>

      <h2 className={`mt-8 ${H2}`}>Why Final Circle exists</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Hosts in India recruit players in group chats. Useful messages get buried under spam and old rank claims. Final Circle puts one match in one post, so a host can see who joined and a player can see what is on.
      </p>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Every listing is free entry. That rule removes the case where a host collects money and never turns up. It also keeps the board away from the money-game line in India&apos;s PROGA 2025 and the 2026 Rules. That is background, not legal advice.
      </p>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        There is no approval queue and no checkout. Final Circle does not collect, hold or pay money, and does not advertise cash prizes.
      </p>

      <h2 className={`mt-8 ${H2}`}>Who this is for</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li><strong>Hosts:</strong> post a match and see who joined, with UID and rank</li>
        <li><strong>College fest leads:</strong> post the event once and let players join</li>
        <li><strong>Gaming café owners:</strong> fill weekly scrims</li>
        <li><strong>Players:</strong> find a free match and join</li>
      </ul>

      <h2 className={`mt-8 ${H2}`}>What Final Circle is not</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle is a match board. It does not build brackets, track stats, stream matches or verify players. Ranks are self-declared. Everything else is out of scope.
      </p>

      <p className="mt-8">
        <Link href="/" className={GHOST}>← Back home</Link>
      </p>
    </div>
  );
}
