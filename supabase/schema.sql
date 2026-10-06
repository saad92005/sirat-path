-- Sirat Path — optional cloud sync & admin schema (Supabase free tier).
-- Run once in the Supabase SQL editor. Guest mode never needs any of this.

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "own profile: read" on public.profiles for select using (auth.uid() = id);
create policy "own profile: insert" on public.profiles for insert with check (auth.uid() = id and role = 'user');

-- Auto-create a profile on sign-up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Users may rename themselves but can never change their own role.
create policy "own profile: update name" on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and role = public.my_role());

-- ---------- Synced personal data ----------
-- One generic table keeps the client simple: each local record is (collection, key) → JSON value.
create table if not exists public.user_records (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  collection text not null check (collection in ('bookmarks','notes','reads','khatm','dhikr','salah','azkar','journal','habits','habitLog','learn','ramadan','saved','settings')),
  key text not null check (char_length(key) <= 200),
  value jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, collection, key)
);
create index if not exists user_records_updated on public.user_records (user_id, updated_at);
alter table public.user_records enable row level security;

create policy "own records: select" on public.user_records for select using (auth.uid() = user_id);
create policy "own records: insert" on public.user_records for insert with check (auth.uid() = user_id);
create policy "own records: update" on public.user_records for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own records: delete" on public.user_records for delete using (auth.uid() = user_id);

-- ---------- Content reports (admin) ----------
create table if not exists public.content_reports (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  item text not null check (char_length(item) <= 200),
  message text not null check (char_length(message) between 5 and 2000),
  source_hint text check (char_length(source_hint) <= 500),
  status text not null default 'open' check (status in ('open','resolved','rejected')),
  created_at timestamptz not null default now()
);
alter table public.content_reports enable row level security;

create policy "reports: signed-in users can file" on public.content_reports for insert to authenticated with check (auth.uid() = user_id);
create policy "reports: reporters see their own" on public.content_reports for select using (auth.uid() = user_id or public.is_admin());
create policy "reports: admins update" on public.content_reports for update using (public.is_admin()) with check (public.is_admin());

-- ---------- Account deletion ----------
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Make yourself admin (run manually, replacing the email):
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
