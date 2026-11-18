import '../styles/globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

// Self-hosted at build time via next/font — no render-blocking external CSS,
// no system-font fallback masquerading as the design system.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://ffscout.vercel.app'),
  title: 'FF Scout — Free Fire roster finder for organizers in India',
  description: 'Find verified Free Fire players for your college fest, café scrim night, esports activation, or guild recruit. One searchable pool, ranked honest, unlocked in minutes for Indian organizers.',
  keywords: [
    'free fire roster',
    'free fire tournament India',
    'free fire qualified players India',
    'free fire college tournament',
    'free fire tournament organizer India',
    'free fire café scrims',
    'free fire esports India',
    'free fire guild recruitment India',
    'free fire player verification',
    'Indian free fire players',
  ],
  authors: [{ name: 'Manideep Daram', url: 'https://github.com/0535MANIDEEP' }],
  openGraph: {
    type: 'website',
    title: 'FF Scout — Free Fire roster finder for tournament organizers in India',
    description: 'Find verified Free Fire players for your college fest, café scrim night, esports activation or guild — one searchable pool, honest ranks, Indian organized tournaments.',
    url: 'https://ffscout.vercel.app/',
    siteName: 'FF Scout',
    images: [{ url: '/hero-gaming.jpg', width: 1200, height: 900, alt: 'FF Scout hero image – verified FF players across India' }],
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

function Header() {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden="true">FF</span>
          <span>FF Scout</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/sign-up" className="nav-cta">Join the pool</Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }} className={`${inter.variable} ${grotesk.variable} ${jbmono.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'FF Scout',
            url: 'https://ffscout.vercel.app/',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '499', priceCurrency: 'INR' },
            creator: { '@type': 'Person', name: 'Manideep Daram', email: 'manideepdaram@gmail.com' },
            description: 'Searchable verified Free Fire rosters for Indian tournaments and cafés.'
          }) }}
        />
        <Header />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="shell" role="contentinfo">
          <div className="footnote">
            FF Scout — verified grassroots Free Fire talent for Indian organizers. Built by Manideep Daram. India-focused. Free Fire is a registered trademark of Garena.
            <nav aria-label="Legal" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 12 }}>
              <Link href="/about">About</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
            <p style={{ marginTop: 10, fontSize: 12 }}>
              <a href="mailto:manideepdaram@gmail.com" style={{ color: 'var(--muted)' }}>manideepdaram@gmail.com</a>
            </p>
            <div style={{ marginTop: 12 }}><span className="footnote-badge">Made by a human</span></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
