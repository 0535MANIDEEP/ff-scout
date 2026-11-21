import Link from 'next/link';
import { registerSponsor } from './actions';

export const metadata = {
  title: 'Sponsor signup, Final Circle',
  description: 'Sponsor placements and sponsor-funded free events. Opt-in player data only, no email addresses, no money handled by Final Circle.',
};

const ERRORS: Record<string, string> = {
  agree: 'Tick the box to confirm you are 18+, accept the Privacy Notice, and understand that every listing is free entry. Final Circle handles no money.',
  rate: 'Too many tries in a short time. Give it a few minutes.',
  invalid: 'Missing or invalid fields.',
  duplicate: 'That email is already registered.',
};

export default async function SponsorSignUp({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <div className="page-narrow">
      <span className="eyebrow-inline" style={{ marginTop: 32 }}>SPONSOR PLACEMENTS · SPONSOR-FUNDED FREE EVENTS</span>
      <h1 style={{ marginTop: 10 }}>Scout players for your brand</h1>
      <p className="subtext" style={{ marginTop: 10 }}>
        Sponsors see players who opted in: displayName, UID, BR and CS ranks, role and city. No email addresses and no fabricated profiles. Ranks are entered by the players themselves.
      </p>
      <p className="subtext" style={{ marginTop: 10 }}>
        Sponsors pay to place a message on the board or to fund a free event. Players still pay nothing to join. Final Circle handles no money, never collects entry fees or rewards, and no listing advertises a cash prize or links to real-money gaming. Read <Link href="/advertise" style={{ color: 'var(--accent)' }}>Advertise</Link> for placements and <Link href="/safety" style={{ color: 'var(--accent)' }}>Safety and legal</Link> for the rules.
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
          <span>I confirm I'm 18+, accept the Privacy Notice, and understand that all listings are free entry and sponsor data is opt-in.</span>
        </label>
        <button className="btn" type="submit">Create sponsor account</button>
      </form>
      <p className="small" style={{ marginTop: 16 }}>Already registered? <Link href="/login">Log in</Link></p>
    </div>
  );
}
