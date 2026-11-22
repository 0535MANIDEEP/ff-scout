import Link from 'next/link';
import { ContactNow } from '@/shared/ui/ContactNow';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'Terms of use',
  'Rules for hosts, players and sponsors on the free-entry Final Circle match board. 18+ only.',
  '/terms',
);

const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H2 = 'text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const LIST = 'list-disc pl-[18px] text-lg leading-[1.55] text-muted max-[600px]:text-base [&>li]:leading-[1.65]';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default function Terms() {
  return (
    <div className={NARROW}>
      <h1 className={H1}>Terms of use</h1>
      <p className={`mt-3 ${SUBTEXT}`}>
        Final Circle is a free notice board for Free Fire matches in India. 18+. Every listing is free entry. Final Circle collects, holds and pays no money.
      </p>

      <h2 className={`mt-6 ${H2}`}>Hosts</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li>Posting a match is free. Every listing is free entry, with no advertised cash prize.</li>
        <li>Players enter their own rank and role. Those details are self-declared. Final Circle does not verify them.</li>
        <li>You see who joined, with display name, UID, BR and CS ranks, role and city. Players entered those details themselves.</li>
        <li>Do not ask players to pay to join. A payment request reported by two players who joined closes the match automatically and pauses your posting for seven days.</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>Players</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li>Joining is free. Never pay an entry fee, deposit or stake to join a listing.</li>
        <li>Your rank is self-declared. Final Circle does not verify players or issue verified badges.</li>
        <li>Final Circle does not collect, hold or pay money, does not run escrow and does not settle money disputes.</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>Sponsors</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li>Sponsors may place a message on the board or fund a free event. Players still pay nothing to join.</li>
        <li>Final Circle handles no sponsor money and advertises no cash prize on any listing. Read <Link href="/advertise" className="text-vermilion">Advertise</Link> for placements.</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>Enforcement</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Report a match in the app first. Open the match, choose Report this match, pick a category and add a short note. Two players who joined the same match reporting a payment request close the match automatically and pause the host for seven days. No one reviews the report first.
      </p>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        If you cannot use the app, use the <ContactNow /> link. This is our report path. We make no promise about how quickly a match dispute is settled. The full rules are on <Link href="/safety" className="text-vermilion">Safety and legal</Link>.
      </p>

      <h2 className={`mt-6 ${H2}`}>Non-affiliation</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle is not affiliated with Garena International II Private Limited, or with any Free Fire tournament host. Free Fire and Garena are trademarks of Garena International II Private Limited. All references to them in this document are for identification and compatibility only.
      </p>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        This is background, not legal advice or a compliance promise. India&apos;s PROGA 2025 and the 2026 Rules are why the board stays free entry with no advertised cash prize.
      </p>
      <p className="mt-8"><Link href="/" className={GHOST}>← Back home</Link></p>
    </div>
  );
}
