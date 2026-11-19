import type { Metadata } from 'next';
import UidCheck from '@/components/UidCheck';

export const metadata: Metadata = {
  title: 'Free Fire UID check',
  description: 'Look up any Free Fire UID: live profile data from the game, plus whether that UID sits in Final Circle’s verified roster pool. Free, no login.',
  alternates: { canonical: '/uid-check' },
};

export default function UidCheckPage() {
  return (
    <div className="shell" style={{ paddingBottom: 48, maxWidth: 760 }}>
      <span className="eyebrow-inline" style={{ marginTop: 32 }}>FREE TOOL · NO LOGIN</span>
      <h1 style={{ marginTop: 12 }}>Free Fire UID check</h1>
      <p className="subtext" style={{ marginTop: 12 }}>
        Enter a UID once. You get two answers: the public profile the game shows for that account,
        and whether that UID has cleared verification in the Final Circle pool. Players never pay for this.
      </p>

      <UidCheck />

      <section style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
        <p className="subtext" style={{ maxWidth: '62ch' }}>
          <strong>How the pool answer is earned.</strong> A UID enters the verified pool only after a
          human reviewer matches the UID against an approved rank screenshot. Live profile data comes
          from a third-party provider of the game’s public account fields; Final Circle is independent,
          not affiliated with Garena or Free Fire.
        </p>
      </section>
    </div>
  );
}
