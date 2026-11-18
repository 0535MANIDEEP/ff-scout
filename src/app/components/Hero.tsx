"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { HeroRosterEntry } from "@/lib/hero-data";

export function Hero({ roster }: { roster: HeroRosterEntry[] }) {
  const router = useRouter();
  return (
    <section className="shell relative py-12 md:py-20">
      <div className="hero-grid">
        <div>
          <h1>
            Roster wins.<br />
            <span style={{ color: "#FF6B00" }}>Screened once.</span><br />
            Pooled for India.
          </h1>
          <p className="subtext" style={{ marginTop: 18, maxWidth: "42ch" }}>
            Real Free Fire competitive rosters screened by admin — by role, rank and region. One pool, one ₹499 unlock per event.
          </p>
          <div className="cta-row">
            <sakuga-button onClick={() => router.push('/sign-up')}>Join the pool</sakuga-button>
            <Link href="/organizer/sign-up" className="btn-tag">I run events →</Link>
          </div>
        </div>

        <motion.figure
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="hud-panel"
          aria-label="Live roster preview"
        >
          <div className="hud-panel-head">
            <span>ROSTER · LIVE</span>
            <span>{roster.length} VERIF</span>
          </div>
          {roster.length === 0 ? (
            <p className="hud-empty">No verified roster yet. The first signup signs up the whole product — be it.</p>
          ) : roster.slice(0, 4).map((p) => (
            <div key={p.id} className="hud-row">
              <span className="hud-handle">{p.displayName}</span>
              <span className="hud-meta">{p.role ?? '—'} · {p.rank}</span>
              <span className="hud-tag">{p.college ?? p.city}</span>
            </div>
          ))}
          <figcaption className="hud-caption">Seed data from local SQLite. Toggle via <code>npm run dev</code> on Windows.</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
