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
$$ language plpgsql security definer set search_path = public;

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
$$ language plpgsql security definer set search_path = public;

grant execute on function set_child_pin(uuid, text) to authenticated;
grant execute on function verify_child_pin(uuid, text) to authenticated;
