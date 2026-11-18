'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Do not log error to console — report via Vercel / external monitor in production.
  }, [error]);
  return (
    <main className="shell" style={{ padding: '88px 0', maxWidth: 720 }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>500</h1>
      <p className="subtext" style={{ fontSize: 17 }}>
        Something crashed on our side — this is not your fault. Try again or come back in a few minutes.
      </p>
      <button className="btn" onClick={reset} style={{ marginTop: 16 }}>Try again</button>
      <a href="/" className="btn-ghost" style={{ marginLeft: 10, textDecoration: 'none', verticalAlign: 'middle' }}>Home</a>
    </main>
  );
}
