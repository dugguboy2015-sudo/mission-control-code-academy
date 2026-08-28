# Phase 2 — Personalized Multi-Kid Platform (Build Plan)

_Turns the static academy into a real product: parent accounts, Netflix-style child
profiles, server-side progress that follows each kid across devices, and per-child settings
(including the theme toggle). **Decisions locked:** Supabase for auth + data · child profiles
under one parent login · Cloudflare Pages hosting. This document is for approval before any
backend code is written._

---

## 1. Architecture at a glance

```
GitHub repo ──▶ Cloudflare Pages (static hosting, auto-deploy on push)
                     │
   browser ──────────┤
     │               └─ /functions/*  (Pages Functions — NOT needed for Phase 2;
     │                                  reserved for the Sector 7 AI proxy later)
     │
     └──▶ Supabase  (called directly from the browser with the public anon key)
            ├─ Auth      (parent email + password accounts)
            └─ Postgres  (profiles · children · progress · settings)
                          protected by Row Level Security (RLS)
```

**Key design choice — only parents authenticate.** Children are *data*, not auth users.
The logged-in identity is always the parent (a Supabase auth user). A child is a row the
parent owns, picked on a "who's learning?" screen. This is the safest, simplest model for an
11-year-old: no kid emails, no kid passwords, and RLS guarantees a parent can only ever touch
their own family's data.

**Why no server code for Phase 2:** Supabase's anon key is *designed* to be public; Row Level
Security does the protection in the database itself. So the browser talks to Supabase directly
and safely — no proxy needed yet. (The one secret we'll ever hide server-side is the future
LLM key, which lives in a Cloudflare Pages Function env var in Sector 7 — out of scope here.)

---

## 2. Database schema (`supabase/schema.sql`)

```sql
-- Parent profile (1:1 with the Supabase auth user)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Child profiles owned by a parent
create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  avatar text default '🚀',        -- emoji / preset id
  pin_hash text,                    -- optional 4-digit PIN (hashed); null = no PIN
  theme text default 'dark',        -- per-child setting (the toggle lives here)
  created_at timestamptz default now()
);

-- One row per completed mission, per child
create table progress (
  id bigint generated always as identity primary key,
  child_id uuid not null references children(id) on delete cascade,
  mission_id text not null,         -- e.g. 's2-m01'
  completed_at timestamptz default now(),
  unique (child_id, mission_id)
);

-- Optional: per-child challenge-checklist state, mirrored server-side
create table checklist_state (
  child_id uuid not null references children(id) on delete cascade,
  mission_id text not null,
  item_id text not null,
  checked boolean default false,
  primary key (child_id, mission_id, item_id)
);
```

### Row Level Security (deny-by-default, then allow own-family)
```sql
alter table profiles       enable row level security;
alter table children       enable row level security;
alter table progress       enable row level security;
alter table checklist_state enable row level security;

-- profiles: you can see/edit only your own
create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- children: parent owns their children
create policy "own children" on children
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- progress: only for children you own
create policy "own progress" on progress
  for all using (exists (select 1 from children c where c.id = progress.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from children c where c.id = progress.child_id and c.parent_id = auth.uid()));

-- checklist_state: same ownership rule
create policy "own checklist" on checklist_state
  for all using (exists (select 1 from children c where c.id = checklist_state.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from children c where c.id = checklist_state.child_id and c.parent_id = auth.uid()));
```

### Child PIN (soft lock)
A 4-digit PIN just deters a sibling from opening the wrong profile — it is **not** a security
boundary (RLS already is). We hash it with `pgcrypto` and verify via an RPC so the hash never
leaves the server:
```sql
create extension if not exists pgcrypto;
create or replace function set_child_pin(p_child uuid, p_pin text) returns void ...  -- hashes with crypt()
create or replace function verify_child_pin(p_child uuid, p_pin text) returns boolean ...  -- checks crypt()
```
(Full function bodies written during the build.)

---

## 3. Client data layer (`assets/supabase.js`)

A single module wrapping supabase-js, exposing a clean API the rest of the site calls. It
becomes the new home for progress (today's `localStorage` logic moves behind it):

```
Academy.auth
  signUp(email, pw) · signIn(email, pw) · signOut() · getSession() · onChange(cb)

Academy.family
  listChildren() · createChild({name,avatar,pin}) · updateChild(id, patch) · deleteChild(id)
  verifyPin(childId, pin)

Academy.session
  setActiveChild(childId) · getActiveChild() · clearActiveChild()

Academy.progress   (keyed to the ACTIVE child)
  isComplete(missionId) · markComplete(missionId, bool) · all()
  getTheme() · setTheme(theme)
```

**Refactor of the existing code:** `academy.js`'s `getProgress()` / `setMissionComplete()` and
the theme read/write get re-pointed at `Academy.progress`. Behaviour:
- **Signed in + child active** → reads/writes Supabase (with an in-memory + localStorage cache
  so the UI is instant and works briefly offline).
- **Signed out / guest** → falls back to today's `localStorage` exactly as it works now.
So the site keeps working with zero accounts, and logging in "upgrades" it. On first login we
offer a one-time **"import this browser's progress into <child>"**.

---

## 4. New pages & UI

| File | Who | Purpose |
|---|---|---|
| `login.html` | parent | Sign in / sign up (email + password). |
| `family.html` | parent | Family dashboard: add/edit/remove children, set each child's name, avatar (emoji), optional PIN, and see a per-child progress summary. |
| `index.html` (updated) | everyone | If signed in, greet the active child + show their progress; add a **"Switch profile"** and **"Sign out"** control. If signed out, a "Sign in / continue as guest" prompt. |
| "Who's learning?" picker | kids | The Netflix-style profile chooser (a screen shown after parent login, before the dashboard — likely folded into `index.html`, optional PIN gate). |
| Child profile / settings | parent + kid | Name, avatar, and **theme toggle** — this is where "settings live in the profile," as requested. |

The **left sidebar and theme toggle already shipped** in Phase 1 stay; the toggle simply starts
persisting to the child's `theme` column instead of `localStorage` once signed in.

---

## 5. File-structure additions
```
/login.html                 NEW  parent auth
/family.html                NEW  manage children (parent only)
/index.html                 EDIT child-aware dashboard + profile picker
/assets/supabase.js         NEW  auth + data layer (loads @supabase/supabase-js)
/assets/config.js           NEW  SUPABASE_URL + SUPABASE_ANON_KEY (safe to commit)
/assets/academy.js          EDIT progress/theme delegate to Academy.progress
/supabase/schema.sql        NEW  DDL + RLS + PIN functions (run once in Supabase)
/functions/                 (later — AI proxy for Sector 7, not Phase 2)
```

---

## 6. Deployment (Cloudflare Pages + Supabase)

**Supabase (one-time):** create a free project → open the SQL editor → run `schema.sql` →
enable the Email auth provider (email confirmation ON is recommended for a real deploy) →
copy the **Project URL** and **anon/public key**.

**Cloudflare Pages (one-time):** push repo to GitHub → Pages → "Connect to Git" → framework
preset **None**, build command empty, output dir = repo root (it's already static) → deploy.
Every `git push` auto-deploys. No env vars needed for Phase 2 (the anon key is public and lives
in `config.js`).

---

## 7. What you (the parent) will need to do

I write **all** the code, schema, and wiring. Because I can't create accounts or handle
credentials, these steps are yours:
1. Create a Supabase account + project (free).
2. Paste the provided `schema.sql` into Supabase's SQL editor and run it.
3. Copy your Project URL + anon key into `assets/config.js` (I'll leave clearly-marked blanks).
4. Create a Cloudflare account and connect the GitHub repo as a Pages project.
5. You create the first **parent account** through the app's own sign-up screen, then add your
   son's child profile from the family dashboard.

I handle everything else and we test end-to-end together.

---

## 8. Security & privacy notes
- RLS on every table, deny-by-default — a parent can only ever read/write their own family.
- The anon key is public *by design*; it is not a secret and grants nothing beyond what RLS allows.
- No secret keys in the repo. (The future LLM key is the only secret, and it goes in a Cloudflare
  env var when we build the Sector 7 AI proxy — not now.)
- Child data is minimal: a display name + an emoji avatar. PIN is hashed and is a soft lock only.
- This is a personal family app. If it were ever opened to the public, revisit COPPA / GDPR-K
  obligations for children's data before doing so.

---

## 9. Build order within Phase 2
- **2a — Foundation:** Supabase project + `schema.sql` + `assets/supabase.js` data layer +
  `login.html` (parent auth) + refactor progress/theme to be child-aware (localStorage fallback intact).
- **2b — Family & profiles:** `family.html` (manage children) + "who's learning?" picker +
  child settings/profile screen (theme moves here).
- **2c — Ship it:** deploy to Cloudflare Pages, wire `config.js`, end-to-end test with your real
  parent account + a couple of child profiles on more than one device.
- **2d — (later, separate):** the AI-proxy Pages Function, when the Sector 7 missions are built.

---

### Open question for you before 2a
Email confirmation on parent sign-up: **ON** (more secure, but you must click a confirmation
link when you register) or **OFF** (instant sign-up, fine for a private family app)? Default if
you don't say: **ON**.
