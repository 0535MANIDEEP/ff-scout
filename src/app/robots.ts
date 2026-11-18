import type { MetadataRoute } from 'next';

const BASE = 'https://ff-scout.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/player', '/organizer/'] }],
    sitemap: BASE + '/sitemap.xml',
  };
}
