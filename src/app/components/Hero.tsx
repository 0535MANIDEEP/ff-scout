import Link from "next/link";
import type { HeroContext } from "@/features/matches/hero-data";
import { GLOBAL_DISCLOSURE } from "@/features/disclosure/copy";
import { BRAND } from "@/shared/config/brand";

const GHOST = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px';

export function Hero({ ctx }: { ctx: HeroContext }) {
  const matches = ctx.matches;
  return (
    <section className="border-b border-[#CFC8B9] pb-12 pt-16 max-[600px]:pb-8 max-[600px]:pt-12">
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] items-center gap-12 px-6 max-[1024px]:grid-cols-1 max-[1024px]:gap-8 max-[600px]:gap-6 max-[600px]:px-4">
        <div className="flex flex-col items-start">
          <span className="block font-mono text-xs font-semibold tracking-[0.08em] text-muted">INDIA MATCH BOARD · FREE FIRE</span>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,6vw,4.5rem)] font-normal leading-[1.02] tracking-[0.005em] text-ink max-[600px]:text-[clamp(2.5rem,11vw,3.4rem)]">
            Post a match.
            <span className="block text-vermilion">Find your lobby.</span>
          </h1>
          <p className="mt-4 max-w-[46ch] text-lg leading-[1.6] text-muted max-[1024px]:max-w-[60ch] max-[600px]:text-base">
            {BRAND.name} is a free match board for Indian Free Fire players. Cafés, fests, sponsor activations, guild trials. Hosts post a match and players join. BR or CS, casual or competitive. We're the board, not a gatekeeper.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:[&>a]:w-full">
            <Link href="/post" className="inline-flex min-h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-8 text-center text-base font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px">Post a match</Link>
            <Link href="/matches" className={GHOST}>Find a match</Link>
          </div>
          <p className="mt-6 font-mono text-xs leading-[1.65] text-muted">{GLOBAL_DISCLOSURE}</p>
        </div>

        <figure
          className="animate-hero-in rounded-card border border-[#CFC8B9] bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_rgba(0,0,0,0.06)] max-[600px]:p-4"
          aria-label="Open matches preview"
        >
          <div className="flex items-baseline justify-between gap-3 border-b border-[#CFC8B9] pb-4">
            <span className="font-mono text-sm font-bold text-ink">MATCHES · OPEN</span>
            <span className="font-mono text-xs text-muted">{matches.length} UPCOMING</span>
          </div>
          {matches.length === 0 ? (
            <p className="py-8 leading-[1.6] text-muted">Nothing posted yet. You're looking at an honest board. The first match appears when someone posts it.</p>
          ) : (
            matches.slice(0, 5).map((m) => (
              <Link key={m.id} href={`/matches/${m.id}`} className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-[#CFC8B9] py-3 no-underline last-of-type:border-b-0">
                <span className="min-w-0 font-bold [overflow-wrap:anywhere] group-hover:text-danger group-hover:underline group-hover:underline-offset-[3px]">{m.title}</span>
                <span className="col-start-1 text-sm text-muted [overflow-wrap:anywhere]">{m.gameType} · {m.mode} · {m.city}</span>
                <span className="col-start-2 row-span-2 row-start-1 whitespace-nowrap font-mono text-xs font-bold text-danger">{new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </Link>
            ))
          )}
          <figcaption className="mt-3 border-t border-[#CFC8B9] pt-3 text-sm text-muted">Open matches, updated live, from the board.</figcaption>
        </figure>
      </div>

      <div className="hidden" aria-hidden="true">
        <div className="mx-auto w-full max-w-[1120px] px-6 max-[600px]:px-4">
          <div><strong>{ctx.openMatchCount}</strong><span>open matches</span></div>
          <div><strong>{ctx.totalPlayers}</strong><span>players on the board</span></div>
          <div><strong>18+</strong><span>free entry only</span></div>
        </div>
      </div>
    </section>
  );
}
