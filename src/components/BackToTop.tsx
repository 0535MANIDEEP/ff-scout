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
    <button type="button" className="back-to-top" onClick={toTop} aria-label="Back to top">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square">
        <path d="M5 14 12 7l7 7" />
      </svg>
    </button>
  );
}
