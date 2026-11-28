-- MEHFEEZ JEWELS: complete database setup (all migrations in order).
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run.

-- ===== supabase/migrations/20261121000001_schema.sql =====
-- =====================================================================
-- MEHFEEZ JEWELS - core schema, security helpers and Row Level Security
-- Wholesale prices are stored in a separate table (product_prices) whose
-- RLS policy only returns rows to APPROVED customers and admins.
-- =====================================================================

-- gen_random_uuid() is built into PostgreSQL 13+ (no extension needed).

-- ---------- Enums ----------------------------------------------------
do $$ begin
  create type public.customer_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.stock_status as enum ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.enquiry_status as enum ('new', 'in_progress', 'responded', 'closed');
exception when duplicate_object then null; end $$;

-- ---------- Profiles (wholesale customers + admins) -----------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  company_name text not null default '',
  whatsapp text not null default '',
  country text not null default '',
  city text not null default '',
  address text not null default '',
  business_type text not null default '',
  gst_number text,
  website text,
  additional_info text,
  status public.customer_status not null default 'pending',
  role public.user_role not null default 'customer',
  admin_note text,
  status_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_country_idx on public.profiles (country);

-- ---------- Security helper functions -------------------------------
-- SECURITY DEFINER so they can read profiles without recursive RLS.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_approved_customer()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (status = 'approved' or role = 'admin')
  );
$$;

-- ---------- Categories ----------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Products ------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sku text not null unique check (char_length(sku) between 1 and 64),
  description text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  moq int not null default 1 check (moq >= 1),
  stock_status public.stock_status not null default 'in_stock',
  stock_quantity int check (stock_quantity is null or stock_quantity >= 0),
  is_published boolean not null default true,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_bestseller boolean not null default false,
  meta_title text,
  meta_description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_flags_idx on public.products (is_published, is_featured, is_new_arrival, is_bestseller);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  storage_path text,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  sku text unique,
  stock_status public.stock_status not null default 'in_stock',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants (product_id);

-- ---------- Wholesale prices (PROTECTED) ----------------------------
-- variant_id NULL = base wholesale price of the product.
create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete cascade,
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  price_note text,
  updated_at timestamptz not null default now(),
  constraint product_prices_unique unique nulls not distinct (product_id, variant_id)
);
create index if not exists product_prices_product_idx on public.product_prices (product_id);

-- ---------- Wholesale enquiries -------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  business_name text not null,
  email text not null,
  whatsapp text not null,
  country text not null,
  categories text[] not null default '{}',
  estimated_quantity text,
  message text not null,
  product_id uuid references public.products (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  status public.enquiry_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists enquiries_status_idx on public.enquiries (status, created_at desc);

-- ---------- Site settings (single row, editable by admin) -----------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text not null default '919321245814',
  whatsapp_message text not null default 'Hello Mehfeez Jewels, I am interested in your wholesale jewellery collections. Please share details.',
  video_call_number text not null default '919321245814',
  video_call_message text not null default 'Hello Mehfeez Jewels, I would like to schedule a video call to discuss your jewellery collections, wholesale pricing and bulk order requirements.',
  video_call_enabled boolean not null default true,
  contact_phone text not null default '+91 93212 45814',
  contact_email text,
  address text not null default 'Room No. 4, Malad West, Chincholi Bunder Road, Opposite Vivanta Hospital, Mumbai – 400064, Maharashtra, India.',
  business_hours text,
  instagram_url text,
  facebook_url text,
  logo_url text,
  hero_title text not null default 'Artificial Jewellery, Crafted for Wholesale',
  hero_subtitle text not null default 'Manufacturer and wholesale supplier of American Diamond, Victorian, Heritage, South Indian and Bridal jewellery for retailers and distributors worldwide.',
  hero_image_url text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ---------- Rate limiting (spam protection) -------------------------
create table if not exists public.rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (bucket, window_start)
);

-- =====================================================================
-- Triggers
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','categories','products','product_prices','enquiries','site_settings'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- Create a pending profile whenever someone signs up (data from signUp metadata).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id, email, full_name, company_name, whatsapp, country, city, address,
    business_type, gst_number, website, additional_info
  ) values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(m->>'full_name', ''), 120),
    left(coalesce(m->>'company_name', ''), 160),
    left(coalesce(m->>'whatsapp', ''), 32),
    left(coalesce(m->>'country', ''), 80),
    left(coalesce(m->>'city', ''), 80),
    left(coalesce(m->>'address', ''), 400),
    left(coalesce(m->>'business_type', ''), 80),
    nullif(left(coalesce(m->>'gst_number', ''), 20), ''),
    nullif(left(coalesce(m->>'website', ''), 200), ''),
    nullif(left(coalesce(m->>'additional_info', ''), 2000), '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customers may edit their business details but NEVER their status, role,
-- email or admin note. Only admins can change those columns.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for trusted server contexts (SQL editor / service role),
  -- which are used to bootstrap the first admin. Logged-in non-admins are blocked.
  if auth.uid() is not null and not public.is_admin() then
    if new.status is distinct from old.status
       or new.role is distinct from old.role
       or new.admin_note is distinct from old.admin_note
       or new.email is distinct from old.email
       or new.status_changed_at is distinct from old.status_changed_at
       or new.id is distinct from old.id then
      raise exception 'Not allowed to change protected profile fields' using errcode = '42501';
    end if;
  end if;
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_prices enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.rate_limits enable row level security;

-- Profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete to authenticated
  using (public.is_admin());

-- Categories (public catalogue)
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories for select to anon, authenticated
  using (is_active or public.is_admin());
drop policy if exists categories_admin on public.categories;
create policy categories_admin on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Products (public catalogue, no prices here)
drop policy if exists products_select on public.products;
create policy products_select on public.products for select to anon, authenticated
  using (is_published or public.is_admin());
drop policy if exists products_admin on public.products;
create policy products_admin on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_images_select on public.product_images;
create policy product_images_select on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_published or public.is_admin())));
drop policy if exists product_images_admin on public.product_images;
create policy product_images_admin on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_variants_select on public.product_variants;
create policy product_variants_select on public.product_variants for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_published or public.is_admin())));
drop policy if exists product_variants_admin on public.product_variants;
create policy product_variants_admin on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- WHOLESALE PRICES: approved customers and admins only. Guests get nothing.
revoke all on public.product_prices from anon;
drop policy if exists product_prices_select on public.product_prices;
create policy product_prices_select on public.product_prices for select to authenticated
  using (
    public.is_admin()
    or (
      public.is_approved_customer()
      and exists (select 1 from public.products p where p.id = product_id and p.is_published)
    )
  );
drop policy if exists product_prices_admin on public.product_prices;
create policy product_prices_admin on public.product_prices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Enquiries: created only through submit_enquiry() (validated + rate limited).
-- Customers can read their own; admins manage all.
revoke insert on public.enquiries from anon, authenticated;
drop policy if exists enquiries_select on public.enquiries;
create policy enquiries_select on public.enquiries for select to authenticated
  using (public.is_admin() or user_id = auth.uid());
drop policy if exists enquiries_admin_update on public.enquiries;
create policy enquiries_admin_update on public.enquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists enquiries_admin_delete on public.enquiries;
create policy enquiries_admin_delete on public.enquiries for delete to authenticated
  using (public.is_admin());

-- Site settings: everyone reads, admins edit.
drop policy if exists site_settings_select on public.site_settings;
create policy site_settings_select on public.site_settings for select to anon, authenticated
  using (true);
drop policy if exists site_settings_admin on public.site_settings;
create policy site_settings_admin on public.site_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Rate limits: no direct access at all (only via security definer function).
revoke all on public.rate_limits from anon, authenticated;

-- =====================================================================
-- RPC: rate limiting + enquiry submission
-- =====================================================================
create or replace function public.hit_rate_limit(p_bucket text, p_limit int, p_window interval)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / extract(epoch from p_window)) * extract(epoch from p_window));
  n int;
begin
  insert into public.rate_limits (bucket, window_start, hits) values (p_bucket, w, 1)
  on conflict (bucket, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into n;
  delete from public.rate_limits where window_start < now() - interval '2 days';
  return n <= p_limit;
end $$;
revoke all on function public.hit_rate_limit(text, int, interval) from public, anon, authenticated;

create or replace function public.submit_enquiry(payload jsonb, client_key text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_name text := btrim(coalesce(payload->>'full_name', ''));
  v_business text := btrim(coalesce(payload->>'business_name', ''));
  v_email text := lower(btrim(coalesce(payload->>'email', '')));
  v_whatsapp text := btrim(coalesce(payload->>'whatsapp', ''));
  v_country text := btrim(coalesce(payload->>'country', ''));
  v_qty text := nullif(btrim(coalesce(payload->>'estimated_quantity', '')), '');
  v_message text := btrim(coalesce(payload->>'message', ''));
  v_product uuid;
  v_categories text[];
  v_id uuid;
begin
  if char_length(v_name) not between 2 and 120 then raise exception 'invalid_full_name' using errcode = '22023'; end if;
  if char_length(v_business) not between 2 and 160 then raise exception 'invalid_business_name' using errcode = '22023'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 200 then raise exception 'invalid_email' using errcode = '22023'; end if;
  if v_whatsapp !~ '^\+?[0-9 ()-]{7,20}$' then raise exception 'invalid_whatsapp' using errcode = '22023'; end if;
  if char_length(v_country) not between 2 and 80 then raise exception 'invalid_country' using errcode = '22023'; end if;
  if char_length(v_message) not between 5 and 3000 then raise exception 'invalid_message' using errcode = '22023'; end if;
  if v_qty is not null and char_length(v_qty) > 80 then raise exception 'invalid_quantity' using errcode = '22023'; end if;

  select coalesce(array_agg(left(btrim(x), 80)), '{}') into v_categories
  from (select jsonb_array_elements_text(coalesce(payload->'categories', '[]'::jsonb)) x limit 20) s
  where btrim(x) <> '';

  if payload ? 'product_id' and nullif(payload->>'product_id', '') is not null then
    select id into v_product from public.products
    where id::text = payload->>'product_id' and is_published;
  end if;

  -- Spam protection: per client, per email and global limits.
  if client_key is not null and not public.hit_rate_limit('enq:client:' || left(client_key, 128), 5, interval '1 hour') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if not public.hit_rate_limit('enq:email:' || v_email, 5, interval '1 hour') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if not public.hit_rate_limit('enq:global', 300, interval '1 hour') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.enquiries (full_name, business_name, email, whatsapp, country, categories, estimated_quantity, message, product_id, user_id)
  values (v_name, v_business, v_email, v_whatsapp, v_country, v_categories, v_qty, v_message, v_product, auth.uid())
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.submit_enquiry(jsonb, text) from public;
grant execute on function public.submit_enquiry(jsonb, text) to anon, authenticated;

-- Admin dashboard counts (admins only).
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return jsonb_build_object(
    'customers_total', (select count(*) from public.profiles where role = 'customer'),
    'customers_approved', (select count(*) from public.profiles where role = 'customer' and status = 'approved'),
    'customers_pending', (select count(*) from public.profiles where role = 'customer' and status = 'pending'),
    'customers_rejected', (select count(*) from public.profiles where role = 'customer' and status = 'rejected'),
    'products_total', (select count(*) from public.products),
    'products_published', (select count(*) from public.products where is_published),
    'categories_total', (select count(*) from public.categories),
    'enquiries_new', (select count(*) from public.enquiries where status = 'new'),
    'enquiries_total', (select count(*) from public.enquiries)
  );
end $$;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.is_approved_customer() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_approved_customer() to anon, authenticated;

-- ===== supabase/migrations/20261121000002_seed_categories.sql =====
-- Default jewellery categories (admin can edit, reorder or delete these).
insert into public.categories (name, slug, description, sort_order) values
  ('American Diamond Jewellery', 'american-diamond-jewellery', 'Sparkling American Diamond (CZ) necklace sets, earrings and bangles for every occasion.', 1),
  ('Victorian Jewellery', 'victorian-jewellery', 'Ornate Victorian-style designs with rich finishes and intricate detailing.', 2),
  ('Heritage Jewellery', 'heritage-jewellery', 'Timeless heritage designs inspired by traditional Indian craftsmanship.', 3),
  ('South Indian Jewellery', 'south-indian-jewellery', 'Temple-inspired and classic South Indian designs.', 4),
  ('Bridal Jewellery', 'bridal-jewellery', 'Complete bridal sets crafted for weddings and celebrations.', 5),
  ('Necklace Sets', 'necklace-sets', 'Necklace sets with matching earrings in a wide range of styles.', 6),
  ('Earrings', 'earrings', 'Studs, jhumkas, drops and statement earrings.', 7),
  ('Bangles', 'bangles', 'Bangles and kadas in single pieces and sets.', 8),
  ('Latest Designs', 'latest-designs', 'Our newest designs, added regularly.', 9)
on conflict (slug) do nothing;

-- ===== supabase/migrations/20261121000003_storage.sql =====
-- Supabase Storage: public-read image buckets, admin-only writes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('site-assets', 'site-assets', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'])
on conflict (id) do nothing;

drop policy if exists "Public read jewellery images" on storage.objects;
create policy "Public read jewellery images" on storage.objects for select to anon, authenticated
  using (bucket_id in ('product-images', 'site-assets'));

drop policy if exists "Admins upload jewellery images" on storage.objects;
create policy "Admins upload jewellery images" on storage.objects for insert to authenticated
  with check (bucket_id in ('product-images', 'site-assets') and public.is_admin());

drop policy if exists "Admins update jewellery images" on storage.objects;
create policy "Admins update jewellery images" on storage.objects for update to authenticated
  using (bucket_id in ('product-images', 'site-assets') and public.is_admin());

drop policy if exists "Admins delete jewellery images" on storage.objects;
create policy "Admins delete jewellery images" on storage.objects for delete to authenticated
  using (bucket_id in ('product-images', 'site-assets') and public.is_admin());

-- ===== supabase/migrations/20261124000001_redesign.sql =====
-- =====================================================================
-- Redesign support: category groups (product type vs jewellery style),
-- new categories, and admin-managed homepage hero slides.
-- =====================================================================

-- Category groups: 'type' = Necklace Sets, Earrings ... ; 'style' = American Diamond, Victorian ...
alter table public.categories add column if not exists category_group text not null default 'type';
do $$ begin
  alter table public.categories add constraint categories_group_check check (category_group in ('type', 'style'));
exception when duplicate_object then null; end $$;

update public.categories set category_group = 'style'
where slug in ('american-diamond-jewellery', 'victorian-jewellery', 'heritage-jewellery', 'south-indian-jewellery');

insert into public.categories (name, slug, description, sort_order, category_group) values
  ('Pendant Sets', 'pendant-sets', 'Pendant sets with matching earrings.', 10, 'type'),
  ('Complete Jewellery Sets', 'complete-jewellery-sets', 'Complete coordinated jewellery sets.', 11, 'type'),
  ('Traditional Jewellery', 'traditional-jewellery', 'Classic traditional designs.', 12, 'style'),
  ('Contemporary Jewellery', 'contemporary-jewellery', 'Modern, lightweight contemporary designs.', 13, 'style')
on conflict (slug) do update set category_group = excluded.category_group;

-- Homepage hero slider (images uploaded by admin).
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text,
  mobile_image_url text,
  mobile_storage_path text,
  eyebrow text,
  title text not null check (char_length(title) between 1 and 140),
  subtitle text,
  cta_label text,
  cta_href text check (cta_href is null or cta_href ~ '^(/|https://)'),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists hero_slides_touch on public.hero_slides;
create trigger hero_slides_touch before update on public.hero_slides
  for each row execute function public.touch_updated_at();

alter table public.hero_slides enable row level security;

drop policy if exists hero_slides_select on public.hero_slides;
create policy hero_slides_select on public.hero_slides for select to anon, authenticated
  using (is_active or public.is_admin());
drop policy if exists hero_slides_admin on public.hero_slides;
create policy hero_slides_admin on public.hero_slides for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===== supabase/migrations/20261126000001_collections.sql =====
-- =====================================================================
-- Homepage brief (26 Nov 2026): Choker Sets category and product
-- "collections" tags used by Shop by Collection / product tabs.
-- =====================================================================

insert into public.categories (name, slug, description, sort_order, category_group) values
  ('Choker Sets', 'choker-sets', 'Choker necklace sets with matching earrings.', 7, 'type')
on conflict (slug) do nothing;

-- Collection tags an admin can tick per product.
alter table public.products add column if not exists collections text[] not null default '{}';
do $$ begin
  alter table public.products add constraint products_collections_check
    check (collections <@ array['trending', 'premium', 'exclusive', 'traditional']::text[]);
exception when duplicate_object then null; end $$;
create index if not exists products_collections_idx on public.products using gin (collections);

-- ===== supabase/migrations/20261127000001_product_details.sql =====
-- =====================================================================
-- Product detail fields for the premium product page (27 Nov 2026).
-- All optional; shown on the product page only when filled in.
-- =====================================================================

alter table public.products
  add column if not exists colors text[] not null default '{}',
  add column if not exists sizes text[] not null default '{}',
  add column if not exists material text,
  add column if not exists finish text,
  add column if not exists stone text,
  add column if not exists weight text,
  add column if not exists set_includes text,
  add column if not exists dimensions text,
  add column if not exists video_url text;

do $$ begin
  alter table public.products add constraint products_video_url_check
    check (video_url is null or video_url ~ '^https://');
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.products add constraint products_detail_lengths_check
    check (
      coalesce(char_length(material), 0) <= 120 and coalesce(char_length(finish), 0) <= 120
      and coalesce(char_length(stone), 0) <= 120 and coalesce(char_length(weight), 0) <= 60
      and coalesce(char_length(set_includes), 0) <= 300 and coalesce(char_length(dimensions), 0) <= 160
      and coalesce(array_length(colors, 1), 0) <= 20 and coalesce(array_length(sizes, 1), 0) <= 20
    );
exception when duplicate_object then null; end $$;

-- ===== supabase/migrations/20261128000001_color_stock.sql =====
-- =====================================================================
-- Stock per colour (28 Nov 2026).
-- color_stock = [{ "name": "Ruby", "status": "in_stock", "qty": 40 }, ...]
-- status uses the same values as products.stock_status; qty may be null.
-- products.colors keeps the plain list of colour names (unchanged).
-- =====================================================================

alter table public.products
  add column if not exists color_stock jsonb not null default '[]'::jsonb;

do $$ begin
  alter table public.products add constraint products_color_stock_check
    check (jsonb_typeof(color_stock) = 'array' and jsonb_array_length(color_stock) <= 20);
exception when duplicate_object then null; end $$;
