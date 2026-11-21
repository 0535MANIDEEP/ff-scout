import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Inter, JetBrains_Mono, Anton } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import { GLOBAL_DISCLOSURE } from '@/lib/free-entry';
import { appearanceInitScript } from '@/lib/appearance';
import AppearanceControl from '@/components/AppearanceControl';
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

function Header() {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link href="/" className="logo" aria-label={BRAND.name}>
          <span className="logo-mark" aria-hidden="true">{BRAND.mark}</span>
          <span className="logo-name">{BRAND.name}</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/learn">Learn</Link>
          <Link href="/matches">Matches</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <AppearanceControl />
          <Link href="/login" className="nav-login">Log in</Link>
          <Link href="/sign-up" className="nav-cta">Join free</Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light" data-preset="paper" data-density="regular" data-motion="system" className={`${inter.variable} ${anton.variable} ${jbmono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: appearanceInitScript() }} />
        <a className="skip-link" href="#main-content">Skip to content</a>
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
        <Header />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="shell" role="contentinfo">
          <div className="footnote">
            <p style={{ margin: 0 }}>{GLOBAL_DISCLOSURE} <Link href="/safety" style={{ color: 'var(--accent)' }}>Read the safety and legal notice</Link>.</p>
            <p style={{ margin: '10px 0 0' }}>{BRAND.name}. {BRAND.tagline}. Built by {BRAND.founder}. Independent, not affiliated with Garena or Free Fire. {BRAND.trademark}</p>
            <nav aria-label="Legal" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 12, flexWrap: 'wrap' }}>
              <Link href="/learn">Learn</Link>
              <Link href="/about">About</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/safety">Safety and legal</Link>
              <Link href="/advertise">Advertise</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
            {process.env.SPONSOR_LINE && (
              <p style={{ marginTop: 10, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Presented by {process.env.SPONSOR_LINE}</p>
            )}
            <p style={{ marginTop: 10, fontSize: 12 }}>
              <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--muted)' }}>{BRAND.email}</a>
            </p>
          </div>
        </footer>
        <BackToTop />
      </body>
    </html>
  );
}
