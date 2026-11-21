import { BRAND } from '@/lib/brand';
import { amazon, flipkart } from '@/lib/aff';
import { LOADOUT } from '@/lib/config';
import { publicMetadata } from '@/lib/seo';

export const metadata = publicMetadata(
  'Free Fire loadout for Indian players, Final Circle',
  'What a grassroots Indian Free Fire player actually buys, and why. Disclosed affiliate links, nothing here is paid placement.',
  '/loadout',
);

const GEAR = LOADOUT;

export default function Loadout() {
  return (
    <div className="shell" style={{ paddingBottom: 56, maxWidth: 880 }}>
      <h1 style={{ marginTop: 32 }}>Loadout</h1>
      <p className="lead" style={{ marginTop: 10 }}>Honest gear the grassroots FF player actually uses, no sponsored placements and no hype. Prices are indicative; check the live listing before you buy.</p>

      <div className="card" style={{ marginTop: 16, borderColor: 'var(--accent)' }}>
        <p style={{ fontSize: 14 }}><strong>Disclosure:</strong> links on this page earn a small affiliate commission from Amazon.in and Flipkart. They help pay for hosting. Nothing on this page is paid placement, and commissions do not change the ranking.</p>
        <p style={{ fontSize: 14, marginTop: 8 }}>Final Circle never earns from entry fees or prizes.</p>
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

      <p className="subtext" style={{ marginTop: 18 }}>Buying through these links helps pay for hosting. If you already trust a gear pick of your own, tell us: <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--accent)' }}>{BRAND.email}</a>.</p>
    </div>
  );
}
