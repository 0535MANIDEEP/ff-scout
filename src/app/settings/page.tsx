import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/shared/auth/session';
import { prisma } from '@/shared/db/client';
import SignOut from '@/components/SignOut';
import { deleteAccount } from './actions';
import { COPY } from '@/shared/config/match';
import { privateMetadata } from '@/shared/seo';

export const metadata = privateMetadata('Settings, Final Circle');

const NARROW = 'mx-auto w-full max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const H3 = 'mb-2 text-lg font-bold leading-[1.2] tracking-[-0.01em] text-ink';
const H3_DANGER = 'mb-2 text-lg font-bold leading-[1.2] tracking-[-0.01em] text-danger';
const CARD_COPY = 'text-sm leading-[1.6] text-muted';
const CARD = 'rounded-card border border-[#CFC8B9] bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const DANGER_CARD = 'rounded-card border border-danger bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)]';
const KV = 'flex justify-between gap-4 border-b border-[#CFC8B9] py-3 text-sm last:border-b-0';
const KV_LABEL = 'font-mono text-xs text-muted';
const LABEL_FLUSH = 'block text-sm font-bold text-ink';
const INPUT = 'w-full min-h-11 rounded-lg border border-[#CFC8B9] bg-[#FDFCF8] px-4 text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';
const DANGER_BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-danger px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger active:translate-y-px';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default async function Settings({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const s = await getCurrentUser();
  if (!s) redirect('/login');
  const { e } = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: s.id },
    select: { email: true, displayName: true, userType: true, createdAt: true },
  });
  if (!user) redirect('/login');
  const isAdmin = user.userType === 'admin';
  return (
    <div className={NARROW}>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className={H1}>Settings</h1>
        <SignOut />
      </div>
      {e === 'admin' && <p className="mt-3 text-[13px] text-risk">{COPY.settings.admin}</p>}
      {e === 'confirm' && <p className="mt-3 text-[13px] text-risk">{COPY.settings.confirm}</p>}

      <section className={`mt-5 ${CARD}`}>
        <h3 className={H3}>Account</h3>
        <div className={KV}><span className={KV_LABEL}>Email</span><span>{user.email}</span></div>
        <div className={KV}><span className={KV_LABEL}>Display name</span><span>{user.displayName}</span></div>
        <div className={KV}><span className={KV_LABEL}>Type</span><span>{user.userType}</span></div>
        <div className={KV}><span className={KV_LABEL}>Member since</span><span>{user.createdAt.toISOString().slice(0, 10)}</span></div>
      </section>

      <section className={`mt-4 ${DANGER_CARD}`}>
        <h3 className={H3_DANGER}>Delete account</h3>
        <p className={`mb-[10px] ${CARD_COPY}`}>
          Erases your account, your profile and your session. Audit log entries are anonymized, not erased. This cannot be undone.
        </p>
        {isAdmin ? (
          <p className={CARD_COPY}>Admin accounts cannot self-delete from here.</p>
        ) : (
          <form action={deleteAccount}>
            <label className={`${LABEL_FLUSH} mb-[10px]`}>Type <strong>DELETE</strong> to confirm<input className={`mt-[6px] ${INPUT}`} name="confirm" autoComplete="off" placeholder="DELETE" /></label>
            <button className={DANGER_BTN} type="submit">Delete my account permanently</button>
          </form>
        )}
      </section>

      <p className="mt-5"><Link href="/" className={GHOST}>← Back home</Link></p>
    </div>
  );
}
