import type { MetadataRoute } from 'next';
import { BRAND } from '@/shared/config/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/player', '/settings', '/login', '/sign-up', '/post', '/api/'],
    }],
    sitemap: `${BRAND.url}/sitemap.xml`,
  };
}
