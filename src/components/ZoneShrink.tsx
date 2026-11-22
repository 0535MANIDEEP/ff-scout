'use client';

import { useEffect, useRef } from 'react';

// Safe-zone loader: the Free Fire storm-circle as the brand loading state.
// Honest: no fake completion percentage. The shrinking ring only says "working".
// Reduced-motion users get one static ring and a plain label.
type Props = { label?: string };

// The shipped keyframes move through the browser's animation API so no global
// @keyframes sheet is needed; the values are the preserved stylesheet's values.
const RING_FRAMES: Keyframe[] = [
  { transform: 'scale(1)', opacity: 1, offset: 0 },
  { transform: 'scale(0.38)', opacity: 1, offset: 0.58 },
  { transform: 'scale(0.38)', opacity: 0, offset: 0.72 },
  { transform: 'scale(1)', opacity: 0, offset: 0.73 },
  { transform: 'scale(1)', opacity: 0, offset: 1 },
];

const WORD_FRAMES: Keyframe[] = [
  { opacity: 0, offset: 0 },
  { opacity: 1, offset: 0.03 },
  { opacity: 1, offset: 0.28 },
  { opacity: 0, offset: 0.33 },
  { opacity: 0, offset: 1 },
];

export default function ZoneShrink({ label = 'Loading' }: Props) {
  const ring = useRef<SVGGElement>(null);
  const words = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animations: Animation[] = [];
    if (ring.current) {
      animations.push(ring.current.animate(RING_FRAMES, {
        duration: 2600,
        easing: 'cubic-bezier(0.55, 0, 0.15, 1)',
        iterations: Infinity,
      }));
    }
    words.current?.querySelectorAll('span').forEach((span, i) => {
      animations.push(span.animate(WORD_FRAMES, {
        duration: 9000,
        delay: i * 3000,
        easing: 'linear',
        iterations: Infinity,
      }));
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, []);

  return (
    <div className="mx-auto grid min-h-[62vh] w-full max-w-[1120px] place-items-center px-6 py-16 text-center max-[600px]:px-4" role="status" aria-live="polite" aria-label={label}>
      <div className="grid justify-items-center gap-6">
        <svg className="block overflow-visible" viewBox="0 0 160 160" width="160" height="160" aria-hidden="true">
          {/* outer storm wall: dashed ring + hazard hatch */}
          <circle cx="80" cy="80" r="72" fill="none" stroke="var(--color-line)" strokeWidth="2" strokeDasharray="5 7" />
          <circle cx="80" cy="80" r="58" fill="none" stroke="var(--color-line)" strokeWidth="1.5" opacity="0.6" />
          {/* the shrinking safe zone: vermilion, FF-accurate gesture */}
          <g ref={ring} className="[transform-box:fill-box] [transform-origin:center]">
            <circle cx="80" cy="80" r="46" fill="none" stroke="var(--color-vermilion)" strokeWidth="12" opacity="0.22" />
            <circle cx="80" cy="80" r="46" fill="none" stroke="var(--color-vermilion)" strokeWidth="6" />
          </g>
          {/* crosshair heart */}
          <g stroke="var(--color-ink)" strokeWidth="1.6" opacity="0.9">
            <line x1="80" y1="74" x2="80" y2="86" />
            <line x1="74" y1="80" x2="86" y2="80" />
          </g>
        </svg>
        <h2 className="m-0 text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.15]">HOLD POSITION.</h2>
        <div ref={words} className="grid" aria-hidden="true">
          <span className="[grid-area:1/1] font-mono text-sm text-muted opacity-0">Landing in the lobby…</span>
          <span className="[grid-area:1/1] font-mono text-sm text-muted opacity-0">Loading your profile…</span>
          <span className="[grid-area:1/1] font-mono text-sm text-muted opacity-0">Loading your settings…</span>
        </div>
        <p className="m-0 font-mono text-xs tracking-[0.08em] text-danger">SAFE ZONE SHRINKING · {label.toUpperCase()}</p>
      </div>
    </div>
  );
}
