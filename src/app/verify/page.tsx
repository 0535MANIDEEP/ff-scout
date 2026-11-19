import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { uploadProof } from './actions';
import SubmitAction from './SubmitAction';
import ProofUploadInput from './ProofUploadInput';
import SignOut from '@/components/SignOut';
import Link from 'next/link';
import { RANKS, COPY } from '@/lib/config';

const ERRORS: Record<string, string> = COPY.verify as Record<string, string>;

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token || !(await verifySession(token))) redirect('/login');
  const { e } = await searchParams;
  const error = e ? ERRORS[e] : undefined;
  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <h1>Upload your rank screenshot</h1>
        <div style={{ display: 'flex', gap: 8 }}><Link href="/settings" className="btn-ghost" style={{ textDecoration: 'none' }}>Settings</Link><SignOut /></div>
      </div>
      <p className="subtext">Screenshot first, details after — that's the order. A human verifier checks your rank against the shot.</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}
      <form action={uploadProof} className="form-card" style={{ marginTop: 20 }} encType="multipart/form-data">
        <label className="label">Free Fire UID<input className="input" type="text" name="gameUid" inputMode="numeric" pattern="[0-9]{6,20}" required placeholder="2384019283" /></label>
        <div className="row" style={{ marginTop: 10, gap: 12 }}>
          <label className="label">Rank<select className="input" name="rank" required><option value="" disabled>Pick rank</option>{RANKS.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
          <label className="label">Role<select className="input" name="role" required><option value="" disabled>Pick role</option><option value="rusher">Rusher</option><option value="sniper">AWM Sniper</option><option value="support">Support</option><option value="anchor">Anchor</option><option value="lurker">Lurker</option></select></label>
        </div>
        <ProofUploadInput />
        <SubmitAction>Submit for verification</SubmitAction>
      </form>
    </div>
  );
}
