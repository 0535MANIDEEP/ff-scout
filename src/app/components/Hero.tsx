"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { HeroContext } from "@/lib/hero-data";

export function Hero({ ctx }: { ctx: HeroContext }) {
  const matches = ctx.matches;
  return (
    <section className="hero-full">
      <div className="shell hero-desk">
        <div className="hero-copy">
          <span className="eyebrow-inline">INDIA MATCH BOARD · FREE FIRE</span>
          <h1 className="hero-headline">
            Post a match.
            <span className="hero-line-accent">Find your lobby.</span>
          </h1>
          <p className="hero-sub">
            Cafés, fests, sponsor activations, guild trials — anyone hosting a Free Fire match posts it here and players join. BR or CS, casual or tournament, free or paid entry. We're the board, not a gatekeeper. Free while we're in pilot.
          </p>
          <div className="cta-row">
            <Link href="/post" className="btn btn-xl">Post a match</Link>
            <Link href="/matches" className="btn-ghost">Find a match</Link>
          </div>
          <p className="hero-fine">Pilot: posting is free right now · players never pay to join · entry fees settle between you and the host</p>
        </div>

        <motion.figure
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hud-board"
          aria-label="Open matches preview"
        >
          <div className="hud-board-head">
            <span className="hud-board-title">MATCHES · OPEN</span>
            <span className="hud-board-count">{matches.length} UPCOMING</span>
          </div>
          {matches.length === 0 ? (
            <p className="hud-empty">Nothing posted yet. You're looking at an honest board — the first match appears when someone posts it.</p>
          ) : (
            matches.slice(0, 5).map((m) => (
              <Link key={m.id} href={`/matches/${m.id}`} className="hud-row" style={{ textDecoration: 'none' }}>
                <span className="hud-handle">{m.title}</span>
                <span className="hud-meta">{m.gameType} · {m.mode} · {m.city}</span>
                <span className="hud-tag">{new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </Link>
            ))
          )}
          <figcaption className="hud-caption">Open matches, updated live, from the board.</figcaption>
        </motion.figure>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="shell ticker-inner">
          <div className="ticker-item"><strong>{ctx.openMatchCount}</strong><span>open matches</span></div>
          <div className="ticker-item"><strong>{ctx.totalPlayers}</strong><span>players on the board</span></div>
          <div className="ticker-item"><strong>Pilot</strong><span>free to post right now</span></div>
          <div className="ticker-item"><strong>0</strong><span>players who ever paid us</span></div>
        </div>
      </div>
    </section>
  );
}
