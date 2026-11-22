"use client"
import Link from 'next/link';
import { useActionState } from 'react';
import { login } from './actions';
import type { ActionState } from './actions';
import { BRAND } from '@/lib/brand';
import { Field } from '@/shared/ui/Field';
import { Button } from '@/shared/ui/Button';

const initial: ActionState = { ok: true };

const SHELL = 'mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4';
const CARD = 'mx-auto my-16 w-full max-w-[480px] rounded-card border border-[#CFC8B9] bg-panel px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)] max-[600px]:my-8 max-[600px]:py-6';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const FIELD = 'text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';

export default function LoginPage() {
  const [state, action] = useActionState(login, initial);
  return (
    <div className={SHELL}>
      <div className={CARD}>
        <h1 className={H1}>Welcome back</h1>
        <p className={`mb-4 ${SUBTEXT}`}>Players and sponsors, sign in to continue.</p>
        {state?.error && <p className="mb-[10px] text-[13px] text-danger">{state.error}</p>}
        <form action={action} className="flex flex-col gap-3">
          <Field label="Email" id="email" name="email" type="email" required autoComplete="email" className={FIELD} />
          <Field label="Password" id="password" name="password" type="password" required autoComplete="current-password" className={FIELD} />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        <p className="mt-[10px] text-xs">Forgot password? Email <a href={`mailto:${BRAND.email}`} className="text-vermilion">{BRAND.email}</a>. Resets are manual during the pilot.</p>
        <p className="mt-[6px] text-xs">New here? <Link href="/sign-up" className="text-vermilion">Join as player</Link></p>
      </div>
    </div>
  );
}
