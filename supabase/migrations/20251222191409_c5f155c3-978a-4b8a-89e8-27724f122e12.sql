-- Create a public bucket for global brand assets (e.g., email logo)
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

-- Public read access (since emails need to load images without auth)
drop policy if exists "Public can read brand assets" on storage.objects;
create policy "Public can read brand assets"
on storage.objects
for select
using (bucket_id = 'brand-assets');

-- Anyone authenticated can upload (simplified for admin use)
drop policy if exists "Authenticated users can upload brand assets" on storage.objects;
create policy "Authenticated users can upload brand assets"
on storage.objects
for insert
with check (
  bucket_id = 'brand-assets'
  and auth.role() = 'authenticated'
);

drop policy if exists "Authenticated users can update brand assets" on storage.objects;
create policy "Authenticated users can update brand assets"
on storage.objects
for update
using (
  bucket_id = 'brand-assets'
  and auth.role() = 'authenticated'
);

drop policy if exists "Authenticated users can delete brand assets" on storage.objects;
create policy "Authenticated users can delete brand assets"
on storage.objects
for delete
using (
  bucket_id = 'brand-assets'
  and auth.role() = 'authenticated'
);