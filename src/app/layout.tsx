import '../styles/globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FF Scout — Verified Free Fire grassroots matching for Indian college teams',
  description: 'Indian college Free Fire organizers, verified rosters, shortlist in 5 minutes.',
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
          <Link href="/sign-up" className="nav-cta">Join as Player</Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }}>
      <body>
        <Header />
        {children}
        <footer className="shell">
          <div className="footnote">
            FF Scout — verified Free Fire grassroots matching for Indian college organizers. Built by Manideep Daram. India-focused. Free Fire is a registered trademark of Garena.
          </div>
        </footer>
      </body>
    </html>
  );
}
