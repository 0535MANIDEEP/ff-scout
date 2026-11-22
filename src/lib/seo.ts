import type { Metadata } from 'next';
import { BRAND } from '@/shared/config/brand';

export function publicMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${BRAND.url}${path}` },
  };
}

export function privateMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
