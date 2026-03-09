-- =============================================
-- Digital Business Card: cards table + RLS + storage
-- Run this in Supabase SQL Editor or via CLI
-- =============================================

-- Cards table
create table if not exists public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  slug         text unique not null,
  first_name   text not null,
  last_name    text not null,
  title        text,
  organization text default 'Deutsches Rotes Kreuz',
  email        text,
  phone        text,
  mobile       text,
  street       text,
  city         text,
  zip          text,
  country      text default 'Deutschland',
  website      text,
  linkedin     text,
  xing         text,
  photo_path   text,
  is_published boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Indexes for fast lookups
create unique index if not exists cards_slug_idx on public.cards(slug);
create index if not exists cards_user_id_idx on public.cards(user_id);

-- Enable Row Level Security
alter table public.cards enable row level security;

-- RLS: anyone can read published cards (public card page, no auth needed)
create policy "Published cards are viewable by everyone"
  on public.cards for select
  using (is_published = true);

-- RLS: authenticated users can read all their own cards (including drafts)
create policy "Users can read own cards"
  on public.cards for select
  using (auth.uid() = user_id);

-- RLS: authenticated users can create their own cards
create policy "Users can create own cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

-- RLS: authenticated users can update their own cards
create policy "Users can update own cards"
  on public.cards for update
  using (auth.uid() = user_id);

-- RLS: authenticated users can delete their own cards
create policy "Users can delete own cards"
  on public.cards for delete
  using (auth.uid() = user_id);

-- Auto-update the updated_at timestamp on every update
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cards_updated_at
  before update on public.cards
  for each row execute function public.handle_updated_at();

-- =============================================
-- Storage: photos bucket
-- =============================================

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Anyone can read photos (they appear on public card pages)
create policy "Photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Authenticated users can upload photos to their own folder
create policy "Users can upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own photos
create policy "Users can update own photos"
  on storage.objects for update
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own photos
create policy "Users can delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
