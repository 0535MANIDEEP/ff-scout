// Final Circle's public identity and configurable contact/site settings.
// Contact and canonical URL are deployment settings, not repository constants.
export const BRAND = {
  name: 'Final Circle',
  mark: 'FC',
  tagline: 'Post a Free Fire match. Players join. India-wide.',
  descriptor: 'Free Fire match board for India',
  descriptorTagline: 'Free Fire match board · India',
  description: 'A free notice board for Free Fire matches in India. Hosts post, players join. Free entry only, no money handled by Final Circle. 18+.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://finalcircle.example',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@finalcircle.example',
  city: 'India',
  country: 'India',
  locale: 'en_IN',
  trademark: 'Free Fire and Garena are trademarks of Garena International II Private Limited.',
  garenaName: 'Garena International II Private Limited',
} as const;
