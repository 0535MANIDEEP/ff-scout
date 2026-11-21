import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata('Sponsor access, Final Circle');

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
