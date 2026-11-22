import { ContactNow } from '@/shared/ui/ContactNow';
import { amazon, flipkart } from '@/features/sponsors/affiliate';
import { LOADOUT } from '@/shared/config/match';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'Free Fire loadout for India',
  'Gear Indian Free Fire players actually use, with disclosed affiliate links. Indicative prices, no paid placements.',
  '/loadout',
);

const GEAR = LOADOUT;

const SHELL = 'mx-auto w-full max-w-[880px] px-6 pb-14 max-[600px]:px-4';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H2 = 'text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-ink';
const LEAD = 'mt-[10px] max-w-[62ch] text-lg leading-[1.6] text-ink';
const CARD = 'rounded-card border border-[#CFC8B9] bg-panel shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default function Loadout() {
  return (
    <div className={SHELL}>
      <h1 className={`mt-8 ${H1}`}>Free Fire loadout</h1>
      <p className={LEAD}>Gear that works for Free Fire players on a budget. Prices are indicative, so check the live listing before you buy.</p>

      <div className={`mt-4 border-vermilion p-6 ${CARD}`}>
        <p className="text-sm leading-[1.65]"><strong>Disclosure:</strong> links on this page earn a small affiliate commission from Amazon.in and Flipkart. They help pay for hosting. Nothing on this page is paid placement, and commissions do not change the ranking.</p>
        <p className="mt-2 text-sm leading-[1.65]">Final Circle never earns from entry fees or prizes.</p>
      </div>

      <div className="mt-[18px] flex flex-col gap-3">
        {GEAR.map(g => (
          <div key={g.label} className={`border-[#CFC8B9] ${CARD} p-6`}>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className={`m-0 ${H2}`}>{g.label}</h2>
              <span className="font-mono text-sm text-vermilion">{g.price}</span>
            </div>
            <p className={`mt-2 ${SUBTEXT}`}>{g.note}</p>
            <div className="mt-[10px] flex gap-[10px]">
              <a className={GHOST} href={amazon(g.q)} target="_blank" rel="noopener noreferrer">Amazon.in</a>
              <a className={GHOST} href={flipkart(g.q)} target="_blank" rel="noopener noreferrer">Flipkart</a>
            </div>
          </div>
        ))}
      </div>

      <p className={`mt-[18px] ${SUBTEXT}`}>Buying through these links helps pay for hosting. To suggest a gear pick, use the <ContactNow /> link.</p>
    </div>
  );
}
