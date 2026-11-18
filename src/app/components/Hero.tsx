"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

// Mock roster shown on the landing page — kept deliberately small and
// clearly seeded (demo players from prisma/seed.js) so a first-time visitor
// sees exactly what the product does: filter by role and rank, shortlist, export.
const players = [
  { handle: "RushKing_21", rank: "Heroic", region: "Secunderabad", role: "Rusher", tag: "Ganjikhana" },
  { handle: "iG_Lx0", rank: "Master", region: "Mumbai Tier-2", role: "AWM sniper", tag: "LAN Series" },
  { handle: "Honor_Chur", rank: "Diamond", region: "Hyderabad", role: "Support", tag: "Sponsorship" },
];

export function Hero() {
  const router = useRouter();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/hero-gaming.jpg" alt="" fill priority style={{ objectFit: "cover" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0b0d17 0%, rgba(11,13,23,0.92) 50%, rgba(11,13,23,0.1) 100%)" }} />
      </div>
      <div className="shell relative py-16 md:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl">
          <span className="eyebrow"><span className="dot" /> Verified FF talent for India</span>
          <h1>Real rosters.<br /><span style={{ color: "#ff6b00" }}>Trained, screened, one place.</span></h1>
          <p className="subtext" style={{ maxWidth: "36ch", marginTop: 16 }}>
            Indian Free Fire organizers find verified rosters by role, rank and region. Gamer cafés, fest leads, sponsors, guild scouts — one searchable pool.
          </p>
          <div className="cta-row">
            <sakuga-button onClick={() => router.push('/sign-up')}>Join the pool</sakuga-button>
            <Link href="/organizer/sign-up" className="btn-ghost">I organize events</Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
          {players.map((p) => (
            <div key={p.handle} className="mock-card" style={{ padding: 12 }}>
              <div className="tile-title">{p.handle}</div>
              <div className="tile-sub">{p.region} · {p.role}</div>
              <div className="chip chip-balanced" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                {p.tag}
                <sakuga-tooltip text="Seed demo — real stats come from ranked proofs once verified">
                  <span style={{ opacity: 0.7, marginLeft: 'auto' }}>ⓘ</span>
                </sakuga-tooltip>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
