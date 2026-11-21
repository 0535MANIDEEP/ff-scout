import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

// Only public, indexable routes. Private routes are noindex and disallowed in
// robots.ts. No lastModified: build time is not a content change.
const PUBLIC_PATHS = [
  '/',
  '/about',
  '/advertise',
  '/faq',
  '/learn',
  '/loadout',
  '/matches',
  '/privacy',
  '/safety',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map(path => ({ url: `${BRAND.url}${path}` }));
}
