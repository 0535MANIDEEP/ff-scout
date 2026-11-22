'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BRAND } from '@/shared/config/brand';

const NAV = [
  { href: '/matches', label: 'Matches' },
  { href: '/learn', label: 'Learn' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

const BUTTON_BASE = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-6 text-center text-sm font-bold leading-[1.2] no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] active:translate-y-px';

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
      <header className="sticky top-0 z-[60] h-[68px] border-b border-[#CFC8B9] bg-[rgba(236,231,221,0.94)] backdrop-blur-[8px] max-[860px]:h-[60px]">
        <div className="mx-auto flex h-[68px] w-full max-w-[1120px] items-center justify-between gap-6 px-6 max-[860px]:h-[60px] max-[600px]:px-4">
          <Link href="/" className="inline-flex min-h-11 shrink-0 items-center gap-3" aria-label={`${BRAND.name}, home`}>
            <span className="grid h-8 w-8 place-items-center rounded-md bg-vermilion font-display text-sm leading-none text-panel" aria-hidden="true">{BRAND.mark}</span>
            <span className="font-display text-lg font-normal leading-none tracking-[0.02em]">{BRAND.name}</span>
          </Link>
          <nav className="flex min-h-11 items-center gap-2 max-[860px]:hidden" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? 'page' : undefined} className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-muted hover:bg-[#E4DFD1] hover:text-ink aria-[current=page]:font-bold aria-[current=page]:text-ink">
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="ml-2 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-muted hover:bg-[#E4DFD1] hover:text-ink">Log in</Link>
            <Link href="/sign-up" className="ml-2 inline-flex min-h-11 items-center rounded-lg border border-vermilion bg-transparent px-4 text-sm font-bold text-danger hover:bg-[#E4DFD1]">Join free</Link>
          </nav>
          <button
            ref={trigger}
            type="button"
            className="hidden min-h-11 min-w-11 items-center gap-2 rounded-lg border border-[#CFC8B9] bg-panel px-3 text-sm font-bold text-ink max-[860px]:inline-flex"
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
          <button type="button" className="fixed inset-0 z-[90] border-0 bg-[rgba(0,0,0,0.42)]" aria-label="Close menu" onClick={close} />
          <div id="site-menu" className="fixed bottom-0 right-0 top-[68px] z-[91] w-[min(360px,100%)] overflow-y-auto border-l border-[#CFC8B9] bg-panel p-6 shadow-[0_18px_48px_rgba(0,0,0,0.22)] max-[860px]:top-[60px]" role="dialog" aria-label="Site menu">
            <p className="mb-3 font-mono text-xs tracking-[0.08em] text-muted">Browse Final Circle</p>
            <nav className="mb-6 flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV.map((item, i) => (
                <Link
                  key={item.href}
                  ref={i === 0 ? firstLink : undefined}
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                  className="flex min-h-12 items-center rounded-lg px-3 font-semibold hover:bg-[#E4DFD1] aria-[current=page]:bg-[#E4DFD1]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="grid gap-3 border-t border-[#CFC8B9] pt-6">
              <Link href="/post" className={`${BUTTON_BASE} mt-0 w-full border-vermilion bg-vermilion text-panel hover:border-danger hover:bg-danger`}>Post a match</Link>
              <Link href="/login" className={`${BUTTON_BASE} mt-0 w-full border-[#CFC8B9] bg-panel text-ink hover:border-line hover:bg-[#E4DFD1]`}>Log in</Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
