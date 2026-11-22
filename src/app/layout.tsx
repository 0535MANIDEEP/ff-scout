import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Inter, JetBrains_Mono, Anton } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import { GLOBAL_DISCLOSURE } from '@/lib/free-entry';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';

// Self-hosted at build time via next/font, no render-blocking external CSS,
// no system-font fallback masquerading as the design system.
const inter = Inter({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });
const anton = Anton({ subsets: ['latin'], variable: '--font-anton', weight: '400', display: 'swap' });
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: `${BRAND.name}, ${BRAND.descriptor}`,
  description: BRAND.description,
  keywords: [
    'free fire match board India',
    'free entry free fire matches',
    'free fire scrims India',
    'free fire cafe matches',
    'free fire guild trials',
    'free fire roster finder',
    'Indian free fire players',
  ],
  authors: [{ name: BRAND.founder, url: BRAND.founderGithub }],
  openGraph: {
    type: 'website',
    title: `${BRAND.name}, free-entry Free Fire match board for India`,
    description: BRAND.description,
    url: `${BRAND.url}/`,
    siteName: BRAND.name,
    images: [{ url: '/hero-gaming.jpg', width: 1200, height: 900, alt: `${BRAND.name} match board for Indian Free Fire players` }],
    locale: BRAND.locale,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: `${BRAND.url}/` },
};

export const viewport: Viewport = {
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light" className={`${inter.variable} ${anton.variable} ${jbmono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: BRAND.name,
            url: BRAND.url,
            applicationCategory: 'GameApplication',
            operatingSystem: 'Web',
            creator: { '@type': 'Person', name: BRAND.founder, email: BRAND.email },
            description: BRAND.description
          }) }}
        />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="shell footnote" role="contentinfo">
          <p className="footnote-disclosure">{GLOBAL_DISCLOSURE} <Link href="/safety">Read the safety and legal notice</Link>.</p>
          <nav className="footnote-nav" aria-label="Legal">
            <Link href="/learn">Learn</Link>
            <Link href="/about">About</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/safety">Safety and legal</Link>
            <Link href="/advertise">Advertise</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <p className="footnote-meta">{BRAND.name}. {BRAND.tagline}. Built by {BRAND.founder}. Independent, not affiliated with Garena or Free Fire. {BRAND.trademark}</p>
          {process.env.SPONSOR_LINE && <p className="footnote-sponsor">Presented by {process.env.SPONSOR_LINE}</p>}
          <p className="footnote-contact"><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
        </footer>
        <BackToTop />
      </body>
    </html>
  );
}
