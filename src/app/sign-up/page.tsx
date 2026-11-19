"use client"
import { useActionState } from 'react';
import { registerPlayer } from './actions';
import type { ActionState } from './actions';

const initial: ActionState = { ok: true };

export default function SignUpPage() {
  const [state, action] = useActionState(registerPlayer, initial);
  return (
    <div className="shell">
      <div className="form-card">
        <h1>Get on the roster</h1>
        <p className="subtext" style={{ marginBottom: 16 }}>30 seconds. Free forever. No Indian FF team is leaving real Heroic off the shortlist because of a bad form.</p>
        {state?.error && <p style={{ color: 'var(--danger)', marginBottom: 10, fontSize: 13 }}>{state.error}</p>}
        <form action={action}>
          <label className="label">Email<input className="input" name="email" type="email" required autoComplete="email" /></label>
          <label className="label" style={{ marginTop: 10 }}>IGN (your in-game name)<input className="input" type="text" name="displayName" placeholder="e.g. _aMNis_, Aura_Hype_, Frostshikari_" required autoComplete="nickname" /></label>
          <label className="label" style={{ marginTop: 10 }}>Password<input className="input" name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
          <label className="label" style={{ marginTop: 10 }}>Where you are (college, café, LAN, guild, city)<input className="input" name="college" placeholder="VJIT Hyderabad · Ganjikhana Café · Kolkata" required /></label>
          <div className="hp"><input name="bot" /></div>
          <label className="checkbox-row"><input type="checkbox" name="agree" required /><span>I confirm I'm 18+ and accept the <a href="/privacy" style={{ color: 'var(--accent)' }}>Privacy Notice</a>. My rank screenshot is used only to verify my rank and shown to organizers who unlock an event.</span></label>
          <button className="btn btn-block" type="submit">Create account</button>
        </form>
      </div>
    </div>
  );
}
