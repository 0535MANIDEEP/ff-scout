"use client";
import { useState } from "react";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState<'organizer' | 'player' | 'sponsor'>('organizer');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, segment }) });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
      <label className="sr-only" htmlFor="waitlist-email">Email</label>
      <input className="input" id="waitlist-email" type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ minWidth: 240 }} />
      <select className="input" value={segment} onChange={e => setSegment(e.target.value as typeof segment)} style={{ minWidth: 140 }}>
        <option value="organizer">Organizer</option>
        <option value="player">Player</option>
        <option value="sponsor">Sponsor</option>
      </select>
      <button className="btn" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Joining…' : 'Notify me'}</button>
      {status === 'done' && <span className="approved" style={{ alignSelf: 'center' }}>You are on the list.</span>}
      {status === 'error' && <span style={{ alignSelf: 'center', color: 'var(--danger)' }}>Something went wrong</span>}
    </form>
  );
}
