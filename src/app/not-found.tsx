export default function NotFound() {
  return (
    <div className="shell" style={{ padding: '88px 0', maxWidth: 720 }}>
      <h1 style={{ fontSize: 64, marginBottom: 8 }}>404</h1>
      <p className="subtext" style={{ fontSize: 18 }}>This roster left the lobby — page not found.</p>
      <a className="btn" href="/" style={{ display: 'inline-flex', textDecoration: 'none', padding: '12px 22px', marginTop: 18 }}>Players → Home</a>
    </div>
  );
}
