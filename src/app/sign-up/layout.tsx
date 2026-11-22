import type { Metadata } from 'next';
import { privateMetadata } from '@/shared/seo';

export const metadata: Metadata = privateMetadata('Join free');

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
