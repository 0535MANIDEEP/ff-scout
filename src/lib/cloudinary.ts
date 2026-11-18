import { createHash, randomBytes } from 'node:crypto';

// Cloudinary integration — deliberately SDK-free. The upload is one signed
// multipart POST; pulling the whole SDK to sign a sha1 would add a dependency
// we cannot audit. Free tier (25 credits/month) is far above our pilot use:
// proofs are re-encoded to <=1600px JPEG (~150–400 KB), so 25 GB of storage
// and 25 GB of bandwidth cover thousands of players.
//
// Env (all optional — if unset we fall back to base64-in-Postgres, dev mode):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

const FOLDER = 'ff-scout/proofs';

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  );
}

export function signParams(params: Record<string, string>, apiSecret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(payload + apiSecret).digest('hex');
}

export interface ProofUpload {
  secureUrl: string;
  publicId: string;
}

export async function uploadProofImage(bytes: Buffer, mimeType: string, originalName: string): Promise<ProofUpload> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) throw new Error('cloudinary not configured');

  const publicId = `proof-${Date.now()}-${randomBytes(6).toString('hex')}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params: Record<string, string> = {
    folder: FOLDER,
    overwrite: 'false',
    public_id: publicId,
    timestamp,
  };
  const signature = signParams(params, secret);

  const form = new FormData();
  form.set('file', `data:${mimeType};base64,${bytes.toString('base64')}`);
  form.set('api_key', key);
  form.set('timestamp', timestamp);
  form.set('folder', FOLDER);
  form.set('overwrite', 'false');
  form.set('public_id', publicId);
  form.set('signature', signature);
  // keep the filename meaningful for admins, no PII beyond what they uploaded
  form.set('context', `original_name=${encodeURIComponent(originalName).slice(0, 120)}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const data = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url || !data.public_id) {
    throw new Error(`cloudinary upload failed: ${data.error?.message ?? res.status}`);
  }
  return { secureUrl: data.secure_url, publicId: data.public_id };
}

export async function destroyProofImage(publicId: string): Promise<void> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) return;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { public_id: publicId, timestamp };
  const signature = signParams(params, secret);
  const form = new FormData();
  form.set('public_id', publicId);
  form.set('api_key', key);
  form.set('timestamp', timestamp);
  form.set('signature', signature);
  await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/destroy`, { method: 'POST', body: form });
}
