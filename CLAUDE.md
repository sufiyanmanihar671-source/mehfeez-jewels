# Mehfeez Jewels — project rules for Claude Code

B2B wholesale catalogue for an artificial jewellery manufacturer. SvelteKit 2 (Svelte 5 runes) on Cloudflare Pages, Supabase (Postgres + Auth + Storage).

## Non-negotiables
- Palette (Nov 2026 brand update): Deep Burgundy #650D26 (primary), Dark Burgundy #480819, Burgundy Accent #8B1938, Warm Ivory #FFF9F3, Soft Cream #F8F1E9, text #302323 / #756666, white. Mostly light surfaces; burgundy for buttons, icons, links and a few selected sections only. Never blue, never a gold/golden theme.
- Logo: use the official files in `static/brand/` (lettering unchanged) with "JEWELS" set beneath — never redraw or generate a different logo.
- Homepage structure follows the reference ganeshbridal.com layout (hero slider, trust strip, video-call band, arched collections, featured designs, category scroller, styles, B2B band, why-us, showcase, story, CTA) with original Mehfeez content — never copy the reference's text, photos or branding.
- No payment gateway, cart, checkout, COD, coupons or retail discounts. Orders are discussed on WhatsApp.
- Wholesale prices live only in `product_prices`, protected by RLS (approved customers + admins). Always query prices with the visitor's own Supabase session (`locals.supabase`). Never add a service-role key, never fetch prices with elevated privileges, never put prices in JSON-LD, meta tags or public endpoints.
- Dynamic pages must never be shared-cacheable (see `src/hooks.server.ts`); the Cloudflare edge cache keys only on URL.
- Every admin load AND action calls `requireAdmin(locals)`.
- Do not invent certifications, awards or business claims in copy. Do not create an alternative logo; the official logo is uploaded in Admin > Settings.

## Workflow after a completed task
1. `npm run validate` (svelte-check + RLS tests + production build) must pass.
2. For changes to pricing, auth or caching, also run the end-to-end check: start the `mock-supabase` and `site` launch configs, then `node tests/e2e-price.mjs`.
3. Ship with `node scripts/ship.mjs "<type>: <meaningful message>"` — it re-validates, refuses secret files, commits and pushes to `main` without force. Cloudflare Pages deploys the pushed commit.
4. Never force-push, never commit `.env`/`.dev.vars`, never overwrite unrelated work.
- Database changes go in a new file in `supabase/migrations/` (never edit an applied migration) plus tests in `tests/db.test.js`.
