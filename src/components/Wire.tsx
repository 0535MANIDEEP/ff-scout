import { buildHeroContext } from '@/lib/hero-data';

// The Wire: the FF kill-feed for verified updates, broadsheet style.
// Shows the real pool, warts and all; an empty pool says so, loudly.
// Pure CSS marquee, no JS; reduced-motion users get a static wrap.
export async function Wire() {
  let ctx;
  try { ctx = await buildHeroContext(); } catch { ctx = { totalVerified: 0, pendingCount: 0, collegeCount: 0, roster: [] }; }
  const items = ctx.roster.map(r => `${r.displayName} · ${r.rank} · ${r.role ?? 'player'}`);
  const line = items.length > 0 ? items.join('  —  ') : 'THE WIRE IS QUIET — FIRST VERIFIED ROSTERS LAND ANY DAY';
  // Duplicate the line for a seamless CSS loop (content width must be ≥ container)
  const loop = `${line}  —  ${line}  —  ${line}`;
  return (
    <div className="wire" aria-hidden="true">
      <div className="wire-inner"><span>{loop}</span></div>
    </div>
  );
}
