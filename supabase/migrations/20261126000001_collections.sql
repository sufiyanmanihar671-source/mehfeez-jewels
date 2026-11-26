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
