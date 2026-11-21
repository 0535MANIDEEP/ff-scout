import Link from 'next/link';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';
import { GLOBAL_DISCLOSURE } from '@/lib/free-entry';

export const metadata: Metadata = {
  title: 'Safety and legal, Final Circle',
  description: 'The free-entry rule, no-money rule, reporting and grievance paths, and how Final Circle earns money. Read before posting or joining.',
  alternates: { canonical: `${BRAND.url}/safety` },
};

const RESEARCH = [
  { label: 'GaganLegal, Online Gaming Rules 2026', href: 'https://gaganlegal.com/articles/online-gaming-proga-rules-2026' },
  { label: 'SolvLegal, Online Gaming Rules 2026 and esports', href: 'https://solvlegal.com/blogs/online-gaming-rules-2026-india-money-games-ban-esports' },
];

export default function Safety() {
  return (
    <div className="page-narrow">
      <span className="eyebrow-inline" style={{ marginTop: 32 }}>THE RULES, IN PLAIN WORDS</span>
      <h1 style={{ marginTop: 10 }}>Safety and legal</h1>
      <p className="lead" style={{ marginTop: 12 }}>{GLOBAL_DISCLOSURE}</p>
      <p className="subtext" style={{ marginTop: 10 }}>
        This page is the short version of the rules that govern every listing on Final Circle. If a post or a message contradicts anything here, trust this page.
      </p>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>What Final Circle is</h2>
        <p className="subtext" style={{ marginTop: 8 }}>
          A notice board for Free Fire matches in India. Hosts post a match. Players join it. The host sees the roster with the display name, UID and self-declared ranks each player entered. Final Circle is the board, not the tournament organiser.
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>What we do not do</h2>
        <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
          <li>We do not ask players to pay an entry fee, deposit or stake to join a listing.</li>
          <li>We do not advertise cash prizes or prize pools on any listing.</li>
          <li>We do not collect, hold, transfer or pay out money. There is no escrow or payment rail here.</li>
          <li>We do not verify players, check screenshots, issue verified badges or maintain a verified shortlist.</li>
          <li>We do not settle disputes between a host and a player about money, because no money moves through us.</li>
          <li>We do not promise a match will happen. Listings are posted by hosts, and we show what the database says.</li>
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Why the rule is this strict</h2>
        <p className="subtext" style={{ marginTop: 10 }}>
          India&apos;s Promotion and Regulation of Online Gaming Act 2025 and the Promotion and Regulation of Online Gaming Rules 2026 came into force on 1 May 2026. In plain words, an online money game is a game where a player puts money in and expects money or something monetisable out, whether the game is based on skill, chance or both. Offering, advertising and facilitating such a game are prohibited, with serious penalties.
        </p>
        <p className="subtext" style={{ marginTop: 10 }}>
          The esports carve-out needs recognition under the National Sports Governance Act 2025 and registration with the Online Gaming Authority of India. Final Circle is an independent community site and does not hold either. Free entry with no advertised cash prize is the line we stay on.
        </p>
        <p className="subtext" style={{ marginTop: 10 }}>
          This is background research, not legal advice. A qualified lawyer must review the final product and copy before launch. Background reading:
        </p>
        <ul className="subtext" style={{ marginTop: 8, listStyle: 'disc', paddingLeft: 18 }}>
          {RESEARCH.map(({ label, href }) => (
            <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{label}</a></li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Free events and sponsor funding</h2>
        <p className="subtext" style={{ marginTop: 10 }}>
          A sponsor may pay to place a message on the site or fund a free event. Players still pay nothing to join. Any reward is funded and delivered by the sponsor, outside Final Circle. We never hold the money and we never advertise a cash prize on a listing. If you want to fund an event, read <Link href="/advertise" style={{ color: 'var(--accent)' }}>Advertise</Link>.
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>18+ only</h2>
        <p className="subtext" style={{ marginTop: 10 }}>
          Final Circle is for people aged 18 or older. Signing up records that confirmation. If you believe someone under 18 has an account, write to the grievance address below and we will erase it.
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>How reporting works</h2>
        <p className="subtext" style={{ marginTop: 10 }}>
          Open any match and use &quot;Report this match&quot;. Pick a category and add a short note. Categories are asking players to pay, fake or finished match, and something else.
        </p>
        <p className="subtext" style={{ marginTop: 10 }}>
          When two players who actually joined the same match report it for asking players to pay, the match closes automatically and the host cannot post for exactly seven days. The clock is set by our server, not by a reviewer. The consequence cannot be skipped by waiting for a human to read the report. The match then shows the real number of joined reports. Reports are kept with our operational logs.
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Grievance path</h2>
        <p className="subtext" style={{ marginTop: 10 }}>
          Report the match in the app first. If you cannot use the app, write to <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}>{BRAND.email}</a>. If it is still unresolved, you may approach the Online Gaming Authority of India within 30 days. For data rights under the DPDP Act, the same email is the Grievance Officer address, and you may then approach the Data Protection Board of India.
        </p>
        <p className="subtext" style={{ marginTop: 10 }}>
          Point of contact: {BRAND.founder}, {BRAND.city}, {BRAND.country}.
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>How we earn</h2>
        <ul className="subtext" style={{ marginTop: 10, listStyle: 'disc', paddingLeft: 18 }}>
          <li>Sponsor placements on the site, disclosed wherever they appear.</li>
          <li>Disclosed affiliate links on the loadout page. A purchase there earns a small commission from the retailer.</li>
          <li>Sponsor-funded free events, where the sponsor pays outside the app and the player pays nothing.</li>
        </ul>
        <p className="subtext" style={{ marginTop: 10 }}>
          We do not earn from entry fees, prizes, verification fees or paid tiers. There is no checkout on this site.
        </p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Independent site</h2>
        <p className="subtext" style={{ marginTop: 10 }}>
          Final Circle is not affiliated with Garena, Free Fire, any government body or any esports organisation. {BRAND.trademark} Nothing here is official Garena or Free Fire merchandise, communication or policy.
        </p>
      </section>

      <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/matches" className="btn" style={{ textDecoration: 'none' }}>Browse free matches</Link>
        <Link href="/terms" className="btn-ghost" style={{ textDecoration: 'none' }}>Terms</Link>
        <Link href="/privacy" className="btn-ghost" style={{ textDecoration: 'none' }}>Privacy</Link>
      </div>
    </div>
  );
}
