'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitAction({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <div role="status" aria-live="polite" style={{ marginTop: 16 }}>
          <div className="progress-track" role="progressbar" aria-label="Uploading rank screenshot">
            <div className="progress-bar" />
          </div>
          <p className="small" style={{ marginTop: 10, textAlign: 'center' }}>Uploading to admin queue — admin eye-verifies every upload, manually.</p>
        </div>
      ) : (
        <button className="btn btn-block" type="submit">
          {children}
        </button>
      )}
    </>
  );
}
