import '../styles/globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

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
    <html lang="en" style={{ colorScheme: 'dark' }}>
      <body>
        <Script src="/sakuga-core.js" strategy="afterInteractive" />
        <Script src="/sakuga-button.js" strategy="afterInteractive" />
        <Script src="/sakuga-tooltip.js" strategy="afterInteractive" />
        <Script src="/sakuga-checkbox.js" strategy="afterInteractive" />
        <Script src="/sakuga-input.js" strategy="afterInteractive" />
        <Script src="/sakuga-progress.js" strategy="afterInteractive" />
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
        <main>{children}</main>
        <footer className="shell" role="contentinfo">
          <div className="footnote">
            FF Scout — verified grassroots Free Fire talent for Indian organizers. Built by Manideep Daram. India-focused. Free Fire is a registered trademark of Garena.
            <nav aria-label="Legal" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 12 }}>
              <Link href="/about">About</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
            <div style={{ marginTop: 12 }}><sakuga-button>Made by a human</sakuga-button></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
