import Link from 'next/link';
import { registerSponsor } from './actions';

export const metadata = { title: 'Sponsor signup, Final Circle' };

const ERRORS: Record<string, string> = {
  agree: 'One tick away. The Privacy Notice is the only paperwork we will ever ask of you.',
  rate: 'Too many tries in a short time. Give it a few minutes.',
  invalid: 'Missing or invalid fields.',
  duplicate: 'That email is already registered.',
};

export default async function SponsorSignUp({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <div className="page-narrow">
      <span className="eyebrow-inline" style={{ marginTop: 32 }}>SPONSOR · FREE WHILE IN PILOT</span>
      <h1 style={{ marginTop: 10 }}>Scout players for your brand</h1>
      <p className="subtext" style={{ marginTop: 10 }}>
        Sponsors see players who opted in: displayName, UID, BR and CS ranks, role and city. No email addresses, no fabricated profiles.
      </p>
      {e && ERRORS[e] && <p style={{ color: 'var(--risk)', marginTop: 12, fontSize: 13 }}>{ERRORS[e]}</p>}
      <form action={registerSponsor} style={{ marginTop: 20, display: 'grid', gap: 12 }}>
        <label className="label">Brand or team name<input className="input" name="brandName" required maxLength={80} /></label>
        <label className="label">Email<input className="input" name="email" type="email" required /></label>
        <label className="label">Password<input className="input" name="password" type="password" minLength={8} required /></label>
        <label className="label">City<input className="input" name="city" required maxLength={80} /></label>
        <label className="label">Contact (optional)<input className="input" name="contact" maxLength={120} /></label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" name="agree" required />
          <span>I agree to the Privacy Notice.</span>
        </label>
        <button className="btn" type="submit">Create sponsor account</button>
      </form>
      <p className="small" style={{ marginTop: 16 }}>Already registered? <Link href="/login">Log in</Link></p>
    </div>
  );
}
