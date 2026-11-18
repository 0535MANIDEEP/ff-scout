export default function Page() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <h1>FF Scout</h1>
      <p>Verified Free Fire grassroots matching for Indian college organizers.</p>
      <section className="card" style={{ padding: 18 }}>
        <h2>For Organizers</h2>
        <p>Browse the verified players first. Export one shortlist in under 5 minutes.</p>
      </section>
      <section className="card" style={{ padding: 18 }}>
        <h2>For Players</h2>
        <p>Upload your rank screenshot to earn the badge. Organizers only contact badged players.</p>
      </section>
      <button className="primary-cta">Join the waitlist</button>
    </main>
  );
}
