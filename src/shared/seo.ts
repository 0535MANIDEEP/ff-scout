import type { Metadata } from 'next';
import { BRAND } from '@/shared/config/brand';

const OG_IMAGE = [{ url: '/hero-gaming.jpg', width: 1200, height: 900, alt: `${BRAND.name} match board for Indian Free Fire players` }];

export function publicMetadata(title: string, description: string, path: string): Metadata {
  const url = `${BRAND.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: BRAND.name,
      locale: BRAND.locale,
      images: OG_IMAGE,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/hero-gaming.jpg'],
    },
  };
}

export function privateMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
