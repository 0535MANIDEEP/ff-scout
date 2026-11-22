import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Inter, JetBrains_Mono, Anton } from 'next/font/google';
import { BRAND } from '@/shared/config/brand';
import { ContactNow } from '@/shared/ui/ContactNow';
import { SPONSOR_LINE } from '@/features/sponsors/placement';
import { GLOBAL_DISCLOSURE } from '@/features/disclosure/copy';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';

// Self-hosted at build time via next/font, no render-blocking external CSS,
// no system-font fallback masquerading as the design system.
const inter = Inter({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });
const anton = Anton({ subsets: ['latin'], variable: '--font-anton', weight: '400', display: 'swap' });
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  applicationName: BRAND.name,
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
  authors: [{ name: BRAND.name }],
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

const FOOTER_LINK = 'inline-flex min-h-11 items-center text-danger hover:text-vermilion';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${anton.variable} ${jbmono.variable}`}>
      <body className="min-h-screen bg-paper font-ui text-base leading-[1.55] text-ink antialiased [text-rendering:optimizeLegibility]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': `${BRAND.url}/#organization`,
                name: BRAND.name,
                url: BRAND.url,
                email: BRAND.email,
                description: BRAND.description,
              },
              {
                '@type': 'WebSite',
                '@id': `${BRAND.url}/#website`,
                url: BRAND.url,
                name: BRAND.name,
                description: BRAND.description,
                publisher: { '@id': `${BRAND.url}/#organization` },
              },
              {
                '@type': 'WebApplication',
                '@id': `${BRAND.url}/#webapp`,
                name: BRAND.name,
                url: BRAND.url,
                applicationCategory: 'GameApplication',
                operatingSystem: 'Web',
                description: BRAND.description,
                publisher: { '@id': `${BRAND.url}/#organization` },
                isPartOf: { '@id': `${BRAND.url}/#website` },
              },
            ],
          }).replace(/</g, '\\u003c') }}
        />
        <a className="fixed left-3 top-[-100px] z-[200] inline-flex min-h-11 items-center rounded-lg bg-ink px-4 font-bold text-paper focus-visible:top-3 focus-visible:text-paper" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="focus:outline-none">{children}</main>
        <footer className="mx-auto mt-16 w-full max-w-[1120px] border-t border-[#CFC8B9] px-6 pb-16 pt-12 text-left text-sm text-muted max-[600px]:px-4" role="contentinfo">
          <p className="max-w-[70ch] font-bold text-ink">{GLOBAL_DISCLOSURE} <Link href="/safety" className={FOOTER_LINK}>Read the safety and legal notice</Link>.</p>
          <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-2" aria-label="Legal">
            <Link href="/learn" className={FOOTER_LINK}>Learn</Link>
            <Link href="/about" className={FOOTER_LINK}>About</Link>
            <Link href="/faq" className={FOOTER_LINK}>FAQ</Link>
            <Link href="/safety" className={FOOTER_LINK}>Safety and legal</Link>
            <Link href="/advertise" className={FOOTER_LINK}>Advertise</Link>
            <Link href="/terms" className={FOOTER_LINK}>Terms</Link>
            <Link href="/privacy" className={FOOTER_LINK}>Privacy</Link>
          </nav>
          <p className="mt-4 max-w-[80ch] leading-[1.6]">{BRAND.name}. {BRAND.tagline}. Built independently, not affiliated with Garena or Free Fire. {BRAND.trademark}</p>
          {SPONSOR_LINE && <p className="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-muted">Presented by {SPONSOR_LINE}</p>}
          <p className="mt-3"><ContactNow variant="footer" /></p>
        </footer>
        <BackToTop />
      </body>
    </html>
  );
}
