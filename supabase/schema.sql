-- ============================================================
-- Mission Control Code Academy — Phase 2 schema
--
-- HOW TO RUN THIS:
--   1. Open your project at supabase.com
--   2. Left sidebar → SQL Editor → "New query"
--   3. Paste this entire file and click "Run"
--   4. It's safe to re-run — every statement is idempotent
--      (create-if-not-exists / drop-then-create for policies & functions)
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

-- Parent profile (1:1 with the Supabase auth user)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Child profiles owned by a parent — kids are DATA, not auth users
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  avatar text not null default '🚀',
  pin_hash text,                                     -- null = no PIN set
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  created_at timestamptz not null default now()
);

-- One row per completed mission, per child
create table if not exists progress (
  id bigint generated always as identity primary key,
  child_id uuid not null references children(id) on delete cascade,
  mission_id text not null,                          -- e.g. 's2-m01'
  completed_at timestamptz not null default now(),
  unique (child_id, mission_id)
);

-- Per-child Mission Challenge checklist state (mirrors localStorage today)
create table if not exists checklist_state (
  child_id uuid not null references children(id) on delete cascade,
  mission_id text not null,
  item_id text not null,                             -- e.g. 'ch1'
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (child_id, mission_id, item_id)
);

-- ------------------------------------------------------------
-- Row Level Security — deny by default, allow only your own family.
-- This is the REAL security boundary (the anon key is public by design).
-- ------------------------------------------------------------

alter table profiles enable row level security;
alter table children enable row level security;
alter table progress enable row level security;
alter table checklist_state enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "own children" on children;
create policy "own children" on children
  for all
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

drop policy if exists "own progress" on progress;
create policy "own progress" on progress
  for all
  using (exists (
    select 1 from children c where c.id = progress.child_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from children c where c.id = progress.child_id and c.parent_id = auth.uid()
  ));

drop policy if exists "own checklist" on checklist_state;
create policy "own checklist" on checklist_state
  for all
  using (exists (
    select 1 from children c where c.id = checklist_state.child_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from children c where c.id = checklist_state.child_id and c.parent_id = auth.uid()
  ));

-- ------------------------------------------------------------
-- Auto-create a profile row the moment a parent signs up
-- ------------------------------------------------------------

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ------------------------------------------------------------
-- Child PIN — a SOFT LOCK only (deters a sibling from picking the
-- wrong profile). It is NOT the security boundary — RLS above is.
-- The hash never leaves the database; these RPCs are the only way
-- to set or check it. Each function manually re-checks parent_id =
-- auth.uid() in its query, since SECURITY DEFINER runs with elevated
-- privilege and does not automatically apply the table's RLS policies.
-- ------------------------------------------------------------

create or replace function set_child_pin(p_child_id uuid, p_pin text)
returns void as $$
begin
  if p_pin is null or p_pin = '' then
    update children set pin_hash = null
    where id = p_child_id and parent_id = auth.uid();
  else
    update children set pin_hash = crypt(p_pin, gen_salt('bf'))
    where id = p_child_id and parent_id = auth.uid();
  end if;
end;
-- Supabase installs pgcrypto into an `extensions` schema by default, not
-- `public` — search_path must include it or gen_salt()/crypt() "don't exist".
$$ language plpgsql security definer set search_path = public, extensions;

create or replace function verify_child_pin(p_child_id uuid, p_pin text)
returns boolean as $$
declare
  stored_hash text;
begin
  select pin_hash into stored_hash
  from children
  where id = p_child_id and parent_id = auth.uid();

  if stored_hash is null then
    return true; -- no PIN set on this profile — nothing to verify
  end if;

  return stored_hash = crypt(p_pin, stored_hash);
end;
$$ language plpgsql security definer set search_path = public, extensions;

grant execute on function set_child_pin(uuid, text) to authenticated;
grant execute on function verify_child_pin(uuid, text) to authenticated;

-- ============================================================
-- Child direct-access links ("convenience bookmark link" model)
--
-- The site is now hard-gated: nothing is reachable without either a
-- parent's Supabase Auth session, OR a child's own link. Children never
-- get a real auth.users row (see the table comment above) — instead each
-- child has an unguessable access_token, and a unique bookmarkable URL
-- (child.html?c=<id>&t=<token>) embeds it. THAT TOKEN IS THE REAL SECURITY
-- BOUNDARY, the same "secret share-link" pattern as a calendar feed URL —
-- 122 bits of randomness is not brute-forceable. The PIN on top is
-- intentionally just a soft convenience lock (per the chosen "convenience
-- bookmark link" model), which is also why the username+PIN fallback
-- login below is fine to be equally soft — it exists purely so a child
-- can log in from a second device that doesn't have the link bookmarked.
--
-- Every function below is SECURITY DEFINER and runs for the `anon` role
-- with NO Supabase Auth session at all — there is no auth.uid() to check.
-- Each one instead manually verifies (child_id, access_token) match
-- before touching any data. This is the ENTIRE security model for these
-- functions — review any change here carefully.
-- ============================================================

alter table children add column if not exists username text;
alter table children add column if not exists access_token uuid not null default gen_random_uuid();

create unique index if not exists children_username_unique_idx on children (lower(username)) where username is not null;
create unique index if not exists children_access_token_idx on children (access_token);

-- Public: minimal display info (name/avatar/whether a PIN exists) shown
-- on the child-login screen BEFORE the PIN is entered. Deliberately
-- returns nothing sensitive.
create or replace function child_public_info(p_child_id uuid, p_access_token uuid)
returns table(name text, avatar text, has_pin boolean) as $$
  select c.name, c.avatar, (c.pin_hash is not null)
  from children c
  where c.id = p_child_id and c.access_token = p_access_token;
$$ language sql security definer set search_path = public;

-- Verify the PIN for someone who already has the correct (child_id, token)
-- pair, i.e. they opened the real bookmarked link.
create or replace function child_link_verify_pin(p_child_id uuid, p_access_token uuid, p_pin text)
returns boolean as $$
declare
  stored_hash text;
begin
  select pin_hash into stored_hash
  from children
  where id = p_child_id and access_token = p_access_token;

  if not found then
    return false; -- wrong id/token pair entirely
  end if;
  if stored_hash is null then
    return true; -- no PIN set on this profile
  end if;
  return stored_hash = crypt(p_pin, stored_hash);
end;
$$ language plpgsql security definer set search_path = public, extensions;

-- Fallback login from a device that doesn't have the link: username + PIN
-- only. On success, hands back the (child_id, access_token) pair so the
-- client can store a normal child-link session from here on.
create or replace function child_login_by_username(p_username text, p_pin text)
returns table(child_id uuid, access_token uuid, name text, avatar text) as $$
declare
  rec record;
begin
  select c.id, c.access_token, c.name, c.avatar, c.pin_hash
  into rec
  from children c
  where lower(c.username) = lower(p_username);

  if not found then
    return; -- no matching username — empty result set
  end if;
  if rec.pin_hash is not null and crypt(p_pin, rec.pin_hash) <> rec.pin_hash then
    return; -- wrong PIN — empty result set
  end if;

  child_id := rec.id;
  access_token := rec.access_token;
  name := rec.name;
  avatar := rec.avatar;
  return next;
end;
$$ language plpgsql security definer set search_path = public, extensions;

-- ---- Child-scoped data access (progress / checklist / theme) ----
-- Every one of these re-verifies (p_child_id, p_access_token) itself.

create or replace function child_get_progress(p_child_id uuid, p_access_token uuid)
returns table(mission_id text) as $$
  select p.mission_id
  from progress p
  where p.child_id = p_child_id
    and exists (select 1 from children c where c.id = p_child_id and c.access_token = p_access_token);
$$ language sql security definer set search_path = public;

create or replace function child_mark_progress(p_child_id uuid, p_access_token uuid, p_mission_id text, p_complete boolean)
returns void as $$
begin
  if not exists (select 1 from children where id = p_child_id and access_token = p_access_token) then
    raise exception 'invalid child session';
  end if;

  if p_complete then
    insert into progress (child_id, mission_id) values (p_child_id, p_mission_id)
    on conflict (child_id, mission_id) do nothing;
  else
    delete from progress where child_id = p_child_id and mission_id = p_mission_id;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function child_get_theme(p_child_id uuid, p_access_token uuid)
returns text as $$
  select theme from children where id = p_child_id and access_token = p_access_token;
$$ language sql security definer set search_path = public;

create or replace function child_set_theme(p_child_id uuid, p_access_token uuid, p_theme text)
returns void as $$
begin
  update children set theme = p_theme
  where id = p_child_id and access_token = p_access_token;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function child_get_checklist(p_child_id uuid, p_access_token uuid, p_mission_id text)
returns table(item_id text, checked boolean) as $$
  select cs.item_id, cs.checked
  from checklist_state cs
  where cs.child_id = p_child_id and cs.mission_id = p_mission_id
    and exists (select 1 from children c where c.id = p_child_id and c.access_token = p_access_token);
$$ language sql security definer set search_path = public;

create or replace function child_set_checklist(p_child_id uuid, p_access_token uuid, p_mission_id text, p_item_id text, p_checked boolean)
returns void as $$
begin
  if not exists (select 1 from children where id = p_child_id and access_token = p_access_token) then
    raise exception 'invalid child session';
  end if;

  insert into checklist_state (child_id, mission_id, item_id, checked)
  values (p_child_id, p_mission_id, p_item_id, p_checked)
  on conflict (child_id, mission_id, item_id) do update set checked = excluded.checked, updated_at = now();
end;
$$ language plpgsql security definer set search_path = public;

-- These run with NO Supabase Auth session at all, so they must be
-- reachable by the `anon` role, not just `authenticated`.
grant execute on function child_public_info(uuid, uuid) to anon;
grant execute on function child_link_verify_pin(uuid, uuid, text) to anon;
grant execute on function child_login_by_username(text, text) to anon;
grant execute on function child_get_progress(uuid, uuid) to anon;
grant execute on function child_mark_progress(uuid, uuid, text, boolean) to anon;
grant execute on function child_get_theme(uuid, uuid) to anon;
grant execute on function child_set_theme(uuid, uuid, text) to anon;
grant execute on function child_get_checklist(uuid, uuid, text) to anon;
grant execute on function child_set_checklist(uuid, uuid, text, text, boolean) to anon;
