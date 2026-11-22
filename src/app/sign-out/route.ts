import { redirect } from 'next/navigation';
import { logout } from '@/features/identity/actions';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(origin && host && new URL(origin).host === host);
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) return new Response('Forbidden', { status: 403 });
  await logout();
  redirect('/');
}
