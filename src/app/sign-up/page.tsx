"use client"
import { useActionState, useRef } from 'react';
import { registerPlayer } from './actions';
import type { ActionState } from './actions';

const initial: ActionState = { ok: true };

const roleLabel: Record<string, string> = {
  fragger: 'Rusher',
  sniper: 'AWM Sniper',
  support: 'Support',
  igled: 'IGL / In-Game Leader',
  lurker: 'Lurker',
};

export default function SignUpPage() {
  const [state, action] = useActionState(registerPlayer, initial);
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <main className="shell">
      <div className="form-card">
        <h1>Join the roster pool</h1>
        <p className="subtext" style={{ marginBottom: 16 }}>Verified grassroots Indian FF talent — free for players, ₹499 for organizers.</p>
        {state?.error && <p style={{ color: 'var(--danger)', marginBottom: 10, fontSize: 13 }}>{state.error}</p>}
        <form ref={formRef} action={action}>
          <label className="label">Email<input className="input" name="email" type="email" required /></label>
          <sakuga-input type="text" name="displayName" label="IGN (display name)" placeholder="e.g. _aMNis_, Aura_Hype_, Frostshikari_" required autoComplete="nickname" />
          <div className="row" style={{ marginTop: 10 }}>
            <label className="label">Password<input className="input" name="password" type="password" minLength={8} required /></label>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <label className="label">Affiliation (college, café, LAN, guild, sponsor)<input className="input" name="college" placeholder="VJIT / Ganjikhana / Predator Cyber..." required /></label>
            <label className="label">City<input className="input" name="city" required /></label>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <label className="label">Role
              <select className="input" name="role">
                {Object.entries(roleLabel).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </label>
            <label className="label">Rank
              <select className="input" name="rank">
                {['Bronze','Silver','Gold','Diamond','Heroic','Master'].map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <div className="hp"><input name="bot" /></div>
          <sakuga-checkbox name="agree" required label="One rank screenshot — admin eye verified. No fakes."></sakuga-checkbox>
          <sakuga-button onClick={() => formRef.current?.requestSubmit()}>Create profile & enter the pool</sakuga-button>
        </form>
      </div>
    </main>
  );
}

