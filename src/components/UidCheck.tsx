'use client';

import { useRef, useState } from 'react';
import RoleAvatar from '@/components/RoleAvatar';
import type { LiveOutcome, LiveProfile } from '@/lib/ff-upstream';

type Result = {
  uid: string;
  pool: { found: boolean; displayName?: string; rank?: string; role?: string | null; iglCapable?: boolean };
  live: LiveOutcome;
};

// Exactly the regions the provider documents; anything else would be a guess.
const REGIONS: [string, string][] = [
  ['bd', 'Bangladesh'], ['ind', 'India'], ['br', 'Brazil'], ['us', 'United States'],
  ['sac', 'South America'], ['na', 'North America'], ['th', 'Thailand'],
  ['id', 'Indonesia'], ['sg', 'Singapore'], ['pk', 'Pakistan'],
];

const LIVE_COPY: Record<Exclude<LiveOutcome, { state: 'ok' }>['state'], string> = {
  disabled: 'Live game lookup is not switched on for this deployment yet. The pool check below always works.',
  quota: 'The free monthly lookup allowance is used up for now. The pool check below still works.',
  error: 'The game lookup service did not answer. Try once more in a moment.',
};

function LiveRow({ k, v }: { k: string; v: string | number | null }) {
  if (v === null || v === undefined || v === '') return null;
  return <div className="rowitem"><span>{k}</span><span>{v}</span></div>;
}

export default function UidCheck() {
  const [uid, setUid] = useState('');
  const [region, setRegion] = useState('ind');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    if (!/^\d{5,15}$/.test(uid)) {
      setError('A Free Fire UID is 5 to 15 digits. Check the number and try again.');
      setResult(null);
      return;
    }
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/uid-check?uid=${encodeURIComponent(uid)}&region=${encodeURIComponent(region)}`);
      const body = await res.json().catch(() => null);
      if (!res.ok || !body) {
        setError(body?.error || 'That check did not go through. Try again.');
        setResult(null);
      } else {
        setResult(body as Result);
      }
    } catch {
      setError('Network hiccup, the check did not reach us. Try once more.');
      setResult(null);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }

  const live = result?.live;
  const profile: LiveProfile | null = live && live.state === 'ok' ? live.profile : null;

  return (
    <>
      <form onSubmit={onSubmit} noValidate style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, alignItems: 'flex-end' }}>
        <label className="label" style={{ margin: 0 }}>
          Free Fire UID
          <input
            className="input"
            name="uid"
            inputMode="numeric"
            pattern="[0-9]{5,15}"
            maxLength={15}
            placeholder="e.g. 100000001"
            value={uid}
            onChange={e => setUid(e.target.value.replace(/\D/g, ''))}
            style={{ minWidth: 200 }}
            autoComplete="off"
          />
        </label>
        <label className="label" style={{ margin: 0 }}>
          Region
          <select className="input" value={region} onChange={e => setRegion(e.target.value)} style={{ minWidth: 160 }}>
            {REGIONS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>
        <button className="btn" type="submit" disabled={loading} style={{ height: 44 }}>
          {loading ? 'Checking…' : 'Check UID'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--risk, #c81e1e)', marginTop: 16 }} role="alert">{error}</p>}

      {result && (
        <div style={{ marginTop: 28, display: 'grid', gap: 20 }}>
          <section aria-label="Final Circle pool status" style={{ border: '1px solid var(--line)', padding: 20 }}>
            <div className="eyebrow-inline" style={{ marginBottom: 12 }}>FINAL CIRCLE POOL</div>
            {result.pool.found ? (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <RoleAvatar role={result.pool.role as 'rusher' | 'sniper' | 'support' | 'anchor' | 'lurker' | null} iglCapable={result.pool.iglCapable} size={48} />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{result.pool.displayName}</p>
                  <p className="subtext" style={{ margin: '4px 0 0' }}>
                    {result.pool.rank} · {result.pool.role || 'role not set'}{result.pool.iglCapable ? ' · can IGL' : ''} · verified in our pool
                  </p>
                </div>
              </div>
            ) : (
              <p className="subtext" style={{ margin: 0 }}>UID {result.uid} is not in the verified pool. It may not have been checked yet, or the review is still open.</p>
            )}
          </section>

          <section aria-label="Live game profile" style={{ border: '1px solid var(--line)', padding: 20 }}>
            <div className="eyebrow-inline" style={{ marginBottom: 12 }}>LIVE GAME PROFILE</div>
            {live && live.state !== 'ok' && <p className="subtext" style={{ margin: 0 }}>{LIVE_COPY[live.state]}</p>}
            {profile && (
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{profile.nickname}</p>
                <div style={{ marginTop: 10 }}>
                  <LiveRow k="Level" v={profile.level} />
                  <LiveRow k="Likes" v={profile.likes} />
                  <LiveRow k="BR rank" v={profile.brRank} />
                  <LiveRow k="BR points" v={profile.brPoints} />
                  <LiveRow k="CS rank" v={profile.csRank} />
                  <LiveRow k="CS points" v={profile.csPoints} />
                  <LiveRow k="Guild" v={profile.guild ? `${profile.guild}${profile.guildMembers ? ` · ${profile.guildMembers} members` : ''}` : null} />
                  <LiveRow k="Region" v={profile.region} />
                  <LiveRow k="Season" v={profile.season} />
                  <LiveRow k="Last seen" v={profile.lastLogin} />
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
