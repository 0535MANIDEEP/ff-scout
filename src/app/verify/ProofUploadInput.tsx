'use client';

import { useState } from 'react';

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

// Re-encodes the screenshot in-browser before it ever hits the network.
// This is the single biggest protection of the free tier: a 4MB raw
// screenshot becomes ~200-400KB, which is why Cloudinary's 25 credits/month
// covers thousands of proofs instead of dozens.
export default function ProofUploadInput() {
  const [hint, setHint] = useState<string>('');

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size <= 300 * 1024) {
      setHint(`Ready, ${Math.round(file.size / 1024)} KB, no processing needed.`);
      return;
    }
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
      if (scale >= 1) {
        bmp.close();
        setHint(`Ready, ${Math.round(file.size / 1024)} KB.`);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { bmp.close(); setHint('Ready (could not optimize, will upload original).'); return; }
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      bmp.close();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
      if (!blob) { setHint('Ready (could not optimize, will upload original).'); return; }
      const optimized = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
      const dt = new DataTransfer();
      dt.items.add(optimized);
      e.target.files = dt.files;
      setHint(`Optimized to ${Math.round(optimized.size / 1024)} KB before upload, stays under 1 credit far longer.`);
    } catch {
      setHint('Ready (could not optimize, will upload original).');
    }
  }

  return (
    <>
      <label className="label">Rank screenshot<input className="input" type="file" name="screenshot" accept="image/png,image/jpeg,image/webp" required onChange={handleChange} /></label>
      {hint && <p className="small" style={{ marginTop: 6 }}>{hint}</p>}
    </>
  );
}
