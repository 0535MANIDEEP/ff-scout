// Single source of truth for brand identity. If the name, URL, pricing or
// contact ever change, everything (metadata, robots, sitemap, JSON-LD,
// footer, legal pages) changes here, no hunting through files.
//
// For per-deployment overrides set NEXT_PUBLIC_SITE_URL in the platform's env
// (e.g. a preview deploy). Local dev needs nothing.

export const BRAND = {
  name: 'FF Scout',
  mark: 'FF',
  tagline: 'Verified grassroots Free Fire talent for Indian organizers',
  descriptor: 'Free Fire roster finder for organizers in India',
  descriptorTagline: 'Free Fire roster finder · India',
  description:
    'Find verified Free Fire players for your college fest, café scrim night, esports activation, or guild recruit. One searchable pool, ranked honest, unlocked in minutes for Indian organizers.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ff-scout.vercel.app',
  email: 'manideepdaram@gmail.com',
  founder: 'Manideep Daram',
  founderGithub: 'https://github.com/0535MANIDEEP',
  city: 'Hyderabad',
  country: 'India',
  locale: 'en_IN',
  pricing: {
    eventUnlock: 499,
    guildAnnual: 1999,
    sponsorActivation: 15000,
    currency: 'INR',
  },
  trademark: 'Free Fire and Garena are trademarks of Garena International II Private Limited.',
  garenaName: 'Garena International II Private Limited',
} as const;

// Path helpers, one place, absolute always.
export const brandAsset = (p: string) => `${BRAND.url}${p.startsWith('/') ? p : `/${p}`}`;
export const brandTitle = (section: string) => `${section}, ${BRAND.name}`;
export const brandDescription = () => BRAND.description;
