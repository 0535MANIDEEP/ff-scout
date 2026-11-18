import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function POST() {
  const jar = await cookies();
  jar.delete('ffscout_session');
  redirect('/');
}

export async function GET() {
  const jar = await cookies();
  jar.delete('ffscout_session');
  redirect('/');
}
