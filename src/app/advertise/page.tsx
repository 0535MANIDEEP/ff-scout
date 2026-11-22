import Link from 'next/link';
import { ContactNow } from '@/shared/ui/ContactNow';
import { GLOBAL_DISCLOSURE } from '@/features/disclosure/copy';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'Advertise and sponsor free events',
  'Sponsor placements and sponsor-funded free events on a free-entry Free Fire match board. No player pays, and Final Circle handles no money.',
  '/advertise',
);

const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const EYEBROW = 'block font-mono text-xs font-semibold tracking-[0.08em] text-muted';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H2 = 'text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink';
const LEAD = 'mt-3 max-w-[62ch] text-lg leading-[1.6] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const LIST = 'list-disc pl-[18px] text-lg leading-[1.55] text-muted max-[600px]:text-base [&>li]:leading-[1.65]';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default function Advertise() {
  return (
    <div className={NARROW}>
      <span className={`mt-8 ${EYEBROW}`}>SPONSORS · FREE EVENTS ONLY</span>
      <h1 className={`mt-[10px] ${H1}`}>Advertise on Final Circle</h1>
      <p className={LEAD}>{GLOBAL_DISCLOSURE}</p>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        We work with brands that want to reach grassroots Free Fire players in India. We do not work with real-money gaming, betting or anything that asks a player to pay to take part.
      </p>

      <section className="mt-6">
        <h2 className={H2}>What we offer</h2>
        <ul className={`mt-[10px] ${LIST}`}>
          <li><strong>Sponsor placement:</strong> a named line in the site footer, labelled as a sponsor. It is not shown as a match result or a player endorsement.</li>
          <li><strong>Sponsor-funded free events:</strong> you fund an event and deliver any reward directly. Players join free and Final Circle holds no money.</li>
        </ul>
      </section>

      <section className="mt-7">
        <h2 className={H2}>What we will not do</h2>
        <ul className={`mt-[10px] ${LIST}`}>
          <li>Advertise entry fees, cash prizes or anything that looks like a paid game.</li>
          <li>Hold, collect or pay out money from players or sponsors on the site.</li>
          <li>Sell a verified badge, a shortlist or a guaranteed player count.</li>
          <li>Publish a rate card before a real buyer agrees to real terms.</li>
        </ul>
      </section>

      <section className="mt-7">
        <h2 className={H2}>Data and disclosure</h2>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          Sponsor placement is labelled where it appears. Affiliate links on the loadout page are also labelled. We do not sell player data or email addresses. Reporting and removal rules apply to sponsors too. Read the notice on <Link href="/safety" className="text-vermilion">Safety and legal</Link>.
        </p>
      </section>

      <section className="mt-7">
        <h2 className={H2}>Talk to us</h2>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          Use the <ContactNow /> link to tell us what you want to fund and when. We reply with what we can deliver.
        </p>
      </section>

      <div className="mt-7 flex flex-wrap items-center gap-[10px]">
        <ContactNow variant="button" subject="Sponsor enquiry" />
        <Link href="/matches" className={GHOST}>See the board</Link>
      </div>
    </div>
  );
}
