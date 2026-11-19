# FF Scout — Editable content map

If you (the buyer) want to change copy without touching code structure, edit these files.

Each entry: file path → what the user sees.

## Site-wide

- `src/lib/brand.ts` — Name, mark, tagline, email, founder, pricing, city, trademark line. Every page imports `BRAND` from here. Change once; changes everywhere.

## Landing page (`/`)

- Hero headline — `src/app/components/Hero.tsx`, the `<h1 className="hero-headline">` block
- Hero subhead — same file, `<p className="hero-sub">`
- Hero ticker strip — same file, `<div className="ticker">` — four stats; the first and second pull from the DB, the third and fourth are hardcoded kindness-honest
- Verification board empty state — same file, `<p className="hud-empty">`
- Waiting on admin review count wording — same file, `{ctx.pendingCount}` — driven by DB; don't fake it
- "How it works" 3 cards — `src/app/page.tsx`, the grid-3 block with 3 `<article className="card">` elements
- "What this replaces" table — same file, 4 rows
- Final CTA "₹499 unlocks..." — same file, 1 section
- City-unlock prompt — same file, 1 section with `<Waitlist />`
- Footer copy — `src/app/layout.tsx`, `<footer>...</footer>`

## Auth screens

- Sign-up (`/sign-up`) — `src/app/sign-up/page.tsx`
- Organizer sign-up (`/organizer/sign-up`) — `src/app/organizer/sign-up/page.tsx`
- Log in (`/login`) — `src/app/login/page.tsx`

## Public info pages

- About (`/about`) — `src/app/about/page.tsx`
- FAQ (`/faq`) — `src/app/faq/page.tsx`, array of `{ q, a }`
- Terms (`/terms`) — `src/app/terms/page.tsx`
- Privacy (`/privacy`) — `src/app/privacy/page.tsx`
- Learn (`/learn`) — `src/lib/learn.ts` array of chapters

## Adding a new FAQ

```ts
const items = [
  { q: '...', a: '...' },
  // append here
];
```

## Adding a new Learn chapter

```ts
{
  id: 'new-chapter',      // URL anchor
  tag: 'DRILL',           // one of DRILL / INTEL / PLAYBOOK / SOURCES / DISCIPLINE
  title: '...',
  brief: '...',
  blocks: [{ heading: '...', lines: ['...'] }],
  links: [{ label: '...', href: '...', where: 'community' }],
}
```

## Changing the accent color

Edit the `--accent` token in `:root` and `:root[data-theme="light"]` in `src/styles/globals.css`. Everything pulls from the variable; nothing is hardcoded.

## Changing fonts

Edit `next/font/google` imports in `src/app/layout.tsx`. Must be self-hosted via next/font; never load from Google CDN with a <link> tag.

## Changing metadata (title/description/OG)

`src/app/layout.tsx` exports `metadata`. Edit strings there. `metadataBase` pulls from `BRAND.url`.

## Sitemap / robots

`src/app/sitemap.ts` and `src/app/robots.ts` — both read from `BRAND.url`. Edit there to add/remove URLs.

## What NOT to touch without engineering help

- `src/app/**/actions.ts` — server-side actions; auth is action-bound
- `src/lib/auth.ts`, `src/lib/db.ts`, `src/lib/account.ts`, `src/lib/cloudinary.ts`
- `src/middleware.ts` (if it exists yet)
- `prisma/schema.prisma` — schema changes must go through a migration; never edit the file without committing a migration
- `test/*` — the CI gate depends on these

## Honesty contract for copy edits

Every claim on a public page must be either (a) sourced from the DB live at request time, or (b) explicitly framed as "pilot phase", "coming soon", or "planned". No "10,000 players trust us" placeholders. No "Trusted by X". No testimonials. The audit check before any copy change: can a skeptical visitor verify this by looking at our DB or by emailing the grievance officer? If no, rewrite.
