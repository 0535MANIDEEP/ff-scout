# Final Circle: Editable content map

If you want to change copy without touching code structure, edit these files. Each entry: file path → what the user sees.

Product truth lives in `SPEC.md` and the free-entry notice lives in `src/lib/free-entry.ts`. Legal background is research, not legal advice. A qualified lawyer must review final copy before launch.

## Site-wide

- `src/lib/brand.ts`: Name, mark, tagline, description, email, founder, URL and trademark line. Every page imports `BRAND` from here.
- `src/lib/free-entry.ts`: The global disclosure line, the free-entry constants and the payment-report threshold. Change here, not in individual pages.
- `src/app/layout.tsx`: Footer copy, metadata and appearance control.

## Landing page (`/`)

- Hero headline, subhead, disclosure and open-match preview: `src/app/components/Hero.tsx`. The preview rows and the first two ticker numbers come from the database. The third ticker item is the fixed 18+ free-entry label.
- "The whole loop" three steps (post, join, roster): `src/app/page.tsx`, the `fig2-steps` block.
- "One board, both sides of the lobby" three cards: same file, the `grid-3` block.
- "What this replaces" table: same file, four rows.
- Free-entry disclosure section and `/safety` link: same file, the section rendering `GLOBAL_DISCLOSURE`.
- City waitlist: same file, the `<Waitlist />` section. Emails are stored, not sent.

## Auth screens

- Sign-up (`/sign-up`): `src/app/sign-up/page.tsx`. Records the 18+ confirmation.
- Log in (`/login`): `src/app/login/page.tsx`
- Sponsor sign-up (`/sponsor/sign-up`): `src/app/sponsor/sign-up/page.tsx`

## Match and sponsor routes

- Board (`/matches`) and detail (`/matches/[id]`): `src/app/matches/page.tsx` and `src/app/matches/[id]/page.tsx`. The detail page carries the report form.
- Post (`/post`) and weekly series (`/post/series`): `src/app/post/page.tsx` and `src/app/post/series/page.tsx`. Both write free-entry terms from `src/lib/free-entry.ts`.
- Hosted matches and series (`/player/posted`): `src/app/player/posted/page.tsx`.
- Sponsor directory (`/sponsors`) and CSV export (`/sponsors/export`): `src/app/sponsors/page.tsx` and `src/app/sponsors/export/route.ts`. Only opted-in players appear.

## Public info pages

- About (`/about`): `src/app/about/page.tsx`
- FAQ (`/faq`): `src/app/faq/page.tsx`, array of `{ q, a }`
- Terms (`/terms`): `src/app/terms/page.tsx`
- Privacy (`/privacy`): `src/app/privacy/page.tsx`
- Safety and legal (`/safety`): `src/app/safety/page.tsx`. Full free-entry, reporting and grievance notice.
- Advertise (`/advertise`): `src/app/advertise/page.tsx`. Sponsor placement and funded free event notice.
- Loadout (`/loadout`): `src/app/loadout/page.tsx` and `src/lib/aff.ts`. Affiliate links are disclosed here.
- Learn (`/learn`): `src/lib/learn.ts` array of chapters

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

Defaults live in `:root` and `:root[data-theme="light"]` in `src/styles/globals.css`. `src/lib/appearance.ts` applies the per-browser preset or custom accent and stores it in `fc-appearance`. Change the defaults in CSS, not in the browser override.

## Changing fonts

Edit `next/font/google` imports in `src/app/layout.tsx`. Must be self-hosted via next/font; never load from Google CDN with a <link> tag.

## Changing metadata (title/description/OG)

`src/app/layout.tsx` exports `metadata`. Each route also exports its own metadata. `metadataBase` pulls from `BRAND.url`.

## Sitemap / robots

`src/app/sitemap.ts` and `src/app/robots.ts`: both read from `BRAND.url`. Edit there to add or remove URLs.

## What NOT to touch without engineering help

- `src/app/**/actions.ts`: server-side actions; auth is action-bound
- `src/shared/auth/session.ts`, `src/shared/db/client.ts`, `src/features/identity/account.ts`, `src/features/disclosure/copy.ts`, `src/shared/auth/permissions.ts`
- `prisma/schema.prisma`: schema changes must go through a migration; never edit the file without committing a migration
- `test/*`: the CI gate depends on these

## Honesty contract for copy edits

Every public claim must be either sourced from the database at request time or framed honestly as a plan. No invented counts, testimonials or trusted-by lines. No copy that asks a player for money or advertises a prize. The disclosure line must match `src/lib/free-entry.ts` on every route. Any legal claim stays background only until a qualified lawyer reviews the final product and copy.
