"use client"
import Link from 'next/link';
import { useActionState } from 'react';
import { login } from './actions';
import type { ActionState } from './actions';
import { BRAND } from '@/lib/brand';

const initial: ActionState = { ok: true };

export default function LoginPage() {
  const [state, action] = useActionState(login, initial);
  return (
    <div className="shell">
      <div className="form-card">
        <h1>Welcome back</h1>
        <p className="subtext" style={{ marginBottom: 16 }}>Players or organizers, sign in to continue.</p>
        {state?.error && <p style={{ color: 'var(--danger)', marginBottom: 10, fontSize: 13 }}>{state.error}</p>}
        <form action={action}>
          <label className="label">Email<input className="input" name="email" type="email" required autoComplete="email" /></label>
          <label className="label" style={{ marginTop: 10 }}>Password<input className="input" name="password" type="password" required autoComplete="current-password" /></label>
          <button className="btn btn-block" type="submit">Sign in</button>
        </form>
        <p style={{ marginTop: 10, fontSize: 12 }}>Forgot password? Email <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}>{BRAND.email}</a> — resets are manual during the pilot.</p>
        <p style={{ marginTop: 6, fontSize: 12 }}>New here? <Link href="/sign-up" style={{ color: 'var(--accent)' }}>Join as player</Link> · <Link href="/organizer/sign-up" style={{ color: 'var(--accent)' }}>Organizer signup</Link></p>
      </div>
    </div>
  );
}

