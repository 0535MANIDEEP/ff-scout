// Final Circle is the working title. The site is live as "Final Circle" until the
// Final Circle migration ships — but every string lives here for exactly that.
export const BRAND = {
  name: 'Final Circle',
  mark: 'FC',
  tagline: 'Post a Free Fire match. Players join. India-wide.',
  descriptor: 'Free Fire match board for India',
  descriptorTagline: 'Free Fire match board · India',
  description: 'A free notice board for Free Fire matches in India. Hosts post, players join. Free entry only, no money handled by Final Circle. 18+.',
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
  trademark: 'Free Fire and Garena are trademarks of Garena International II Private Limited.',
  garenaName: 'Garena International II Private Limited',
} as const;

export const brandAsset = (p: string) => `${BRAND.url}${p.startsWith('/') ? p : `/${p}`}`;
export const brandTitle = (section: string) => `${section}, ${BRAND.name}`;
export const brandDescription = () => BRAND.description;
