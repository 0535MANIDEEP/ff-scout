import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import { reviewProof } from './actions';
import SignOut from '@/components/SignOut';
import Link from 'next/link';
import RoleAvatar from '@/components/RoleAvatar';

export default async function AdminVerify() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  const role = roleFromDb(s.userType);
  if (!hasPermission(role, 'proof:read')) redirect('/player');
  const isVerifier = role === 'verifier';
  const proofs = await prisma.verificationProof.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      fileData: true,
      fileUrl: true,
      mimeType: true,
      gameUid: true,
      user: { select: { displayName: true, rank: true, college: true, email: true, role: true, iglCapable: true } },
    },
  });
  return (
    <div className="shell" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <h1>Verification queue ({proofs.length} pending)</h1>
        <div style={{ display: 'flex', gap: 8 }}><Link href="/admin/roles" className="btn-ghost" style={{ textDecoration: 'none' }}>Roles</Link><Link href="/settings" className="btn-ghost" style={{ textDecoration: 'none' }}>Settings</Link><SignOut /></div>
      </div>
      {isVerifier && <p className="subtext" style={{ marginTop: 10 }}>Verifier mode — approve only what the screenshot proves. Your UID cross-checks and rejection reasons are audited, and accounts are spot-reversed if decisions drift.</p>}
      <div className="list" style={{ marginTop: 20 }}>
        {proofs.map(p => (
          <div className="rowitem" key={p.id}>
            <div>
              <div className="tile-title" style={{ display: 'flex', gap: 12, alignItems: 'center' }}><RoleAvatar role={p.user.role} iglCapable={p.user.iglCapable} size={44} /><span>{p.user.displayName} · {p.user.rank} · {p.user.role} · {p.user.college || 'Affiliation withheld'}</span></div>
              <div className="tile-sub">{!isVerifier && <><span className="small">{p.user.email}</span> · </>}UID <strong>{p.gameUid ?? '—'}</strong></div>
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
              <label className="label" style={{ minWidth: 220 }}>Reject reason{isVerifier ? ' (required for Reject)' : ' (optional, shown to player)'}<input type="text" className="input" name="reviewerNote" placeholder="Screenshot shows another player's rank" /></label>
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
