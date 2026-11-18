import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { uploadProof } from './actions';
import SubmitAction from './SubmitAction';

const ERRORS: Record<string, string> = {
  missing: 'No file received — pick your screenshot again.',
  size: 'That file is over 5MB. Compress it or pick a smaller screenshot.',
  type: 'PNG, JPG or WebP only. Screenshots must be raster images.',
  invalid: 'Could not process that file. Try another screenshot.',
};

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token || !(await verifySession(token))) redirect('/login');
  const { e } = await searchParams;
  const error = e ? ERRORS[e] : undefined;
  return (
    <main className="shell" style={{ paddingBottom: 48 }}>
      <h1 style={{ marginTop: 32 }}>Upload your rank screenshot</h1>
      <p className="subtext">PNG, JPG or WebP, max 5MB. One screenshot per verification. Admin verifies manually in 24–48h.</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}
      <form action={uploadProof} className="form-card" style={{ marginTop: 20 }} encType="multipart/form-data">
        <label className="label">Rank screenshot<input className="input" type="file" name="screenshot" accept="image/png,image/jpeg,image/webp" required /></label>
        <SubmitAction>Submit for verification</SubmitAction>
      </form>
    </main>
  );
}
