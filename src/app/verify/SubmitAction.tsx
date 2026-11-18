'use client';

import { useFormStatus } from 'react-dom';
import Script from 'next/script';

export default function SubmitAction({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <>
      <Script src="/sakuga-progress.js" strategy="afterInteractive" />
      {pending ? (
        <>
          <sakuga-progress value={0.58} label="Verifying screenshot" style={{ display: 'block', marginTop: 12 }} />
          <p className="small" style={{ marginTop: 10, textAlign: 'center' }}>Uploading to admin queue — admin eye-verifies every upload, manually.</p>
        </>
      ) : (
        <button className="btn" type="submit" style={{ marginTop: 16, width: '100%' }}>
          {children}
        </button>
      )}
    </>
  );
}
