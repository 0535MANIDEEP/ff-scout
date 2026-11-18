"use client"
import { useActionState } from 'react';
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
  return (
    <div className="shell">
      <div className="form-card">
        <h1>Join the roster pool</h1>
        <p className="subtext" style={{ marginBottom: 16 }}>Verified grassroots Indian FF talent — free for players, ₹499 for organizers.</p>
        {state?.error && <p style={{ color: 'var(--danger)', marginBottom: 10, fontSize: 13 }}>{state.error}</p>}
        <form action={action}>
          <label className="label">Email<input className="input" name="email" type="email" required /></label>
          <label className="label" style={{ marginTop: 10 }}>IGN (display name)<input className="input" type="text" name="displayName" placeholder="e.g. _aMNis_, Aura_Hype_, Frostshikari_" required autoComplete="nickname" /></label>
          <div className="row" style={{ marginTop: 10 }}>
            <label className="label">Password<input className="input" name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
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
          <label className="checkbox-row"><input type="checkbox" name="agree" required /><span>One rank screenshot — admin eye verified. No fakes.</span></label>
          <button className="btn btn-block" type="submit">Create profile & enter the pool</button>
        </form>
      </div>
    </div>
  );
}

