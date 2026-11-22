import Link from 'next/link';
import { BRAND } from '@/shared/config/brand';
import { ContactNow } from '@/shared/ui/ContactNow';
import { GLOBAL_DISCLOSURE } from '@/features/disclosure/copy';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'Safety and legal: free-entry rules',
  'The free-entry rule, no-money rule, reporting and grievance paths, and how Final Circle earns money. Read before posting or joining.',
  '/safety',
);

const RESEARCH = [
  { label: 'GaganLegal, Online Gaming Rules 2026', href: 'https://gaganlegal.com/articles/online-gaming-proga-rules-2026' },
  { label: 'SolvLegal, Online Gaming Rules 2026 and esports', href: 'https://solvlegal.com/blogs/online-gaming-rules-2026-india-money-games-ban-esports' },
];

const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const EYEBROW = 'block font-mono text-xs font-semibold tracking-[0.08em] text-muted';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H2 = 'text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink';
const LEAD = 'mt-3 max-w-[62ch] text-lg leading-[1.6] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const LIST = 'list-disc pl-[18px] text-lg leading-[1.55] text-muted max-[600px]:text-base [&>li]:leading-[1.65]';
const CARD = 'rounded-card border border-[#CFC8B9] bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default function Safety() {
  return (
    <div className={NARROW}>
      <span className={`mt-8 ${EYEBROW}`}>THE RULES, IN PLAIN WORDS</span>
      <h1 className={`mt-[10px] ${H1}`}>Safety and legal</h1>
      <p className={LEAD}>{GLOBAL_DISCLOSURE}</p>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        This page is the short version of the rules that govern every listing on Final Circle. If a post or a message contradicts anything here, trust this page.
      </p>

      <section className={`mt-6 ${CARD}`}>
        <h2 className={H2}>What Final Circle is</h2>
        <p className={`mt-2 ${SUBTEXT}`}>
          A notice board for Free Fire matches in India. Hosts post a match. Players join it. The host sees the roster with the display name, UID and self-declared ranks each player entered. Final Circle is the board, not the tournament organiser.
        </p>
      </section>

      <section className="mt-7">
        <h2 className={H2}>What we do not do</h2>
        <ul className={`mt-[10px] ${LIST}`}>
          <li>We do not ask players to pay an entry fee, deposit or stake to join a listing.</li>
          <li>We do not advertise cash prizes or prize pools on any listing.</li>
          <li>We do not collect, hold, transfer or pay out money. There is no escrow or payment rail here.</li>
          <li>We do not verify players, check screenshots, issue verified badges or maintain a verified shortlist.</li>
          <li>We do not settle disputes between a host and a player about money, because no money moves through us.</li>
          <li>We do not promise a match will happen. Listings are posted by hosts, and we show what the database says.</li>
        </ul>
      </section>

      <section className="mt-7">
        <h2 className={H2}>Why the rule is this strict</h2>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          India&apos;s Promotion and Regulation of Online Gaming Act 2025 and the 2026 Rules are the reason this board stays away from money games. In broad terms, an online money game is one where a player puts money in and expects money or something monetisable out. We do not offer, advertise or facilitate that kind of game.
        </p>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          Any esports exemption depends on recognition and registration that we do not hold. Final Circle is an independent community site. Free entry with no advertised cash prize is the line we stay on — a product rule, not a legal status.
        </p>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          This is background research, not legal advice or a compliance promise. Background reading:
        </p>
        <ul className={`mt-2 ${LIST}`}>
          {RESEARCH.map(({ label, href }) => (
            <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="text-vermilion">{label}</a></li>
          ))}
        </ul>
      </section>

      <section className="mt-7">
        <h2 className={H2}>Free events and sponsor funding</h2>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          A sponsor may pay to place a message on the site or fund a free event. Players still pay nothing to join. Any reward is funded and delivered by the sponsor, outside Final Circle. We never hold the money and we never advertise a cash prize on a listing. If you want to fund an event, read <Link href="/advertise" className="text-vermilion">Advertise</Link>.
        </p>
      </section>

      <section className="mt-7">
        <h2 className={H2}>18+ only</h2>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          Final Circle is for people aged 18 or older. Signing up records that confirmation. If you believe someone under 18 has an account, use the grievance link below and we will erase it.
        </p>
      </section>

      <section className="mt-7">
        <h2 className={H2}>How reporting works</h2>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          Open any match and use &quot;Report this match&quot;. Pick a category and add a short note. Categories are asking players to pay, fake or finished match, and something else.
        </p>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          When two players who actually joined the same match report it for asking players to pay, the match closes automatically and the host cannot post for exactly seven days. The clock is set by our server, not by a reviewer. The consequence cannot be skipped by waiting for a human to read the report. The match then shows the real number of joined reports. Reports are kept with our operational logs.
        </p>
      </section>

      <section className="mt-7">
        <h2 className={H2}>Grievance path</h2>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          Report the match in the app first. If you cannot use the app, use the <ContactNow /> link. Privacy questions and complaints use the same link; see the <Link href="/privacy" className="text-vermilion">privacy notice</Link>. This is our own escalation path, not a promise about legal forums or time limits.
        </p>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          Point of contact: the Final Circle team, {BRAND.city}, {BRAND.country}.
        </p>
      </section>

      <section className="mt-7">
        <h2 className={H2}>How we earn</h2>
        <ul className={`mt-[10px] ${LIST}`}>
          <li>Sponsor placements on the site, disclosed wherever they appear.</li>
          <li>Disclosed affiliate links on the loadout page. A purchase there earns a small commission from the retailer.</li>
          <li>Sponsor-funded free events, where the sponsor pays outside the app and the player pays nothing.</li>
        </ul>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          We do not earn from entry fees, prizes, verification fees or paid tiers. There is no checkout on this site.
        </p>
      </section>

      <section className="mt-7">
        <h2 className={H2}>Independent site</h2>
        <p className={`mt-[10px] ${SUBTEXT}`}>
          Final Circle is not affiliated with Garena, Free Fire, any government body or any esports organisation. {BRAND.trademark} Nothing here is official Garena or Free Fire merchandise, communication or policy.
        </p>
      </section>

      <div className="mt-7 flex flex-wrap items-center gap-[10px]">
        <Link href="/matches" className={BTN}>Browse free matches</Link>
        <Link href="/terms" className={GHOST}>Terms</Link>
        <Link href="/privacy" className={GHOST}>Privacy</Link>
      </div>
    </div>
  );
}
