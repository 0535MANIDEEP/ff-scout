// Final Circle is the working title. The site is live as "Final Circle" until the
// Final Circle migration ships — but every string lives here for exactly that.
export const BRAND = {
  name: 'Final Circle',
  mark: 'FC',
  tagline: 'Post a Free Fire match. Players join. India-wide.',
  descriptor: 'Free Fire match board for India',
  descriptorTagline: 'Free Fire match board · India',
  description: 'Post Free Fire matches and join players across India: BR or CS, casual to esports, free or paid entry. Players host, players join, sponsors scout the opted-in.',
  // Domain: finalcircle.gg is the target. Not purchased yet — until then the
  // canonical URL stays the Vercel deployment. Set NEXT_PUBLIC_SITE_URL in
  // Vercel when the domain is live.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ff-scout.vercel.app',
  email: 'manideepdaram@gmail.com',
  founder: 'Manideep Daram',
  founderGithub: 'https://github.com/0535MANIDEEP',
  city: 'India',
  country: 'India',
  locale: 'en_IN',
  pricing: {
    // Launch price per event. guildAnnual/sponsorActivation are deliberately NOT
    // listed — no such tiers exist and none are promised anywhere.
    eventUnlock: 499,
    currency: 'INR',
  },
  trademark: 'Free Fire and Garena are trademarks of Garena International II Private Limited.',
  garenaName: 'Garena International II Private Limited',
} as const;

export const brandAsset = (p: string) => `${BRAND.url}${p.startsWith('/') ? p : `/${p}`}`;
export const brandTitle = (section: string) => `${section} — ${BRAND.name}`;
export const brandDescription = () => BRAND.description;
