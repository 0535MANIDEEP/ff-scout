import type { ReactNode } from 'react';
import { GAME_ROLE_LABEL } from '@/shared/config/match';

// Fixed, recognizable role avatars: flat glyph on an ink tile.
// No uploads, no GIFs — nothing to moderate, nothing to store, nothing to fake.
// IGL-capable players wear a double vermilion ring + I chip.
type Role = 'rusher' | 'sniper' | 'support' | 'anchor' | 'lurker' | null | undefined;

const INK = '#1a1714';
const BONE = '#efe7da';
const VERMILION = '#c81e1e';

const GLYPHS: Record<string, ReactNode> = {
  rusher: (<><path d="M30 40 52 64 30 88" stroke={BONE} strokeWidth="12" fill="none" strokeLinecap="square" strokeLinejoin="miter" /><path d="M58 40 80 64 58 88" stroke={BONE} strokeWidth="12" fill="none" strokeLinecap="square" strokeLinejoin="miter" /><path d="M92 52 108 76" stroke={VERMILION} strokeWidth="7" strokeLinecap="square" /></>),
  sniper: (<><circle cx="64" cy="64" r="30" stroke={BONE} strokeWidth="10" fill="none" /><line x1="64" y1="16" x2="64" y2="34" stroke={BONE} strokeWidth="8" /><line x1="64" y1="94" x2="64" y2="112" stroke={BONE} strokeWidth="8" /><line x1="16" y1="64" x2="34" y2="64" stroke={BONE} strokeWidth="8" /><line x1="94" y1="64" x2="112" y2="64" stroke={BONE} strokeWidth="8" /><circle cx="64" cy="64" r="7" fill={VERMILION} /></>),
  support: (<path d="M48 32h32v26h26v32H80v26H48V90H22V58h26z" fill={BONE} />),
  anchor: (<><rect x="24" y="44" width="80" height="40" fill={BONE} /><path d="M88 40 108 64 88 88" fill={VERMILION} /></>),
  lurker: (<><path d="M36 96 36 32 96 96Z" fill={BONE} /><path d="M64 80 64 56 84 80Z" fill={INK} /></>),
  neutral: (<circle cx="64" cy="64" r="24" stroke={BONE} strokeWidth="9" fill="none" />),
};

const LABELS: Record<string, string> = { ...GAME_ROLE_LABEL, neutral: 'Organizer' };

export default function RoleAvatar({ role, iglCapable, size = 44 }: { role?: Role; iglCapable?: boolean; size?: number }) {
  const body = GLYPHS[role ?? 'neutral'] ?? GLYPHS.neutral;
  return (
    <span
      className={`relative inline-flex shrink-0 items-center rounded-md border border-[#CFC8B9] bg-[#E4DFD1] align-middle${iglCapable ? ' shadow-[0_0_0_2px_#ECE7DD,0_0_0_4px_#C81E1E]' : ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${LABELS[role ?? 'neutral'] ?? 'Organizer'}${iglCapable ? ', IGL-capable' : ''}`}
      title={`${LABELS[role ?? 'neutral'] ?? 'Organizer'}${iglCapable ? ' · Can IGL' : ''}`}
    >
      <svg viewBox="0 0 128 128" width={size} height={size} aria-hidden="true">
        <rect width="128" height="128" fill={INK} />
        {body}
      </svg>
      {iglCapable && <span className="absolute -bottom-[6px] -right-[6px] grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-paper bg-vermilion font-mono text-[11px] font-bold text-panel" aria-hidden="true">I</span>}
    </span>
  );
}
