"use client"
import { useActionState } from 'react';
import { registerOrganizer } from './actions';
import type { ActionState } from './actions';

const initial: ActionState = { ok: true };

export default function OrgSignUpPage() {
  const [state, action] = useActionState(registerOrganizer, initial);
  return (
    <div className="shell">
      <div className="form-card">
        <h1>Organizer signup</h1>
        <p className="subtext" style={{ marginBottom: 16 }}>Verified rosters for your fest. ₹499 per event to unlock the shortlist.</p>
        {state?.error && <p style={{ color: 'var(--danger)', marginBottom: 10, fontSize: 13 }}>{state.error}</p>}
        <form action={action}>
          <label className="label">Organization name<input className="input" name="orgName" required placeholder="Rajawadi Cyber Game Nite" /></label>
          <div className="row" style={{ marginTop: 10 }}>
            <label className="label">Type<select className="input" name="orgType">{['College fest','LAN / gaming café','Sponsor activation','Guild','Tournament series','Community scrims'].map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="label">City<input className="input" name="city" required defaultValue="Hyderabad" /></label>
          </div>
          <label className="label" style={{ marginTop: 10 }}>Contact person<input className="input" name="displayName" required /></label>
          <div className="row" style={{ marginTop: 10 }}>
            <label className="label">Email<input className="input" name="email" type="email" required /></label>
            <label className="label">Password<input className="input" name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
          </div>
          <label className="checkbox-row"><input type="checkbox" name="is18" required /><span>I am 18 or older.</span></label>
          <label className="checkbox-row"><input type="checkbox" name="agree" required /><span>I agree to the <a href="/privacy" style={{ color: 'var(--accent)' }}>Privacy Notice</a> — I may request a verified shortlist, and deletion deletes everything.</span></label>
          <button className="btn" type="submit" style={{ marginTop: 16, width: '100%' }}>Create organizer account</button>
        </form>
      </div>
    </div>
  );
}

