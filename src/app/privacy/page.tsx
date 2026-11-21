import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { publicMetadata } from '@/lib/seo';

export const metadata = publicMetadata(
  'Privacy Notice, Final Circle',
  'What Final Circle collects, why, how it is stored, and how to reach the grievance officer.',
  '/privacy',
);

export default function Privacy() {
  return (
    <div className="page-narrow">
      <h1>Privacy</h1>
      <p className="subtext" style={{ marginTop: 12 }}>Last updated: 19 November 2026. India-focused. We are a Data Fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP).</p>

      <h2 style={{ marginTop: 24 }}>Who we are, and who to complain to</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is built and operated by {BRAND.founder}, {BRAND.city}, {BRAND.country}. Grievance Officer (as required by the DPDP Rules):
        <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}> {BRAND.email}</a>.
        We acknowledge grievances within 72 hours and resolve them within 30 days. If unsatisfied, you may approach the Data Protection Board of India.
      </p>

      <h2 style={{ marginTop: 24 }}>What we collect, from whom, why</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Account (players &amp; hosts):</strong> email, password hash (bcrypt, never visible to anyone, including us), display name (IGN), role, rank, affiliation (college/org), city. Used to run accounts and to match hosts to players.</li>
        <li><strong>Match board (hosts):</strong> hosts see the players who joined, with display name, UID, BR and CS ranks, role, city and team name. Players enter their own rank. Sponsors see a player&apos;s profile only if the player opted in, never an email address. We never share passwords with anyone.</li>
        <li><strong>Waitlist (visitors):</strong> email, segment (host/player/sponsor), city. Used to notify you at launch. Deleted at launch + 90 days.</li>
        <li><strong>Match reports:</strong> category, reason, reporter and timestamp. Used to apply automatic match closures and posting pauses. No human reviews a report before the automatic consequence applies.</li>
        <li><strong>Operational logs:</strong> sign-in and internal actions (who acted, on what, when) kept for 90 days for abuse prevention. Rate-limit keys are temporary and discarded on window expiry.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>18+ only</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Final Circle is for users 18 years or older. By signing up you confirm you are 18+, recorded with your consent.
        We do not knowingly process data of persons under 18, if you are, or a parent/guardian believes your child signed up, write to the grievance officer and we will erase the account.
      </p>

      <h2 style={{ marginTop: 24 }}>What we do NOT collect</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Phone numbers, UPI details, bank details or payment credentials</li>
        <li>Precise location, contacts, chat messages, voice data, web history</li>
        <li>Analytics beyond what our hosting provider records to serve pages</li>
        <li>Marketing profiles, advertising identifiers, automated profiling of any kind</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Where your data lives</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Application hosting: Vercel Inc. (USA). Database: Neon (AWS ap-southeast-1, Singapore). Nothing else leaves these two providers.
        These processors are bound by their DPAs. Data may be transferred outside India where the DPDP Rules permit, no DPDP-blacklisted destination is used, and we re-check whenever those rules change. Backups follow the same terms.
      </p>

      <h2 style={{ marginTop: 24 }}>Your rights under DPDP</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Access:</strong> ask for a copy of what we hold about you, we reply with a CSV of your account and profile details.</li>
        <li><strong>Correction:</strong> ask us to fix wrong details (e.g., wrong IGN).</li>
        <li><strong>Erasure:</strong> use Settings → Delete account, or email the Grievance Officer. We delete the user row and confirm within 72 hours.</li>
        <li><strong>Grievance:</strong> if we fail, contact the Grievance Officer above; beyond that, the Data Protection Board of India.</li>
        <li><strong>Withdraw consent:</strong> email us; we erase your data on receipt.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Retention, plainly</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Account data, until you erase it (and always on request).</li>
        <li>Audit logs, 90 days.</li>
        <li>Report records (category, reason, reporter and timestamp), 90 days, with operational logs.</li>
        <li>Waitlist, until launch + 90 days, then deleted.</li>
        <li>Cookies, session cookie only; 7 days; no tracking cookies.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>What we never do</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        We do not sell your email, phone, or data to anyone, ever. Sponsors see only players who opted in, never email addresses.
      </p>

      <p style={{ marginTop: 32 }}><Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link></p>
    </div>
  );
}
