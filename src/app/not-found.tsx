export default function NotFound() {
  return (
    <div className="page-narrow">
      <h1 style={{ fontSize: 64, marginBottom: 8 }}>404</h1>
      <p className="subtext" style={{ fontSize: 18 }}>This roster left the lobby, page not found.</p>
      <a className="btn" href="/" style={{ display: 'inline-flex', textDecoration: 'none', padding: '12px 22px', marginTop: 18 }}>Back to home</a>
    </div>
  );
}
