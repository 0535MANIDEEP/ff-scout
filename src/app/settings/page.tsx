import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import SignOut from '@/components/SignOut';
import { deleteAccount, setAvailability } from './actions';

export const metadata = { title: 'Settings — FF Scout' };

export default async function Settings({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  const { e } = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: s.userId },
    select: { email: true, displayName: true, userType: true, status: true, verified: true, createdAt: true },
  });
  if (!user) redirect('/login');
  const isAdmin = user.userType === 'admin';
  return (
    <div className="shell" style={{ maxWidth: 720, padding: '48px 0 96px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <h1>Settings</h1>
        <SignOut />
      </div>
      {e === 'admin' && <p style={{ color: 'var(--risk)', marginTop: 12, fontSize: 13 }}>Admin accounts cannot self-delete. Remove or demote the admin from the database, or ask the owner to do it.</p>}

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Account</h3>
        <div className="kv"><span>Email</span><span>{user.email}</span></div>
        <div className="kv"><span>Display name</span><span>{user.displayName}</span></div>
        <div className="kv"><span>Type</span><span>{user.userType}</span></div>
        {user.userType === 'player' && <div className="kv"><span>Verification</span><span>{user.verified ? 'Verified ✓' : 'Unverified'}</span></div>}
        <div className="kv"><span>Member since</span><span>{user.createdAt.toISOString().slice(0, 10)}</span></div>
      </section>

      {user.userType === 'player' && (
        <section className="card" style={{ marginTop: 16 }}>
          <h3>Availability</h3>
          <p className="subtext" style={{ marginBottom: 10 }}>Organizers see this next to your name.</p>
          <form action={setAvailability} style={{ display: 'flex', gap: 10 }}>
            <select className="input" name="status" defaultValue={user.status} aria-label="Availability">
              <option value="looking">Looking for tournaments</option>
              <option value="playing">Currently playing</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="btn" type="submit">Save</button>
          </form>
        </section>
      )}

      <section className="card" style={{ marginTop: 16, borderColor: 'var(--danger)' }}>
        <h3 style={{ color: 'var(--danger)' }}>Delete account</h3>
        <p className="subtext" style={{ marginBottom: 10 }}>
          Erases your account, your verification screenshots (Cloudinary included) and your session. Audit log entries are anonymized, not erased. This cannot be undone.
        </p>
        {isAdmin ? (
          <p className="small">Admin accounts cannot self-delete from here.</p>
        ) : (
          <form action={deleteAccount}>
            <button className="btn" style={{ background: 'var(--danger)' }} type="submit">Delete my account permanently</button>
          </form>
        )}
      </section>

      <p style={{ marginTop: 20 }}><Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>← Back home</Link></p>
    </div>
  );
}
