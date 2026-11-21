import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/player', '/settings', '/login', '/sign-up', '/sponsor/sign-up', '/post', '/api/'],
    }],
    sitemap: `${BRAND.url}/sitemap.xml`,
  };
}
