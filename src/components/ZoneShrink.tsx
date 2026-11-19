// Safe-zone loader: the Free Fire storm-circle as the brand loading state.
// Honest: no fake completion percentage. The shrinking ring only says "working".
// Reduced-motion users get one static ring and a plain label.
type Props = { label?: string };

export default function ZoneShrink({ label = 'Loading' }: Props) {
  return (
    <div className="shell zone-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="zone-flex">
        <svg className="zone-svg" viewBox="0 0 160 160" width="160" height="160" aria-hidden="true">
          {/* outer storm wall: dashed ring + hazard hatch */}
          <circle cx="80" cy="80" r="72" fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="5 7" />
          <circle cx="80" cy="80" r="58" fill="none" stroke="var(--line)" strokeWidth="1.5" opacity="0.6" />
          {/* the shrinking safe zone: vermilion, FF-accurate gesture */}
          <g className="zone-ring">
            <circle cx="80" cy="80" r="46" fill="none" stroke="var(--accent)" strokeWidth="12" opacity="0.22" />
            <circle cx="80" cy="80" r="46" fill="none" stroke="var(--accent)" strokeWidth="6" />
          </g>
          {/* crosshair heart */}
          <g stroke="var(--text)" strokeWidth="1.6" opacity="0.9">
            <line x1="80" y1="74" x2="80" y2="86" />
            <line x1="74" y1="80" x2="86" y2="80" />
          </g>
        </svg>
        <h2 className="zone-head">HOLD POSITION.</h2>
        <div className="zone-words" aria-hidden="true">
          <span>Landing in the lobby…</span>
          <span>Syncing the roster…</span>
          <span>Checking the shortlist…</span>
        </div>
        <p className="zone-mono">SAFE ZONE SHRINKING · {label.toUpperCase()}</p>
      </div>
    </div>
  );
}
