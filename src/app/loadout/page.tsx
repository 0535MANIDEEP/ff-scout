import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';
import { amazon, flipkart } from '@/lib/aff';
import { LOADOUT } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Loadout, Final Circle',
  description: 'What a grassroots Indian Free Fire player actually buys, and why. Disclosed affiliate links — commissions fund the pilot, nothing here is paid placement.',
};

const GEAR = LOADOUT;

export default function Loadout() {
  return (
    <div className="shell" style={{ paddingBottom: 56, maxWidth: 880 }}>
      <h1 style={{ marginTop: 32 }}>Loadout</h1>
      <p className="lead" style={{ marginTop: 10 }}>Honest gear the grassroots FF player actually uses — no sponsored placements, no hype. Prices are indicative; check the live listing before you buy.</p>

      <div className="card" style={{ marginTop: 16, borderColor: 'var(--accent)' }}>
        <p style={{ fontSize: 14 }}><strong>Disclosure:</strong> links on this page earn a small affiliate commission from Amazon.in and Flipkart. They pay for hosting and the verification pipeline while the pilot finds its feet. Nothing on this page is paid placement, and the ranking never gets bought — commissions don’t touch who gets verified or shown first.</p>
      </div>

      <div className="list" style={{ marginTop: 18 }}>
        {GEAR.map(g => (
          <div key={g.label} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: 22 }}>{g.label}</h3>
              <span className="mono small" style={{ color: 'var(--accent)' }}>{g.price}</span>
            </div>
            <p className="subtext" style={{ marginTop: 8 }}>{g.note}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <a className="btn-ghost" href={amazon(g.q)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Amazon.in</a>
              <a className="btn-ghost" href={flipkart(g.q)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Flipkart</a>
            </div>
          </div>
        ))}
      </div>

      <p className="subtext" style={{ marginTop: 18 }}>Buying anything helps keep roster verification free for players. If you already trust a gear pick of your own, tell us: <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}>{BRAND.email}</a>.</p>
    </div>
  );
}
