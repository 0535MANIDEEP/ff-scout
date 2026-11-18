# Branching & workflow

`ffscout.vercel.app` is the production home of FF Scout. This repo uses a light `gitflow`-ish model that scales from solo work to a small team.

## Branches

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | Production. Always deployable. | `ffscout.vercel.app` |
| `develop` | Integration. Anything ready for review opens here first. | Preview environment |
| `feature/*` | One task per branch (`feature/verification-screen`) | Not deployed |
| `fix/*` | Bug fixes | Not deployed (rebased into feature) |

## Workflow

1. Branch off `develop`: `git checkout -b feature/shortlist-search develop`
2. Commit small, logical changes (commit messages in present tense: `feat: add csv download of shortlist`).
3. Open a PR **into `develop`**. CI runs. Review.
4. Merge to `develop` once green. Verify on the preview deploy.
5. Open a PR **`develop` → `main`**. Merge after CI. Production deploys.

## Rules that do not move

- Every `main` push must pass lint, test and build — enforced by CD gate.
- No force-push to `main`.
- No merge to `main` while CI is red on `develop`.
- Every commit that changes behaviour gets a test.
- Tags mark production releases: `v0.1.0`, `v0.2.0` … (create in `main` after deploy is verified).

## Local dev

```bash
npm install
npx prisma db push     # syncs test.db and Prisma client
npm run dev
```

Seeded demo accounts (never use in prod):

| Email | Password | Role |
|---|---|---|
| `admin@ffscout.dev` | `ffscout-admin-demo` | admin |
| `org@rajawadilans.dev` | `ffscout-admin-demo` | organizer |
| `rushking_21@ffscout.dev` | `ffscout-admin-demo` | player (verified) |
