# Final Circle

Final Circle is a free notice board for Free Fire matches in India. Hosts post, players join, and players never pay.

> Free entry only. No money handled by Final Circle. 18+.

**Live:** [ffscout.vercel.app](https://ffscout.vercel.app)

## What it does

- A host posts a free match at `/post` and manages it at `/player/posted`.
- A player joins from `/matches/[id]`. In competitive and esports modes the join can include an optional team or guild name.
- Weekly series are templates that create future match occurrences. The trust ladder is self-serve: three hosted matches with at least two distinct non-host joiners unlock weekly series, up to two active at a time. Two zero-join occurrences pause a series automatically.
- Every match has a report form with a category. Two payment-request reports from players who joined close the match and pause the host's posting for exactly seven days from server time, and an audit log entry is written. There is no human review before the consequence.
- Sponsors arrange placements and funded free events by email through `/advertise`. There is no sponsor directory or player data product.

Final Circle does not collect, hold or pay money, run escrow, verify players, issue badges, or settle money disputes. There is no payment gateway and no checkout. Revenue comes from disclosed sponsor placements, disclosed affiliate links on `/loadout`, and sponsor-funded free events. Players never pay the platform.

## Read the full notice

- [Safety and legal](https://ff-scout.vercel.app/safety) gives the free-entry rule, the no-money rule, reporting, the grievance path and how we earn.
- [SPEC.md](SPEC.md) is the product source of truth. [ADR 0005](docs/adr/0005-legal-safe-free-entry-and-revenue.md) records the decision behind the reset.
- Grievance contact: manideepdaram@gmail.com.

The legal background in those documents is research, not legal advice. A qualified lawyer must review the final product and copy before launch.

## Run it locally

Requires Node 20+ and a Postgres database. Prisma reads `DATABASE_URL` from the environment or `.env.local`.

```bash
npm install
npx prisma migrate deploy   # apply the additive migrations to your database
npm run dev
```

Create an account through `/sign-up`. There is no seeded verification or unlock flow. Do not run `prisma/seed.js` against a real database.

## Tests

Run tests with `DATABASE_URL` removed so they never touch a shared database:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; npm test
```

## Repository layout

See [docs/codemap.md](docs/codemap.md) for the code map and `docs/adr/` for decisions.

## License

MIT.
