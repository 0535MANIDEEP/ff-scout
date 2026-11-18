import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { reviewProof } from './actions';

export default async function AdminVerify() {
  const jar = await cookies();
  const token = jar.get('ffscout_session')?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (s.userType !== 'admin') redirect('/player');
  const proofs = await prisma.verificationProof.findMany({ where: { status: 'pending' }, include: { user: true }, orderBy: { createdAt: 'asc' } });
  return (
    <main className="shell" style={{ paddingBottom: 48 }}>
      <h1 style={{ marginTop: 32 }}>Verification queue ({proofs.length} pending)</h1>
      <div className="list" style={{ marginTop: 20 }}>
        {proofs.map(p => (
          <div className="rowitem" key={p.id}>
            <div>
              <div className="tile-title">{p.user.displayName} · {p.user.rank} · {p.user.college}</div>
              <div className="tile-sub">{p.user.email}</div>
              {p.fileData.startsWith('data:') && <img src={p.fileData} alt="rank" style={{ maxWidth: 280, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
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
    </main>
  );
}
