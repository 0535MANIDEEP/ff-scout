export default function Loading() {
  return (
    <div className="shell" style={{ padding: '48px 0' }}>
      <span className="skel skel-title" />
      <p style={{ height: 14, marginTop: 14 }} className="skel" />
      <div className="list" style={{ marginTop: 20 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className="rowitem" style={{ background: 'var(--panel-2)', border: '1px solid var(--line)' }}>
            <div style={{ flex: 1 }}>
              <span className="skel skel-title" style={{ width: '40%' }} />
              <span className="skel skel-text" />
            </div>
            <span className="skel" style={{ width: 80, height: 26, borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
