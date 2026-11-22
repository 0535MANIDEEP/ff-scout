import type { Metadata } from 'next';
import { privateMetadata } from '@/shared/seo';

export const metadata: Metadata = privateMetadata('Final Circle internal console');

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
