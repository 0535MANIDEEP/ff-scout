import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'Privacy — FF Scout',
  description: 'What FF Scout collects, why, how it is stored, and how to reach the grievance officer.',
};

export default function Privacy() {
  return (
    <div className="shell" style={{ padding: '48px 0 96px', maxWidth: 760 }}>
      <h1>Privacy</h1>
      <p className="subtext" style={{ marginTop: 12 }}>Last updated: 19 November 2026. India-focused. We are a Data Fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP).</p>

      <h2 style={{ marginTop: 24 }}>Who we are, and who to complain to</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        FF Scout is built and operated by {BRAND.founder}, {BRAND.city}, {BRAND.country}. Grievance Officer (as required by the DPDP Rules):
        <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}> {BRAND.email}</a>.
        We acknowledge grievances within 72 hours and resolve them within 30 days. If unsatisfied, you may approach the Data Protection Board of India.
      </p>

      <h2 style={{ marginTop: 24 }}>What we collect, from whom, why</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Account (players &amp; organizers):</strong> email, password hash (bcrypt — never visible to anyone, including us), display name (IGN), role, rank, affiliation (college/org), city. Used to run accounts and to match organizers to players.</li>
        <li><strong>Verification (players):</strong> one screenshot of your rank. Used solely for admin eye-verification, then deleted 30 days after the admin decision. Never included in any organizer export.</li>
        <li><strong>Shortlist unlock (organizers):</strong> you see verified players&apos; display name, rank, role, affiliation, city and status. Contact details are shown only if the player opted in to be contacted. We never share passwords or verification evidence with anyone.</li>
        <li><strong>Waitlist (visitors):</strong> email, segment (organizer/player/sponsor), city. Used to notify you at launch. Deleted at launch + 90 days.</li>
        <li><strong>Operational logs:</strong> sign-in and admin actions (who acted, on what, when) kept for 90 days for abuse prevention. Rate-limit keys are temporary and discarded on window expiry.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>18+ only</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        FF Scout is for users 18 years or older. By signing up you confirm you are 18+, recorded with your consent.
        We do not knowingly process data of persons under 18 — if you are, or a parent/guardian believes your child signed up, write to the grievance officer and we will erase the account.
      </p>

      <h2 style={{ marginTop: 24 }}>What we do NOT collect</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Phone numbers, UPI or bank details (payments, when they begin, use a compliant gateway — we receive only the payment status)</li>
        <li>Precise location, contacts, chat messages, voice data, web history</li>
        <li>Analytics beyond what our hosting provider records to serve pages</li>
        <li>Marketing profiles, advertising identifiers, automated profiling of any kind</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Where your data lives</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        Application hosting: Vercel Inc. (USA). Database: Neon (AWS ap-southeast-1, Singapore). Images: Cloudinary Inc. (USA).
        These processors are bound by their DPAs. Data may be transferred outside India where the DPDP Rules permit — no DPDP-blacklisted destination is used, and we re-check whenever those rules change. Backups follow the same terms.
      </p>

      <h2 style={{ marginTop: 24 }}>Your rights under DPDP</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li><strong>Access:</strong> ask for a copy of what we hold about you — we reply with a CSV of your account and proof metadata.</li>
        <li><strong>Correction:</strong> ask us to fix wrong details (e.g., wrong IGN).</li>
        <li><strong>Erasure:</strong> ask us to delete your account; we delete the user row, cascade-delete your verification screenshots, null out log references, and confirm within 72 hours.</li>
        <li><strong>Grievance:</strong> if we fail, contact the Grievance Officer above; beyond that, the Data Protection Board of India.</li>
        <li><strong>Withdraw consent:</strong> email us; we erase your data on receipt.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>Retention, plainly</h2>
      <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
        <li>Account data — until you erase it (and always on request).</li>
        <li>Verification screenshots — deleted 30 days after the admin approves or rejects.</li>
        <li>Audit logs — 90 days.</li>
        <li>Waitlist — until launch + 90 days, then deleted.</li>
        <li>Cookies — session cookie only; 7 days; no tracking cookies.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>What we never do</h2>
      <p className="subtext" style={{ marginTop: 10 }}>
        We do not sell your email, phone, or data to anyone — ever. We do not sell roster lists to sponsors; sponsorships are described as aggregate cohorts (e.g., "100+ verified rosters, Hyderabad"), never as person-level lists.
      </p>

      <p style={{ marginTop: 32 }}><Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link></p>
    </div>
  );
}
