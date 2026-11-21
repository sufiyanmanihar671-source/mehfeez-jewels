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
