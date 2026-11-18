"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const players = [
  { handle: "RushKing_21", rank: "Heroic", college: "VJIT", role: "Rusher" },
  { handle: "iG_Lx0", rank: "Master", college: "Ganjikhana", role: "AWM sniper" },
  { handle: "Honor_Chur", rank: "Diamond", college: "VJIT", role: "Support" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/hero-gaming.jpg" alt="" fill priority style={{ objectFit: "cover" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d17] via-[#0b0d17]/80 to-transparent" />
      </div>
      <div className="shell relative py-16 md:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl">
          <span className="eyebrow"><span className="dot" /> India's verified FF roster network</span>
          <h1>Every roster,<br /><span style={{ color: "var(--accent)" }}>verified.</span></h1>
          <p className="subtext" style={{ maxWidth: "34ch", marginTop: 16 }}>
            Verified Indian Free Fire players in one searchable pool. Organisers filter by role, unlock a shortlist, and run the fest.
          </p>
          <div className="cta-row">
            <Link href="/sign-up"><Button size="lg">Join the pool</Button></Link>
            <Link href="/organizer/sign-up" className="btn-ghost">I run a fest</Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
          {players.map((p) => (
            <div key={p.handle} className="mock-card" style={{ padding: 12 }}>
              <div className="tile-title">{p.handle}</div>
              <div className="tile-sub">{p.college} · {p.role}</div>
              <div className="tile-sub" style={{ color: "var(--accent)", fontWeight: 700, marginTop: 4 }}>{p.rank}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
