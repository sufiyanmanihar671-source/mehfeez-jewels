-- Removes the sample products added by sample-products.sql
-- (their variations and test prices are removed automatically).
-- Supabase > SQL Editor > New query > paste > Run.
delete from public.products where sku like 'SAMPLE-%';
