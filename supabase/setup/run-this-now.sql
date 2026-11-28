-- MEHFEEZ JEWELS: run ONCE in Supabase > SQL Editor > New query > Run. Safe to re-run.
-- 28 Nov 2026 update: stock per colour (products.color_stock).

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
