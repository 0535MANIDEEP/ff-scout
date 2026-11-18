"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { HeroRosterEntry } from "@/lib/hero-data";

export function Hero({ roster }: { roster: HeroRosterEntry[] }) {
  const router = useRouter();
  return (
    <section className="shell relative py-20 md:py-28">
      <div className="hero-grid">
        <div>
          <span className="eyebrow-inline">FREE FIRE ROSTER FINDER · INDIA</span>
          <h1 style={{ fontSize: 'clamp(42px, 5.6vw, 72px)', marginTop: 12, maxWidth: '15ch' }}>
            A verified roster for your next tournament.
          </h1>
          <p className="subtext" style={{ marginTop: 18, maxWidth: '42ch' }}>
            ₹499 per event. Players screened by admin — one event, one hire. Cafés, colleges, sponsors and guild scouts unlock only when it works.
          </p>
          <div className="cta-row" style={{ marginTop: 28 }}>
            <Link href="/organizer/sign-up" className="btn" style={{ fontSize: 16, padding: '14px 22px' }}>Unlock verified rosters →</Link>
            <Link href="/sign-up" className="btn-tag">I want to be scouted</Link>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>₹499 per event. Full refund until roster locks. Players never pay.</p>
        </div>

        <motion.figure
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="hud-panel"
          aria-label="Live roster preview"
        >
          <div className="hud-panel-head">
            <span>READY NOW · HYDERABAD</span>
            <span>{roster.length}/6 VERIFIED</span>
          </div>
          {roster.length === 0 ? (
            <p className="hud-empty">No verified roster yet. You can be the first.</p>
          ) : roster.slice(0, 4).map((p) => (
            <Link key={p.id} href="/sign-up" className="hud-row" style={{ textDecoration: 'none' }}>
              <span className="hud-handle">{p.displayName}</span>
              <span className="hud-meta">{p.role ?? '—'} · {p.rank}</span>
              <span className="hud-tag">{p.college ?? p.city}</span>
            </Link>
          ))}
          <figcaption className="hud-caption">Admin-verified, updated live. Full stats after sign-up.</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
