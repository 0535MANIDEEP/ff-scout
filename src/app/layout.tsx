import '../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FF Scout — Verified Free Fire talent for Indian college teams',
  description: 'Players upload their rank screenshot; organizers search verified rosters and export shortlists.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
