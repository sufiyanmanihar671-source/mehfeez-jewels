# Mehfeez Jewels — B2B Wholesale Website

Wholesale catalogue and enquiry website for **Mehfeez Jewels**, artificial jewellery manufacturer & wholesaler (Mumbai).
B2B only — no cart, no checkout, no payment gateway. Wholesale prices are visible only to **approved** business customers.

| Layer | Technology |
| --- | --- |
| Frontend + server | SvelteKit 2 (Svelte 5), server-side rendered |
| Hosting | Cloudflare Pages (`@sveltejs/adapter-cloudflare`) |
| Database / Auth / Images | Supabase (PostgreSQL + RLS, Supabase Auth, Supabase Storage) |
| Source control / CI | GitHub + GitHub Actions (`.github/workflows/ci.yml`) |

## How wholesale price protection works
1. Prices are stored only in `public.product_prices` — never on the `products` table.
2. RLS on `product_prices`: `anon` has **no privileges at all**; logged-in users get rows only if `profiles.status = 'approved'` (or they are admin). Pending/rejected users get zero rows.
3. The server queries prices with the **visitor's own session**, so the database itself decides. There is no service-role key anywhere in this project.
4. Customers cannot approve themselves: a trigger blocks non-admins from changing `status`, `role`, `email` or `admin_note`.
5. Dynamic pages are sent `Cache-Control: private` / `no-store`, so Cloudflare's edge cache can never serve one visitor's page to another.
6. Verified by `tests/db.test.js` (real migrations in PGlite) and `tests/e2e-price.mjs` (full app: guest/pending HTML and JSON contain no prices; approved users see them).

## Project structure
```
supabase/migrations/   SQL schema, RLS policies, RPCs, seed categories, storage buckets
src/hooks.server.ts    Supabase session, admin/account guards, security + cache headers
src/lib/server/        catalogue queries, validation (zod), enquiry RPC, admin helpers
src/lib/components/    Header, Footer, PriceGate, ProductCard, FloatingActions (WhatsApp + video call)…
src/routes/            public pages, auth, /account (customer dashboard), /admin (admin panel)
tests/                 db.test.js (RLS), e2e-price.mjs + mock-supabase.mjs (end-to-end)
scripts/ship.mjs       validate → commit → push (no force)
```

---

## 1. Supabase setup (one time)
1. Create a project at https://supabase.com (region close to India, e.g. Mumbai `ap-south-1`).
2. **SQL Editor** → run, in order, the files in `supabase/migrations/`:
   `20261121000001_schema.sql`, `20261121000002_seed_categories.sql`, `20261121000003_storage.sql`.
   (Or with the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`.)
3. **Authentication → Sign In / Providers → Email**: enable *Confirm email*.
4. **Authentication → URL Configuration**: Site URL = your live domain (e.g. `https://www.mehfeezjewels.com`); add `http://localhost:5173/**` and `https://*.pages.dev/**` to Redirect URLs.
5. **Authentication → Email Templates** — use these links so verification works with server-side rendering:
   - *Confirm signup*: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/account`
   - *Reset password*: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
6. (Recommended for production) **Authentication → SMTP**: connect your own email sender; Supabase's built-in sender is heavily rate-limited.
7. **Project Settings → API**: copy the *Project URL* and the *anon / publishable* key. **Do not copy or use the service_role key.**

### Make yourself an admin
Register on the website, verify your email, then in **SQL Editor** run:
```sql
update public.profiles set role = 'admin', status = 'approved' where email = 'you@yourdomain.com';
```

## 2. Local development
```powershell
copy .env.example .env   # then fill in PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev              # http://localhost:5173
npm run validate         # type check + RLS tests + production build
```

## 3. GitHub
```powershell
git remote add origin https://github.com/<your-account>/mehfeez-jewels.git
git push -u origin main
```
GitHub Actions runs type checks, RLS tests and a build on every push.

## 4. Cloudflare Pages (automatic deployment from GitHub)
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → select the repository.
2. Production branch: `main` · Framework preset: *SvelteKit* · Build command: `npm run build` · Output directory: `.svelte-kit/cloudflare`.
3. **Settings → Variables and Secrets** (Production and Preview):
   - `PUBLIC_SUPABASE_URL` = your project URL
   - `PUBLIC_SUPABASE_ANON_KEY` = anon / publishable key
   - `PUBLIC_SITE_URL` = `https://www.yourdomain.com`
   - `NODE_VERSION` = `22`
4. **Settings → Runtime → Compatibility flags**: `nodejs_compat` (also declared in `wrangler.toml`).
5. **Custom domains**: add your domain; then update the Supabase Site URL to match.
6. Every push to `main` deploys to production; other branches get preview URLs. Roll back any time from **Deployments → ⋯ → Rollback to this deployment**.

## 5. Shipping changes
```powershell
node scripts/ship.mjs "feat: add new bridal collection banner"
```
Runs `npm run validate`, refuses to commit secret files, commits, and pushes to `origin` without force. Cloudflare deploys automatically; the build log and status are in the Cloudflare dashboard (Deployments) and in GitHub (commit checks).

## Admin panel (`/admin`)
Dashboard counts · customer approval (approve / reject / notes / edit / delete, filter by status & country) · products (create, edit, SEO, flags) · wholesale prices, MOQ and stock (inline table editing + per-variant prices) · multiple images per product (auto-compressed to WebP in the browser) · categories (add / edit / delete / reorder / image) · wholesale enquiries (status, notes, reply via WhatsApp or email) · settings (WhatsApp number & message, video-call request number & message, contact details, social links, logo, hero text & image).

## Spam protection & rate limiting
- Enquiries are inserted only through the `submit_enquiry` RPC: server-side validation plus limits per client (hashed IP), per email and globally.
- Hidden honeypot fields on registration and enquiry forms.
- Login, signup and password reset use Supabase Auth's built-in rate limits.
- Optional extra: enable Cloudflare **Bot Fight Mode** / a WAF rate-limit rule on `POST /*`.

## Images
Admin uploads are resized to max 1600px and converted to WebP in the browser before upload; pages use lazy loading, fixed dimensions and responsive `sizes`. If your Supabase plan includes Image Transformations, set `PUBLIC_SUPABASE_IMAGE_TRANSFORM=true` to serve width-specific images via `srcset`.
