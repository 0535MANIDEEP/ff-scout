import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata('Join free, Final Circle');

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
