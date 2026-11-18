import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { uploadProof } from './actions';
import SubmitAction from './SubmitAction';

export default async function VerifyPage() {
  const jar = await cookies();
  const token = jar.get('ffscout_session')?.value;
  if (!token || !(await verifySession(token))) redirect('/login');
  return (
    <main className="shell" style={{ paddingBottom: 48 }}>
      <h1 style={{ marginTop: 32 }}>Upload your rank screenshot</h1>
      <p className="subtext">PNG or JPG. One screenshot per verification. Admin verifies manually in 24–48h.</p>
      <form action={uploadProof} className="form-card" style={{ marginTop: 20 }} encType="multipart/form-data">
        <label className="label">Rank screenshot<input className="input" type="file" name="screenshot" accept="image/*" required /></label>
        <SubmitAction>Submit for verification</SubmitAction>
      </form>
    </main>
  );
}
