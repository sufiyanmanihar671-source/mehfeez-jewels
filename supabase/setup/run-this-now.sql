-- MEHFEEZ JEWELS: run ONCE in Supabase > SQL Editor > New query > Run. Safe to re-run.
-- Includes the 24, 26 and 27 Nov updates (categories, collections, homepage slides, product details).

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
