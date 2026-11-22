'use client';

import { useEffect } from 'react';

const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';
const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Do not log error to console, report via Vercel / external monitor in production.
  }, [error]);
  return (
    <div className={NARROW}>
      <h1 className={`mb-2 text-[40px] ${H1}`}>500</h1>
      <p className="text-[17px] leading-[1.55] text-muted">
        Something crashed on our side, this is not your fault. Try again or come back in a few minutes.
      </p>
      <button className={`mt-4 ${BTN}`} onClick={reset}>Try again</button>
      <a href="/" className={`ml-[10px] align-middle ${GHOST}`}>Home</a>
    </div>
  );
}
