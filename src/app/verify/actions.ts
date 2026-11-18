'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ name: z.string(), type: z.string(), data: z.string().min(1) });

// Screenshots only. Cap at 5MB and allowlist raster image types —
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
  const dataUri = `data:${f.type};base64,${bytes.toString('base64')}`;
  const parse = schema.safeParse({ name: f.name, type: f.type, data: dataUri });
  if (!parse.success) redirect('/verify?e=invalid');
  await prisma.verificationProof.create({
    data: { userId: s.userId, fileData: dataUri, fileName: f.name, mimeType: f.type, status: 'pending' },
  });
  try {
    await prisma.auditLog.create({ data: { userId: s.userId, action: 'proof_upload', detail: JSON.stringify({ fileName: f.name, size: f.size }) } });
  } catch { /* audit failure must not block the upload */ }
  revalidatePath('/player');
  redirect('/player');
}
