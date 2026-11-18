import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url;
  const now = new Date();
  return [
    { url: base + '/', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: base + '/about', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: base + '/faq', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: base + '/sign-up', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: base + '/organizer/sign-up', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
