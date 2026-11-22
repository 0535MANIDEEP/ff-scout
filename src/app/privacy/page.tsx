import Link from 'next/link';
import { BRAND } from '@/shared/config/brand';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'Privacy notice',
  'What Final Circle collects, how long it is kept, and how to reach us.',
  '/privacy',
);

const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H2 = 'text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const LIST = 'list-disc pl-[18px] text-lg leading-[1.55] text-muted max-[600px]:text-base [&>li]:leading-[1.65]';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default function Privacy() {
  return (
    <div className={NARROW}>
      <h1 className={H1}>Privacy notice</h1>
      <p className={`mt-3 ${SUBTEXT}`}>Last updated: 19 November 2026. India-focused. We collect only what the flows below need.</p>

      <h2 className={`mt-6 ${H2}`}>Who we are, and how to reach us</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle is built and operated by the Final Circle team, {BRAND.city}, {BRAND.country}. For privacy questions or complaints, write to
        <a href={`mailto:${BRAND.email}`} className="text-vermilion"> {BRAND.email}</a>. We read every message and reply as soon as we can.
      </p>

      <h2 className={`mt-6 ${H2}`}>What we collect, from whom, why</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li><strong>Account (players &amp; hosts):</strong> email, password hash (bcrypt, never visible to anyone, including us), display name (IGN), role, rank and city. Used to run accounts and to match hosts to players. We do not ask for a college, guild or employer name at sign-up.</li>
        <li><strong>Match board (hosts):</strong> hosts see the players who joined, with display name, UID, BR and CS ranks, role, city and team name. Players enter their own rank. We never share passwords with anyone.</li>
        <li><strong>Match reports:</strong> category, reason, reporter and timestamp. Used to apply automatic match closures and posting pauses. No human reviews a report before the automatic consequence applies.</li>
        <li><strong>Operational logs:</strong> sign-in and internal actions (who acted, on what, when) kept for abuse prevention. Rate-limit keys are temporary and discarded on window expiry.</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>18+ only</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle is for users 18 years or older. By signing up you confirm you are 18+, recorded with your consent.
        We do not knowingly process data of persons under 18, if you are, or a parent/guardian believes your child signed up, write to us and we will erase the account.
      </p>

      <h2 className={`mt-6 ${H2}`}>What we do NOT collect</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li>Phone numbers, UPI details, bank details or payment credentials</li>
        <li>Precise location, contacts, chat messages, voice data, web history</li>
        <li>Analytics beyond what our hosting provider records to serve pages</li>
        <li>Marketing profiles, advertising identifiers, automated profiling of any kind</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>Where your data lives</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Application hosting: Vercel Inc. (USA). Database: Neon (AWS ap-southeast-1, Singapore). Those are the only providers that hold application data.
        Because those services are hosted there, data may be processed outside India.
      </p>

      <h2 className={`mt-6 ${H2}`}>Your choices</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li><strong>Access:</strong> write to the address above and ask what we hold about you.</li>
        <li><strong>Correction:</strong> most profile fields can be edited in Settings; write to us for anything else.</li>
        <li><strong>Erasure:</strong> use Settings → Delete account, or email the address above. The account and its linked records are removed.</li>
        <li><strong>Complaints:</strong> use the address above if something goes wrong.</li>
        <li><strong>Withdraw consent:</strong> email us and we erase your data.</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>Retention, plainly</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li>Account data, until you erase it (and always on request).</li>
        <li>Audit and report records: kept for abuse prevention. Audit details do not hold email addresses.</li>
        <li>Cookies, session cookie only; 7 days; no tracking cookies.</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>What we never do</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        We do not sell your email, phone, or data to anyone, ever.
      </p>

      <p className="mt-8"><Link href="/" className={GHOST}>← Back home</Link></p>
    </div>
  );
}
