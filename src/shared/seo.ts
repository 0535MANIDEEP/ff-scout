import type { Metadata } from 'next';
import { BRAND } from '@/shared/config/brand';

const OG_IMAGE = [{ url: '/hero-gaming.jpg', width: 1200, height: 900, alt: `${BRAND.name} match board for Indian Free Fire players` }];

// One place decides how the public name appears in every title, so pages cannot
// drift into old or competing names.
const titleWithBrand = (title: string) => `${title} | ${BRAND.name}`;

export function publicMetadata(title: string, description: string, path: string): Metadata {
  const url = `${BRAND.url}${path}`;
  const fullTitle = titleWithBrand(title);
  return {
    title: fullTitle,
    description,
    applicationName: BRAND.name,
    authors: [{ name: BRAND.name }],
    creator: BRAND.name,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: fullTitle,
      description,
      url,
      siteName: BRAND.name,
      locale: BRAND.locale,
      images: OG_IMAGE,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ['/hero-gaming.jpg'],
    },
  };
}

export function privateMetadata(title: string): Metadata {
  return {
    title: titleWithBrand(title),
    applicationName: BRAND.name,
    robots: { index: false, follow: false },
  };
}
