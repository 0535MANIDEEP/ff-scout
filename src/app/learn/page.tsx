import Link from 'next/link';
import { LEARN_CHAPTERS } from '@/features/disclosure/learn';
import { publicMetadata } from '@/shared/seo';

export const metadata = publicMetadata(
  'Learn Free Fire',
  'Field notes on Free Fire roles, characters, maps and skill combos for Indian players, with labelled sources.',
  '/learn',
);

const WHERE_LABEL: Record<string, string> = {
  official: 'OFFICIAL',
  community: 'COMMUNITY',
  video: 'VIDEO SEARCH',
};

const WHERE_CLASS: Record<string, string> = {
  official: 'border-[#1F6B3A] text-[#1F6B3A]',
  community: 'border-risk text-risk',
  video: 'border-[#0F4C81] text-[#0F4C81]',
};

const SHELL = 'mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4';
const EYEBROW = 'block font-mono text-xs font-semibold tracking-[0.08em] text-muted';
const H2 = 'text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted max-[600px]:text-base';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';

export default function LearnPage() {
  return (
    <div className={`${SHELL} pb-20 pt-10`}>
      <p className={EYEBROW}>FIELD MANUAL · FREE FIRE INDIA</p>
      <h1 className="mt-[10px] max-w-[22ch] text-[clamp(34px,4.5vw,56px)] font-bold leading-[1.2] tracking-[-0.03em] text-ink">Learn the game the way we read it.</h1>
      <p className={`mt-3 max-w-[56ch] ${SUBTEXT}`}>Written for players who want to play better and hosts running matches. Everything external is labelled, official channels, community work, and honest search links instead of fabricated authority.</p>

      <div className="mt-10 grid grid-cols-[240px_minmax(0,1fr)] items-start gap-8 max-[1024px]:grid-cols-1">
        <nav className="sticky top-[84px] flex flex-col gap-1 rounded-card border border-[#CFC8B9] bg-panel p-4 max-[1024px]:static max-[1024px]:flex-row max-[1024px]:flex-wrap" aria-label="Chapters">
          <span className="mb-2 font-mono text-xs tracking-[0.08em] text-muted">INDEX</span>
          {LEARN_CHAPTERS.map((c, i) => (
            <a key={c.id} href={`#${c.id}`} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-[#E4DFD1] hover:text-ink">
              <span className="font-mono text-xs text-danger">{String(i + 1).padStart(2, '0')}</span>
              <span>{c.title}</span>
            </a>
          ))}
          <Link href="/sign-up" className={`mt-4 w-full text-center ${BTN}`}>Find a match</Link>
        </nav>

        <div className="flex flex-col gap-5">
          {LEARN_CHAPTERS.map((chapter, i) => (
            <article key={chapter.id} id={chapter.id} className="rounded-card border border-[#CFC8B9] bg-panel p-6" aria-labelledby={`${chapter.id}-title`}>
              <header>
                <span className="inline-block font-mono text-xs font-bold text-danger">{chapter.tag}</span>
                <h2 id={`${chapter.id}-title`} className={`mt-2 text-[clamp(1.25rem,1.6vw,1.5rem)] font-bold leading-[1.25] tracking-[-0.02em] text-ink`}>{String(i + 1).padStart(2, '0')} · {chapter.title}</h2>
                <p className={`mt-2 max-w-[60ch] text-sm ${SUBTEXT}`}>{chapter.brief}</p>
              </header>
              {chapter.blocks.map((block, j) => (
                <div key={j} className="mt-6">
                  {block.heading && <p className="mb-2 border-b border-[#CFC8B9] pb-2 font-mono text-xs font-bold text-ink">{block.heading}</p>}
                  <ul className="pl-6">
                    {block.lines.map((line, k) => <li key={k} className="mb-1 text-sm leading-[1.6] text-muted">{line}</li>)}
                  </ul>
                </div>
              ))}
              {chapter.links && (
                <ul className="mt-6 flex list-none flex-col gap-2 border-t border-[#CFC8B9] pl-6 pt-6">
                  {chapter.links.map((link, j) => (
                    <li key={j} className="flex items-baseline gap-3">
                      <span className={`inline-flex min-h-6 shrink-0 items-center rounded-md border px-2 font-mono text-xs font-bold ${WHERE_CLASS[link.where] ?? ''}`}>{WHERE_LABEL[link.where]}</span>
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-[#CFC8B9] text-sm text-ink hover:border-vermilion hover:text-danger">{link.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
