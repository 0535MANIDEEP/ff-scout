import '../styles/globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { IBM_Plex_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { InkRoot } from '@/components/InkRoot';

const ibmPlexMono = IBM_Plex_Mono({subsets:['latin'],weight:['400','500'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: 'FF Scout — Verified grassroots FF talent for organizers across India',
  description: 'Searchable verified Free Fire gym rosters for Indian gamer cafés, fests, sponsors and pro guilds.',
};

function Header() {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">FF</span>
          <span>FF Scout</span>
        </Link>
        <nav className="nav">
          <Link href="/organizer/shortlist">Organizers</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/sign-up" className="nav-cta">Join as Player</Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }} className={cn(ibmPlexMono.variable)}>
      <body>
        <Script src="/sakuga-core.js" strategy="afterInteractive" />
        <Script src="/sakuga-button.js" strategy="afterInteractive" />
        <InkRoot>
          <Header />
          {children}
          <footer className="shell">
            <div className="footnote">
              FF Scout — verified grassroots Free Fire talent for Indian organizers. Built by Manideep Daram. India-focused. Free Fire is a registered trademark of Garena.
              <div style={{ marginTop: 12 }}><sakuga-button>Made by a human</sakuga-button></div>
            </div>
          </footer>
        </InkRoot>
      </body>
    </html>
  );
}
