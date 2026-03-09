-- Run this in the Supabase SQL editor.
-- Assumes table "Note" already exists with UUID id + UUID author_id.

create extension if not exists pgcrypto;

create table if not exists public."Image" (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public."Note"(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists image_note_id_idx on public."Image"(note_id);

alter table public."Image" enable row level security;

drop policy if exists "Read own note images" on public."Image";
create policy "Read own note images"
on public."Image"
for select
to authenticated
using (
  exists (
    select 1
    from public."Note" n
    where n.id = "Image".note_id
      and n.author_id = auth.uid()
  )
);

drop policy if exists "Insert own note images" on public."Image";
create policy "Insert own note images"
on public."Image"
for insert
to authenticated
with check (
  exists (
    select 1
    from public."Note" n
    where n.id = "Image".note_id
      and n.author_id = auth.uid()
  )
);

drop policy if exists "Delete own note images" on public."Image";
create policy "Delete own note images"
on public."Image"
for delete
to authenticated
using (
  exists (
    select 1
    from public."Note" n
    where n.id = "Image".note_id
      and n.author_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('note-images', 'note-images', true)
on conflict (id) do nothing;

drop policy if exists "Upload own note images" on storage.objects;
create policy "Upload own note images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'note-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Update own note images" on storage.objects;
create policy "Update own note images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'note-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'note-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Delete own note images" on storage.objects;
create policy "Delete own note images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'note-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
