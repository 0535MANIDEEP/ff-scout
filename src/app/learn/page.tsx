import type { Metadata } from 'next';
import Link from 'next/link';
import { LEARN_CHAPTERS } from '@/lib/learn';

export const metadata: Metadata = {
  title: 'Field Manual, FF Scout',
  description: 'How to get verified, the five combat roles (and why IGL is a designation), running a verified scrim, and honest sources. For Indian Free Fire players and organizers.',
};

const WHERE_LABEL: Record<string, string> = {
  official: 'OFFICIAL',
  community: 'COMMUNITY',
  video: 'VIDEO SEARCH',
};

export default function LearnPage() {
  return (
    <div className="shell" style={{ padding: '40px 0 80px' }}>
      <p className="eyebrow-inline">FIELD MANUAL · FREE FIRE INDIA</p>
      <h1 style={{ marginTop: 10, fontSize: 'clamp(34px, 4.5vw, 56px)', maxWidth: '22ch' }}>Learn the game the way we read it.</h1>
      <p className="subtext" style={{ marginTop: 12, maxWidth: '56ch' }}>Written for players who want to be verified, and organizers who need a shortlist that doesn&rsquo;t waste their day. Everything external is labelled, official channels, community work, and honest search links instead of fabricated authority.</p>

      <div className="learn-grid" style={{ marginTop: 40 }}>
        <nav className="manual-index" aria-label="Chapters">
          <span className="manual-index-title">INDEX</span>
          {LEARN_CHAPTERS.map((c, i) => (
            <a key={c.id} href={`#${c.id}`}>
              <span className="manual-index-num">{String(i + 1).padStart(2, '0')}</span>
              <span>{c.title}</span>
            </a>
          ))}
          <Link href="/sign-up" className="btn btn-block" style={{ marginTop: 16, textAlign: 'center' }}>Join the pool</Link>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {LEARN_CHAPTERS.map((chapter, i) => (
            <article key={chapter.id} id={chapter.id} className="hud-tile" aria-labelledby={`${chapter.id}-title`}>
              <header>
                <span className="hud-tile-tag">{chapter.tag}</span>
                <h2 id={`${chapter.id}-title`} className="hud-tile-title">{String(i + 1).padStart(2, '0')} · {chapter.title}</h2>
                <p className="hud-tile-brief">{chapter.brief}</p>
              </header>
              {chapter.blocks.map((block, j) => (
                <div key={j} className="hud-tile-block">
                  {block.heading && <p className="hud-tile-heading">{block.heading}</p>}
                  <ul>
                    {block.lines.map((line, k) => <li key={k}>{line}</li>)}
                  </ul>
                </div>
              ))}
              {chapter.links && (
                <ul className="hud-tile-links">
                  {chapter.links.map((link, j) => (
                    <li key={j}>
                      <span className={`where where-${link.where}`}>{WHERE_LABEL[link.where]}</span>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
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
