"use client"
import { useActionState } from 'react';
import { registerPlayer } from './actions';
import type { ActionState } from './actions';
import { Field } from '@/shared/ui/Field';
import { Button } from '@/shared/ui/Button';

const initial: ActionState = { ok: true };

const SHELL = 'mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4';
const CARD = 'mx-auto my-16 w-full max-w-[480px] rounded-card border border-[#CFC8B9] bg-panel px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)] max-[600px]:my-8 max-[600px]:py-6';
const H1 = 'text-[clamp(1.5rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const FIELD = 'text-base text-ink focus:outline-2 focus:outline-offset-1 focus:outline-vermilion';

export default function SignUpPage() {
  const [state, action] = useActionState(registerPlayer, initial);
  return (
    <div className={SHELL}>
      <div className={CARD}>
        <h1 className={H1}>Get on the roster</h1>
        <p className={`mb-4 ${SUBTEXT}`}>Post a match or join one in under a minute.</p>
        {state?.error && <p className="mb-[10px] text-[13px] text-danger">{state.error}</p>}
        <form action={action} className="flex flex-col gap-3">
          <Field label="Email" id="email" name="email" type="email" required autoComplete="email" className={FIELD} />
          <Field label="IGN (your in-game name)" id="displayName" name="displayName" type="text" placeholder="e.g. _aMNis_, Aura_Hype_, Frostshikari_" required autoComplete="nickname" className={FIELD} />
          <Field label="Password" id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className={FIELD} />
          <Field label="Where you are (college, café, LAN, guild, city)" id="college" name="college" placeholder="VJIT Hyderabad · Ganjikhana Café · Kolkata" required className={FIELD} />
          <div className="absolute left-[-9999px] h-0 w-px overflow-hidden"><input name="bot" /></div>
          <label className="mt-4 flex items-start gap-3 text-sm leading-[1.5] text-muted">
            <input type="checkbox" name="agree" required className="mt-px h-5 w-5 shrink-0 accent-vermilion" />
            <span>I confirm I'm 18+, accept the <a href="/privacy" className="text-vermilion">Privacy Notice</a>, and understand that every listing is free entry and Final Circle handles no money.</span>
          </label>
          <Button type="submit" className="w-full">Create account</Button>
        </form>
      </div>
    </div>
  );
}
