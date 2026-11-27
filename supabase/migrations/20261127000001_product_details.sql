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
