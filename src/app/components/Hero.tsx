"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { HeroContext } from "@/lib/hero-data";

export function Hero({ ctx }: { ctx: HeroContext }) {
  const roster = ctx.roster;
  return (
    <section className="hero-full">
      <div className="shell hero-desk">
        <div className="hero-copy">
          <span className="eyebrow-inline">INDIA ROSTER DESK · FREE FIRE</span>
          <h1 className="hero-headline">
            One shortlist.
            <span className="hero-line-accent">Verified once.</span>
          </h1>
          <p className="hero-sub">
            Prize money on the table? You deserve players who actually have the rank to win it. Cafés, fests, sponsor activations, guild trials — anyone putting up MONEY for a Free Fire match gets a roster screened by a human verifier and an export they can act on. Pilot phase: organizers pay nothing yet. Players never pay.
          </p>
          <div className="cta-row">
            <Link href="/organizer/sign-up" className="btn btn-xl">Unlock verified rosters</Link>
            <Link href="/sign-up" className="btn-ghost">I want to be scouted</Link>
          </div>
          <p className="hero-fine">Pilot: shortlist is free right now · at launch ₹499 per event, refund until you lock · players never pay</p>
        </div>

        <motion.figure
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hud-board"
          aria-label="Live roster preview"
        >
          <div className="hud-board-head">
            <span className="hud-board-title">ROSTER · LIVE</span>
            <span className="hud-board-count">{ctx.roster.length}/6 VERIFIED</span>
          </div>
          {roster.length === 0 ? (
            <p className="hud-empty">No verified roster yet. You are looking at an honest board, not a stock photo. Every screenshot gets a human eye-check — first batch reviews any day.</p>
          ) : (
            roster.slice(0, 5).map((p) => (
              <Link key={p.id} href="/sign-up" className="hud-row" style={{ textDecoration: 'none' }}>
                <span className="hud-handle">{p.displayName}</span>
                <span className="hud-meta">{p.role ?? '—'} · {p.rank}</span>
                <span className="hud-tag">{p.college ?? p.city}</span>
              </Link>
            ))
          )}
          <figcaption className="hud-caption">Screened, updated live, from the real pool.</figcaption>
        </motion.figure>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="shell ticker-inner">
          <div className="ticker-item"><strong>{ctx.totalVerified}</strong><span>verified across {ctx.collegeCount} affiliations</span></div>
          <div className="ticker-item"><strong>{ctx.pendingCount}</strong><span>waiting on review</span></div>
          <div className="ticker-item"><strong>Pilot</strong><span>free shortlist right now</span></div>
          <div className="ticker-item"><strong>0</strong><span>players who ever paid us</span></div>
        </div>
      </div>
    </section>
  );
}
