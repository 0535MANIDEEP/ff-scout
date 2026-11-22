import 'server-only';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';

// Store a digest, not the raw address: rate-limit rows are personal data too.
export async function clientIpKey(): Promise<string> {
  const h = await headers();
  const ip =
    h.get('x-real-ip')?.trim() ||
    h.get('x-forwarded-for')?.split(',').pop()?.trim() ||
    'unknown';
  return createHash('sha256').update(ip).digest('hex');
}
