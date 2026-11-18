'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ name: z.string(), type: z.string(), data: z.string().min(1) });

export async function uploadProof(_formData: FormData) {
  const jar = await cookies();
  const token = jar.get('ffscout_session')?.value;
  const s = await verifySession(token ?? '');
  if (!s) redirect('/login');
  const f = _formData.get('screenshot') as File | null;
  if (!f) redirect('/verify');
  const bytes = Buffer.from(await f.arrayBuffer());
  const dataUri = `data:${f.type};base64,${bytes.toString('base64')}`;
  const parse = schema.safeParse({ name: f.name, type: f.type, data: dataUri });
  if (!parse.success) redirect('/verify');
  await prisma.verificationProof.create({
    data: { userId: s.userId, fileData: dataUri, fileName: f.name, mimeType: f.type, status: 'pending' },
  });
  revalidatePath('/player');
  redirect('/player');
}
