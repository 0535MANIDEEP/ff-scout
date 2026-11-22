# Branching & workflow

This repo uses a light `gitflow`-ish model. The production URL is a deployment setting (`NEXT_PUBLIC_SITE_URL`); it is not recorded in the repository.

## Branches

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | Production. Always deployable. | Configured production deployment |
| `develop` | Integration. Anything ready for review opens here first. | Preview environment |
| `feature/*` | One task per branch (`feature/match-board`) | Not deployed |
| `fix/*` | Bug fixes | Not deployed (rebased into feature) |

## Workflow

1. Branch off `develop`: `git checkout -b feature/short-description develop`
2. Commit small, logical changes (commit messages in present tense: `feat: add free-entry disclosure to match page`).
3. Open a PR **into `develop`**. CI runs. Review.
4. Merge to `develop` once green. Verify on the preview deploy.
5. Open a PR **`develop` → `main`**. Merge after CI. Production deploys.

## Rules that do not move

- Every `main` push must pass lint, test and build — enforced by the CD gate.
- No force-push to `main`.
- No merge to `main` while CI is red on `develop`.
- Every commit that changes behaviour gets a test.
- Tags mark production releases: `v0.1.0`, `v0.2.0` … (create in `main` after deploy is verified).
- No player payment surface, no entry fees and no prize pools may be added to the product.

## Local dev

```bash
npm install
npx prisma migrate deploy   # apply the additive migrations to your database
npm run dev
```

Create an account through `/sign-up`. There is no seeded verification or unlock flow, and no demo accounts are shipped. See `.env.example` for the environment settings, including the public contact email.
