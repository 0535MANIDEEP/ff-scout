import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hasPermission, roleFromDb, ROLE_LABEL, ROLE_DESCRIPTION, type Role } from '@/lib/permissions';
import { prisma } from '@/lib/db';
import { setRole } from './actions';
import SignOut from '@/components/SignOut';
import RoleAvatar from '@/components/RoleAvatar';
import { COPY } from '@/lib/config';
import { privateMetadata } from '@/lib/seo';

export const metadata = privateMetadata('Roles and access, Final Circle');

const FILTERS: Record<string, Role | 'all'> = { all: 'all', players: 'player', sponsors: 'sponsor', admins: 'admin' };
const ERRORS: Record<string, string> = COPY.roles as Record<string, string>;

export default async function RolesPage({ searchParams }: { searchParams: Promise<{ f?: string; e?: string; done?: string }> }) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) redirect('/login');
  if (!hasPermission(roleFromDb(s.userType), 'user:manage')) redirect('/player');

  const { f, e, done } = await searchParams;
  const filter = FILTERS[f ?? 'all'] ?? 'all';
  const where =
    filter === 'all'
      ? undefined
      : { userType: filter as 'player' | 'sponsor' | 'admin' };

  const [users, audit] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'asc' }, select: { id: true, displayName: true, email: true, userType: true, createdAt: true, role: true }, take: 200 }),
    prisma.auditLog.findMany({ where: { action: 'role_change' }, orderBy: { createdAt: 'desc' }, take: 15, select: { detail: true, createdAt: true } }),
  ]);

  const error = e ? ERRORS[e] : undefined;

  return (
    <div className="shell" style={{ paddingBottom: 56 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginTop: 32 }}>
        <h1>Roles & access</h1>
        <div style={{ display: 'flex', gap: 8 }}><Link href="/admin/matches" className="btn-ghost" style={{ textDecoration: 'none' }}>Matches</Link><SignOut /></div>
      </div>
      <p className="subtext" style={{ marginTop: 8 }}>Promote and demote between the three roles. Every change is audit-logged and revocable in one click. Roles are defined in <code>src/lib/permissions.ts</code> — add powers there, not by hand-editing rows.</p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{error}</p>}
      {done && <p className="approved" style={{ marginTop: 10 }}>Role updated.</p>}

      <form method="get" action="/admin/roles" style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        {Object.keys(FILTERS).map(k => (
          <button key={k} name="f" value={k} className={filter === FILTERS[k] ? 'btn' : 'btn-ghost'} type="submit">{k}</button>
        ))}
      </form>

      <div className="roles-grid" style={{ marginTop: 18 }}>
        {users.map(u => {
          const role = roleFromDb(u.userType);
          const isYou = u.id === s.userId;
          return (
            <article key={u.id} className="card" style={{ padding: 18 }}>
              <div className="tile-title" style={{ display: 'flex', gap: 12, alignItems: 'center' }}><RoleAvatar role={u.role} iglCapable={false} size={40} /><span>{u.displayName}{isYou && <span className="small"> · you</span>}</span></div>
              <div className="tile-sub" style={{ marginTop: 4 }}>{u.email} · joined {u.createdAt.toISOString().slice(0, 10)}</div>
              <div className="tile-sub" style={{ marginTop: 8 }}><strong>{ROLE_LABEL[role]}</strong> — {ROLE_DESCRIPTION[role]}</div>
              <form action={setRole} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                <input type="hidden" name="userId" value={u.id} />
                <select name="role" className="input" style={{ width: 'auto' }} defaultValue={role} aria-label="New role">
                  <option value="player">player</option>
                  <option value="sponsor">sponsor</option>
                  <option value="admin">admin</option>
                </select>
                <input name="reason" className="input" placeholder="Reason (audit)" style={{ width: 180 }} required />
                <button className="btn" type="submit">Save</button>
              </form>
            </article>
          );
        })}
        {users.length === 0 && <div className="card" style={{ padding: 24 }}>No users in this filter yet.</div>}
      </div>

      <section className="card" style={{ marginTop: 22 }}>
        <h3>Last 15 role changes</h3>
        {audit.length === 0 ? <p className="subtext" style={{ marginTop: 8 }}>Nothing yet — promote your first sponsor when you trust one enough.</p> : (
          <div className="list" style={{ marginTop: 12 }}>
            {audit.map((a, i) => <div key={i} className="rowitem"><span className="small" style={{ fontFamily: 'var(--font-mono)' }}>{a.detail}</span><span className="small">{a.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</span></div>)}
          </div>
        )}
      </section>
    </div>
  );
}
