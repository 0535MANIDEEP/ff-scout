import { buildHeroContext } from '@/lib/hero-data';

// The Wire: the FF kill-feed for open matches, broadsheet style.
// Shows the real board, warts and all; an empty board says so, loudly.
// Pure CSS marquee, no JS; reduced-motion users get a static wrap.
export async function Wire() {
  let ctx;
  try { ctx = await buildHeroContext(); } catch { ctx = { openMatchCount: 0, totalPlayers: 0, matches: [] }; }
  const items = ctx.matches.map(r => `${r.title} · ${r.gameType} · ${r.mode} · ${r.city}`);
  const line = items.length > 0 ? items.join('  ·  ') : 'THE WIRE IS QUIET · FIRST MATCHES LAND ANY DAY';
  const loop = `${line}  ·  ${line}  ·  ${line}`;
  return (
    <div className="wire" aria-hidden="true">
      <div className="wire-inner"><span>{loop}</span></div>
    </div>
  );
}
