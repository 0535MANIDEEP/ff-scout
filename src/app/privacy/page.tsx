import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { publicMetadata } from '@/lib/seo';

export const metadata = publicMetadata(
  'Privacy Notice, Final Circle',
  'What Final Circle collects, why, how it is stored, and how to reach the grievance officer.',
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
      <h1 className={H1}>Privacy</h1>
      <p className={`mt-3 ${SUBTEXT}`}>Last updated: 19 November 2026. India-focused. We are a Data Fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP).</p>

      <h2 className={`mt-6 ${H2}`}>Who we are, and who to complain to</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle is built and operated by {BRAND.founder}, {BRAND.city}, {BRAND.country}. Grievance Officer (as required by the DPDP Rules):
        <a href={`mailto:${BRAND.email}`} className="text-vermilion"> {BRAND.email}</a>.
        We acknowledge grievances within 72 hours and resolve them within 30 days. If unsatisfied, you may approach the Data Protection Board of India.
      </p>

      <h2 className={`mt-6 ${H2}`}>What we collect, from whom, why</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li><strong>Account (players &amp; hosts):</strong> email, password hash (bcrypt, never visible to anyone, including us), display name (IGN), role, rank, affiliation (college/org), city. Used to run accounts and to match hosts to players.</li>
        <li><strong>Match board (hosts):</strong> hosts see the players who joined, with display name, UID, BR and CS ranks, role, city and team name. Players enter their own rank. We never share passwords with anyone.</li>
        <li><strong>Match reports:</strong> category, reason, reporter and timestamp. Used to apply automatic match closures and posting pauses. No human reviews a report before the automatic consequence applies.</li>
        <li><strong>Operational logs:</strong> sign-in and internal actions (who acted, on what, when) kept for 90 days for abuse prevention. Rate-limit keys are temporary and discarded on window expiry.</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>18+ only</h2>
      <p className={`mt-[10px] ${SUBTEXT}`}>
        Final Circle is for users 18 years or older. By signing up you confirm you are 18+, recorded with your consent.
        We do not knowingly process data of persons under 18, if you are, or a parent/guardian believes your child signed up, write to the grievance officer and we will erase the account.
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
        Application hosting: Vercel Inc. (USA). Database: Neon (AWS ap-southeast-1, Singapore). Nothing else leaves these two providers.
        These processors are bound by their DPAs. Data may be transferred outside India where the DPDP Rules permit, no DPDP-blacklisted destination is used, and we re-check whenever those rules change. Backups follow the same terms.
      </p>

      <h2 className={`mt-6 ${H2}`}>Your rights under DPDP</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li><strong>Access:</strong> ask for a copy of what we hold about you, we reply with a CSV of your account and profile details.</li>
        <li><strong>Correction:</strong> ask us to fix wrong details (e.g., wrong IGN).</li>
        <li><strong>Erasure:</strong> use Settings → Delete account, or email the Grievance Officer. We delete the user row and confirm within 72 hours.</li>
        <li><strong>Grievance:</strong> if we fail, contact the Grievance Officer above; beyond that, the Data Protection Board of India.</li>
        <li><strong>Withdraw consent:</strong> email us; we erase your data on receipt.</li>
      </ul>

      <h2 className={`mt-6 ${H2}`}>Retention, plainly</h2>
      <ul className={`mt-[10px] ${LIST}`}>
        <li>Account data, until you erase it (and always on request).</li>
        <li>Audit logs, 90 days.</li>
        <li>Report records (category, reason, reporter and timestamp), 90 days, with operational logs.</li>
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
