# FF Scout

Verified Free Fire grassroots-competitive matching between Indian college organizers/festival leads and players. See `SPEC.md` for the one-page definition and `RULES.md` for the engineering rules.

## Run (local)
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Environment
Copy `.env.example` → `.env.local` and fill values.
**No secrets are committed.** Vercel reads env from project settings.

## Deploy to Vercel + Neon (free tier)
```bash
git push origin main
# Vercel auto-deploys; CI verifies the build first.
```

## Layout
```
src/app/              Next.js App Router
src/app/components/   UI primitives (Button, Card)
src/lib/              db, auth, clients
prisma/               schema.prisma + seed.ts
.github/workflows/    ci.yml
```

## Screenshot & verify
Players upload a `rank` screenshot → admin verifies in queue → `players.verified = true`.

## License
MIT.
