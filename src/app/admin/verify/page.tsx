import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { reviewProof } from './actions';
import SignOut from '@/components/SignOut';
import Link from 'next/link';

export default async function AdminVerify() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (s.userType !== 'admin') redirect('/player');
  const proofs = await prisma.verificationProof.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      fileData: true,
      fileUrl: true,
      mimeType: true,
      user: { select: { displayName: true, rank: true, college: true, email: true } },
    },
  });
  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <h1>Verification queue ({proofs.length} pending)</h1>
        <div style={{ display: 'flex', gap: 8 }}><Link href="/settings" className="btn-ghost" style={{ textDecoration: 'none' }}>Settings</Link><SignOut /></div>
      </div>
      <div className="list" style={{ marginTop: 20 }}>
        {proofs.map(p => (
          <div className="rowitem" key={p.id}>
            <div>
              <div className="tile-title">{p.user.displayName} · {p.user.rank} · {p.user.college || 'Affiliation withheld'}</div>
              <div className="tile-sub">{p.user.email}</div>
              {(p.fileUrl ?? (p.fileData?.startsWith('data:') ? p.fileData : null)) && (
                <img
                  src={p.fileUrl ?? p.fileData ?? ''}
                  alt="Rank screenshot awaiting verification"
                  style={{ maxWidth: 280, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                />
              )}
            </div>
            <form action={reviewProof} className="admin-actions">
              <input type="hidden" name="id" value={p.id} />
              <button className="btn" name="verdict" value="approve">Approve</button>
              <button className="btn-ghost" name="verdict" value="reject">Reject</button>
            </form>
          </div>
        ))}
        {proofs.length === 0 && <div className="card">All clear. New submissions will appear here.</div>}
      </div>
    </div>
  );
}
