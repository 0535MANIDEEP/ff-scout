"use client"
import Link from 'next/link';
import { useActionState, useRef } from 'react';
import { login } from './actions';
import type { ActionState } from './actions';

const initial: ActionState = { ok: true };

export default function LoginPage() {
  const [state, action] = useActionState(login, initial);
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <main className="shell">
      <div className="form-card">
        <h1>Welcome back</h1>
        <p className="subtext" style={{ marginBottom: 16 }}>Players or organizers — sign in to continue.</p>
        {state?.error && <p style={{ color: 'var(--danger)', marginBottom: 10, fontSize: 13 }}>{state.error}</p>}
        <form ref={formRef} action={action}>
          <label className="label">Email<input className="input" name="email" type="email" required autoComplete="email" /></label>
          <label className="label" style={{ marginTop: 10 }}>Password<input className="input" name="password" type="password" required autoComplete="current-password" /></label>
          <sakuga-button onClick={() => formRef.current?.requestSubmit()}>Sign in</sakuga-button>
        </form>
        <p style={{ marginTop: 14, fontSize: 12 }}>New here? <Link href="/sign-up" style={{ color: 'var(--accent)' }}>Join as player</Link> · <Link href="/organizer/sign-up" style={{ color: 'var(--accent)' }}>Organizer signup</Link></p>
      </div>
    </main>
  );
}

