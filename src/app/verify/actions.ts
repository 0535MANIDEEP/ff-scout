'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isCloudinaryConfigured, uploadProofImage } from '@/lib/cloudinary';
import { z } from 'zod';

const schema = z.object({ name: z.string(), type: z.string() });

// Screenshots only. Cap at 5MB and allowlist raster image types , 
// no SVG (admin renders these), no arbitrary uploads masquerading as proofs.
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export async function uploadProof(_formData: FormData) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const s = await verifySession(token ?? '');
  if (!s) redirect('/login');
  const f = _formData.get('screenshot') as File | null;
  if (!f) redirect('/verify?e=missing');
  if (f.size > MAX_BYTES) redirect('/verify?e=size');
  if (!ALLOWED_TYPES.has(f.type)) redirect('/verify?e=type');
  const bytes = Buffer.from(await f.arrayBuffer());
  const parse = schema.safeParse({ name: f.name, type: f.type });
  if (!parse.success) redirect('/verify?e=invalid');

  let data: { fileData?: string; fileUrl?: string; publicId?: string };
  if (isCloudinaryConfigured()) {
    const { secureUrl, publicId } = await uploadProofImage(bytes, f.type);
    data = { fileUrl: secureUrl, publicId };
  } else {
    data = { fileData: `data:${f.type};base64,${bytes.toString('base64')}` };
  }

  await prisma.verificationProof.create({
    data: { userId: s.userId, ...data, fileName: f.name, mimeType: f.type, status: 'pending' },
  });
  try {
    await prisma.auditLog.create({ data: { userId: s.userId, action: 'proof_upload', detail: JSON.stringify({ fileName: f.name, size: f.size, storage: data.fileUrl ? 'cloudinary' : 'inline' }) } });
  } catch { /* audit failure must not block the upload */ }
  revalidatePath('/player');
  redirect('/player');
}
