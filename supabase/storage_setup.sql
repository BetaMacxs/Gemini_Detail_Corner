-- Supabase Storage Buckets & Policies Setup for DetailCorner

-- 1. Ensure storage buckets exist and are marked public
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('gallery', 'gallery', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/quicktime', 'video/webm']),
  ('products', 'products', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Policies for 'gallery'
drop policy if exists "Gallery items are publicly accessible" on storage.objects;
create policy "Gallery items are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'gallery');

drop policy if exists "Authenticated and authorized users can upload gallery items" on storage.objects;
create policy "Authenticated and authorized users can upload gallery items"
  on storage.objects for insert
  with check (bucket_id = 'gallery');

drop policy if exists "Authenticated and authorized users can update gallery items" on storage.objects;
create policy "Authenticated and authorized users can update gallery items"
  on storage.objects for update
  using (bucket_id = 'gallery');

drop policy if exists "Authenticated and authorized users can delete gallery items" on storage.objects;
create policy "Authenticated and authorized users can delete gallery items"
  on storage.objects for delete
  using (bucket_id = 'gallery');

-- 3. Storage Policies for 'products'
drop policy if exists "Product images are publicly accessible" on storage.objects;
create policy "Product images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "Authenticated and authorized users can upload product images" on storage.objects;
create policy "Authenticated and authorized users can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'products');

drop policy if exists "Authenticated and authorized users can update product images" on storage.objects;
create policy "Authenticated and authorized users can update product images"
  on storage.objects for update
  using (bucket_id = 'products');

drop policy if exists "Authenticated and authorized users can delete product images" on storage.objects;
create policy "Authenticated and authorized users can delete product images"
  on storage.objects for delete
  using (bucket_id = 'products');
