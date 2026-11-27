-- =====================================================================
-- MEHFEEZ JEWELS — SAMPLE PRODUCTS (for testing the site on your phone)
--
-- Run AFTER supabase/setup/run-this-now.sql.
-- Supabase > SQL Editor > New query > paste this whole file > Run.
--
-- * 6 sample designs, names start with "Sample –", SKUs start with "SAMPLE-".
-- * Prices are TEST prices (note "Sample price") — only approved
--   customers and admins can see them, exactly like real prices.
-- * Illustrated sample images (labelled "SAMPLE IMAGE") served from the
--   website itself (static/samples/). Replace with real photos in Admin.
-- * To remove all samples later, run supabase/setup/remove-sample-products.sql
--   (or delete them one by one in Admin > Products).
-- Safe to run more than once.
-- =====================================================================

insert into public.products
  (name, slug, sku, description, category_id, moq, stock_status, stock_quantity,
   is_published, is_featured, is_new_arrival, is_bestseller, sort_order,
   collections, colors, sizes, material, finish, stone, set_includes)
select v.name, v.slug, v.sku, v.description,
       (select id from public.categories where slug = v.cat),
       v.moq, v.stock::public.stock_status, v.qty,
       true, v.featured, true, v.best, v.sort,
       v.collections, v.colors, v.sizes, v.material, v.finish, v.stone, v.set_includes
from (values
  ('Sample – Kundan Bridal Necklace Set', 'sample-kundan-bridal-necklace-set', 'SAMPLE-BR-001',
   'Sample product for testing. Heavy bridal necklace with matching earrings and maang tikka.',
   'bridal-jewellery', 6, 'in_stock', 120, true, true, 1,
   '{trending,premium}'::text[], '{Ruby,Emerald,Pink,Multi}'::text[], '{}'::text[],
   'Brass', 'Gold plated', 'Kundan, pearls', 'Necklace, 2 earrings, maang tikka'),
  ('Sample – American Diamond Choker', 'sample-american-diamond-choker', 'SAMPLE-AD-002',
   'Sample product for testing. Sparkling AD choker set with matching earrings.',
   'american-diamond-jewellery', 6, 'in_stock', 80, true, false, 2,
   '{trending}'::text[], '{White,Ruby,Emerald}'::text[], '{}'::text[],
   'Copper alloy', 'Rhodium plated', 'American diamond (CZ)', 'Choker, 2 earrings'),
  ('Sample – Temple Jhumka Earrings', 'sample-temple-jhumka-earrings', 'SAMPLE-ER-003',
   'Sample product for testing. South Indian temple-style jhumkas.',
   'earrings', 12, 'low_stock', 30, false, true, 3,
   '{traditional}'::text[], '{Gold,Antique gold}'::text[], '{Small,Medium,Large}'::text[],
   'Brass', 'Matte gold finish', 'Pearl drops', 'Pair of earrings'),
  ('Sample – Victorian Bangles Set', 'sample-victorian-bangles-set', 'SAMPLE-BG-004',
   'Sample product for testing. Set of 4 Victorian-finish bangles.',
   'bangles', 12, 'in_stock', 60, false, false, 4,
   '{exclusive}'::text[], '{Green,Maroon,White}'::text[], '{2.4,2.6,2.8}'::text[],
   'Brass', 'Victorian finish', 'CZ stones', '4 bangles'),
  ('Sample – Pearl Pendant Set', 'sample-pearl-pendant-set', 'SAMPLE-PS-005',
   'Sample product for testing. Light-weight pendant set for daily and party wear.',
   'pendant-sets', 6, 'made_to_order', null, true, false, 5,
   '{premium}'::text[], '{White,Pink}'::text[], '{}'::text[],
   'Alloy', 'Gold plated', 'Pearls', 'Pendant with chain, 2 earrings'),
  ('Sample – Heritage Long Haar', 'sample-heritage-long-haar', 'SAMPLE-HR-006',
   'Sample product for testing. Long heritage haar with matching earrings.',
   'heritage-jewellery', 4, 'in_stock', 25, false, true, 6,
   '{traditional,premium}'::text[], '{Antique gold,Ruby}'::text[], '{}'::text[],
   'Brass', 'Antique gold finish', 'Kemp stones', 'Long haar, 2 earrings')
) as v(name, slug, sku, description, cat, moq, stock, qty, featured, best, sort,
       collections, colors, sizes, material, finish, stone, set_includes)
on conflict (slug) do nothing;

-- Illustrated sample images (served by the website from /samples/).
insert into public.product_images (product_id, url, alt, sort_order)
select p.id, v.url, v.alt, v.ord
from (values
  ('sample-kundan-bridal-necklace-set', '/samples/kundan-bridal-set.webp', 'Sample image – kundan bridal necklace set', 0),
  ('sample-kundan-bridal-necklace-set', '/samples/kundan-bridal-earrings.webp', 'Sample image – matching kundan jhumkas', 1),
  ('sample-american-diamond-choker', '/samples/ad-choker.webp', 'Sample image – American diamond choker', 0),
  ('sample-temple-jhumka-earrings', '/samples/temple-jhumka.webp', 'Sample image – temple jhumka earrings', 0),
  ('sample-victorian-bangles-set', '/samples/victorian-bangles.webp', 'Sample image – Victorian bangles set', 0),
  ('sample-pearl-pendant-set', '/samples/pearl-pendant-set.webp', 'Sample image – pearl pendant set', 0),
  ('sample-heritage-long-haar', '/samples/heritage-long-haar.webp', 'Sample image – heritage long haar', 0)
) as v(slug, url, alt, ord)
join public.products p on p.slug = v.slug
where not exists (select 1 from public.product_images i where i.product_id = p.id and i.url = v.url);

-- One sample variation (with its own test price) on the bridal set.
insert into public.product_variants (product_id, name, sku, stock_status, sort_order)
select id, 'With nath (nose ring)', 'SAMPLE-BR-001-N', 'in_stock', 1
from public.products where slug = 'sample-kundan-bridal-necklace-set'
on conflict (sku) do nothing;

-- Test wholesale prices (INR). Visible only to approved customers + admins.
insert into public.product_prices (product_id, variant_id, price, currency, price_note)
select p.id, null, v.price, 'INR', 'Sample price'
from (values
  ('sample-kundan-bridal-necklace-set', 2450), ('sample-american-diamond-choker', 1350),
  ('sample-temple-jhumka-earrings', 320), ('sample-victorian-bangles-set', 890),
  ('sample-pearl-pendant-set', 540), ('sample-heritage-long-haar', 1980)
) as v(slug, price)
join public.products p on p.slug = v.slug
on conflict on constraint product_prices_unique do nothing;

insert into public.product_prices (product_id, variant_id, price, currency, price_note)
select pv.product_id, pv.id, 2690, 'INR', 'Sample price'
from public.product_variants pv where pv.sku = 'SAMPLE-BR-001-N'
on conflict on constraint product_prices_unique do nothing;

select name, sku from public.products where sku like 'SAMPLE-%' order by sort_order;
