# FF Scout

Verified Free Fire rosters for Indian tournament organizers. A self-hosted, open-source, India-first recruiting tool for the esports grassroots scene.

**Live:** [ffscout.vercel.app](https://ffscout.vercel.app) — mostly placeholder seed data today. Real organizers onboard on week 1.

## What it solves

Indian FF tournament organizers — college fest leads, café LAN operators, esports café owners, sponsors — have a shortlist problem: hundreds of DMs, wrong ranks, wrong roles, wasted hours, forged screenshots. FF Scout hands them one verified shortlist with role, rank, and region.

## Who pays · who joins

| Who | What | Cost |
|---|---|---|
| **Tournament organizers** | Unlock one shortlist/searchable export per event | ₹499 per event |
| **Players** | Upload rank screenshot → admin verifies → appear in roster pool | Free |
| **Sponsors** | Buy unlockable cohorts across cities | negotiated |

This model is deliberate — see `docs/adr/0001-recruiter-first.md`.

## Repository layout

See [docs/codemap.md](docs/codemap.md). Decision log lives in `docs/adr/`.

## Run it locally

```bash
npm install                     # needs Node 20+
npx prisma db push              # builds test.db
npm run dev
```

Open the app. Login as:

- `admin@ffscout.dev` / `ffscout-admin-demo` — admin role, verification queue
- `org@rajawadilans.dev` / `ffscout-admin-demo` — organizer, shortlist dashboard
- `<player>@ffscout.dev` / `ffscout-admin-demo` — any seeded player

All passwords are `ffscout-admin-demo` in the demo seed.

## Build & verify

```bash
npm run lint          # tsc --noEmit
npm test              # self-contained: pushes schema to test.db, seeds, asserts
npm run build          # production build (Turbopack)
```

## Deploy

Vercel git-connected from `main` — git push here → live. The CD workflow tags releases (`v0.2.0` etc.).

## License

MIT.
