import { redirect } from 'next/navigation';
import { logout } from '@/features/identity/actions';

export async function POST() {
  await logout();
  redirect('/');
}

export async function GET() {
  await logout();
  redirect('/');
}
