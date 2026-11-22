import Link from 'next/link';
import { BRAND } from '@/shared/config/brand';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'About Final Circle, free-entry match board for India',
  'Who built Final Circle, why the board is free entry only, and who it helps.',
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
      <p className={`mt-3 ${SUBTEXT}`}>Independent builder · {BRAND.city}, {BRAND.country} · Free Fire grassroots, 2026</p>

      <h2 className={`mt-8 ${H2}`}>Why Final Circle exists</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle started from one observation: Indian Free Fire hosts recruit from group chats where almost everything is spam, outdated rank, or fantasy. Real players get buried in that same pile, and hosts waste time reading through it. {BRAND.founder}, an independent builder, put up one board to sort that out.
      </p>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Every listing here is free entry. That is a rule, not a pilot setting. Removing entry fees takes away the ditch-and-run scam where a host collects money and never shows up. It also keeps the board away from the money-game line in India&apos;s PROGA 2025 and the 2026 Rules, which took effect on 1 May 2026. We are not legal counsel. A lawyer review is still required before launch.
      </p>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle is one board where hosts post matches and players join. There is no approval queue and no checkout. Final Circle does not collect, hold or pay money, and does not advertise cash prizes.
      </p>

      <h2 className={`mt-8 ${H2}`}>Who this is for</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li><strong>Hosts:</strong> post a match and see who joined, with UID and rank</li>
        <li><strong>College fest leads:</strong> post the event once and let players join themselves</li>
        <li><strong>Gaming café owners:</strong> fill weekly scrims</li>
        <li><strong>Players:</strong> find matches and join free</li>
      </ul>

      <h2 className={`mt-8 ${H2}`}>What Final Circle is not</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle is not a bracket builder, a stats site, a streaming platform, a verification service or a money-game platform. It is one match board: hosts post, players join, ranks are self-declared. Everything else stops.
      </p>

      <p className="mt-8">
        <Link href="/" className={GHOST}>← Back home</Link>
      </p>
    </div>
  );
}
