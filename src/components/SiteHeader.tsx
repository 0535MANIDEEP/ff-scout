'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BRAND } from '@/lib/brand';

const NAV = [
  { href: '/matches', label: 'Matches' },
  { href: '/learn', label: 'Learn' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const close = useCallback(() => {
    setMenuOpen(false);
    trigger.current?.focus();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    firstLink.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen, close]);

  return (
    <>
      <header className="topbar">
        <div className="shell topbar-inner">
          <Link href="/" className="logo" aria-label={`${BRAND.name}, home`}>
            <span className="logo-mark" aria-hidden="true">{BRAND.mark}</span>
            <span className="logo-name">{BRAND.name}</span>
          </Link>
          <nav className="nav" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="nav-login">Log in</Link>
            <Link href="/sign-up" className="nav-cta">Join free</Link>
          </nav>
          <button
            ref={trigger}
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => (menuOpen ? close() : setMenuOpen(true))}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <button type="button" className="nav-sheet-backdrop" aria-label="Close menu" onClick={close} />
          <div id="site-menu" className="nav-sheet-panel" role="dialog" aria-label="Site menu">
            <p className="nav-sheet-heading">Browse Final Circle</p>
            <nav className="nav-sheet-links" aria-label="Mobile navigation">
              {NAV.map((item, i) => (
                <Link
                  key={item.href}
                  ref={i === 0 ? firstLink : undefined}
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="nav-sheet-actions">
              <Link href="/post" className="btn btn-block">Post a match</Link>
              <Link href="/login" className="btn btn-secondary btn-block">Log in</Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
