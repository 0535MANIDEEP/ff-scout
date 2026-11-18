'use client';

import { useEffect, useRef, useState } from 'react';

// Hand-rolled entrance: opacity + translateY only. Content is visible by
// default in the DOM; JS arms the hidden state for the animation only, so a
// blocked, occluded or slow client never ships a blank page.
export function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) { setVisible(true); return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hidden = document.visibilityState === 'hidden';
    if (reduce || hidden) { setVisible(true); return; }
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' },
    );
    io.observe(el);
    const fallback = window.setTimeout(() => setVisible(true), 1200);
    return () => { io.disconnect(); window.clearTimeout(fallback); };
  }, []);

  const cls = armed ? `reveal is-armed${visible ? ' is-visible' : ''}` : 'reveal is-visible';
  return (
    <div ref={ref} className={`${cls}${className ? ` ${className}` : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
