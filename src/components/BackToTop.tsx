'use client';

import { useEffect, useState } from 'react';

// Back-to-top: appears only after a meaningful scroll depth.
// Scroll handler is rAF-throttled (not debounced — button must track position,
// not wait for silence). Hidden = removed from layout/tab order entirely.
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShow(window.scrollY > 420);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  function toTop() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  return (
    <button type="button" className="fixed bottom-6 right-6 z-[70] grid h-12 w-12 place-items-center rounded-lg border border-[#CFC8B9] bg-panel text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)] hover:bg-[#E4DFD1] hover:text-danger" onClick={toTop} aria-label="Back to top">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square">
        <path d="M5 14 12 7l7 7" />
      </svg>
    </button>
  );
}
