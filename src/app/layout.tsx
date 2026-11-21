import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Inter, JetBrains_Mono, Anton } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';

// Self-hosted at build time via next/font, no render-blocking external CSS,
// no system-font fallback masquerading as the design system.
const inter = Inter({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });
const anton = Anton({ subsets: ['latin'], variable: '--font-anton', weight: '400', display: 'swap' });
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

const themeInit = `(function(){try{var t=localStorage.getItem('ff-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme='light';}})()`;

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: `${BRAND.name}, ${BRAND.descriptor}`,
  description: BRAND.description,
  keywords: [
    'free fire roster',
    'free fire tournament India',
    'free fire cash prize matches',
    'free fire college tournament',
    'free fire tournament organizer India',
    'free fire café scrims',
    'free fire prize money event',
    'free fire esports India',
    'free fire guild recruitment India',
    'free fire player verification',
    'Indian free fire players',
  ],
  authors: [{ name: BRAND.founder, url: BRAND.founderGithub }],
  openGraph: {
    type: 'website',
    title: `${BRAND.name}, Free Fire roster finder for tournament organizers in India`,
    description: BRAND.description,
    url: BRAND.url,
    siteName: BRAND.name,
    images: [{ url: '/hero-gaming.jpg', width: 1200, height: 900, alt: `${BRAND.name} hero image – verified FF players across India` }],
    locale: BRAND.locale,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: BRAND.url },
};

export const viewport: Viewport = {
  colorScheme: 'dark light',
};

function Header() {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden="true">{BRAND.mark}</span>
          <span>{BRAND.name}</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/learn">Learn</Link>
          <Link href="/uid-check">UID check</Link>
          <Link href="/matches">Matches</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <ThemeToggle />
          <Link href="/login" style={{ fontSize: 14 }}>Log in</Link>
          <Link href="/sign-up" className="nav-cta">Join free</Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light" className={`${inter.variable} ${anton.variable} ${jbmono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
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
            description: `Post Free Fire matches and join players in India: BR or CS, casual to esports, free or paid entry.`
          }) }}
        />
        <Header />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="shell" role="contentinfo">
          <div className="footnote">
            {BRAND.name}. {BRAND.tagline}. Built by {BRAND.founder}. Independent, not affiliated with Garena or Free Fire. {BRAND.trademark}
            <nav aria-label="Legal" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 12 }}>
              <Link href="/learn">Learn</Link>
              <Link href="/about">About</Link>
              <Link href="/faq">FAQ</Link>
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
