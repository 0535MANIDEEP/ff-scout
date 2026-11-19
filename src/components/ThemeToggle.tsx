'use client';

import { useEffect, useState } from 'react';

// Pill toggle switch: knob slides to sun for light, moon for dark.
// Labels live on the ends of the track; the knob covers the inactive half.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const t = (document.documentElement.dataset.theme as 'dark' | 'light') || 'dark';
    setTheme(t);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try { localStorage.setItem('ff-theme', next); } catch { /* private mode */ }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === 'light'}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="theme-switch"
      onClick={toggle}
    >
      <span className="theme-switch-track" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="ts-glyph ts-moon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M20.2 14.5A8.5 8.5 0 1 1 9.5 3.8a7 7 0 0 0 10.7 10.7Z" />
        </svg>
        <svg viewBox="0 0 24 24" className="ts-glyph ts-sun" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M5 19l1.7-1.7M17.3 6.7L19 5" />
        </svg>
        <span className="theme-switch-knob" />
      </span>
    </button>
  );
}
