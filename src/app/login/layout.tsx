import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata('Log in, Final Circle');

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
