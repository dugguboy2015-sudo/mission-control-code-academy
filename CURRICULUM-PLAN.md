# Mission Control Code Academy — Build & Curriculum Plan

_A zero-to-expert, incremental path for an 11-year-old cadet: from "what is code" to
shipping **AI-Native and AI-Enabled** applications._

## Build Status (live)

The site is implemented and running: `index.html` dashboard, `missions.json` manifest,
`assets/academy.css`/`academy.js`/`sandbox.js` shared runtime, and a `/missions` folder.
The 9 original standalone pages were migrated onto the shared design system (archived
originals live in `/_legacy`) and re-slotted into their sector positions. **12 of 69
missions are live**, verified working in-browser (dashboard, progress tracking, dynamic
prev/next nav, all three sandbox types, and every sector's bespoke widget):

- Sector 0 (Ground School): 0.1, 0.2, 0.3 — all new
- Sector 1: 1.1, 1.4 — migrated
- Sector 2: 2.1 — migrated
- Sector 3: 3.1 — migrated
- Sector 4: 4.5 — migrated
- Sector 5: 5.2, 5.4, 5.7 (capstone) — migrated
- Sector 6: 6.1 — migrated (also fixed a broken Skulpt CDN link inherited from the original)

**Site-wide UX shipped (Phase 1.5):** a left **sidebar navigator** (auto-injected on every
mission page from the manifest — current mission highlighted, per-mission completion ticks,
responsive drawer) and a **dark/light theme toggle** (persisted; light mode flips the page
chrome while keeping code/sandbox/widget "dark islands" intentionally dark).

**Phase 2 (personalized multi-kid platform)** is planned in
[`PHASE2-BACKEND-PLAN.md`](PHASE2-BACKEND-PLAN.md) and awaiting approval — Supabase auth +
Postgres, Netflix-style child profiles under one parent account, server-side per-child
progress, theme-in-profile, deployed on Cloudflare Pages.

The **57 remaining `planned` missions** have a page-by-page authoring plan in
[`CONTENT-BUILD-PLAN.md`](CONTENT-BUILD-PLAN.md) (per-mission concept scope, interactive-widget
idea, and challenge), awaiting approval.

Everything else in Part C below is still `planned` in `missions.json` and awaits content.
Run `npx serve .` (or any static server) from the project root and open `index.html` to
use it — opening files directly via `file://` also works for individual mission pages,
but the dashboard's manifest script tag needs `missions.json`'s mirror at
`assets/missions-data.js`, which is already checked in and kept in sync by hand whenever
`missions.json` changes (regenerate with the one-liner in the repo history if you edit it
directly).

---

## Part A — Where we are today

**Assets:** 9 mission pages (`mission-01` … `mission-09`) + `instructions.md` design spec.

**Strengths to preserve:**
- Locked "Commander Byte" space-academy design system (palette, fonts, 7-section skeleton).
- Real embedded practice already works: JS live sandbox (`new Function`), **real Python in
  the browser** (Skulpt), copy buttons, `<details>` deep-dives, inline SVG diagrams.
- Voice: "capable young engineer," real terminology, real runnable code.

**Problems this plan fixes:**
1. **Depth compression** — all of JS in 1 page, all of Python in 1 page, "CSS" = only Flexbox.
2. **Ordering** — Git before any code exists; two overlapping DB missions before async/fetch.
3. **Missing the actual goal** — no AI track at all, no design track at all.
4. **No site shell** — every page re-inlines the same CSS/JS; no index, nav, or progress.
5. **Housekeeping** — `mission-07-databases (1).html` is an exact duplicate (delete).

---

## Part B — Website architecture plan

Guiding rule: **plain HTML/CSS/JS first** (no framework) so fundamentals are never hidden by
tooling. Add a backend only when a mission genuinely needs one (auth, hidden AI keys).

### Phase 1 — Static learning site (do this first)
```
/duggu_learning
  index.html                 # Mission Control: curriculum map + progress dashboard
  missions.json              # single source of truth: sectors, missions, order, status
  /assets
    academy.css              # the locked design system, extracted once (was re-inlined)
    academy.js               # nav, prev/next, progress (localStorage), copy buttons, starfield
    sandbox.js               # reusable "Command Console" runners (see below)
  /missions
    s1-m03-html-structure.html ...   # one file per mission, using a shared template
  CURRICULUM-PLAN.md         # this file
```
- **Refactor, don't rewrite:** pull the repeated inline CSS/JS into `assets/`. Pages stay
  self-contained enough to open by double-click (relative file links work offline).
- **`index.html` = Mission Control dashboard:** the sector map, difficulty badges
  (🟢 Cadet / 🟡 Officer / 🔴 Commander), and a live progress bar per sector.
- **Progress tracking:** `localStorage` marks missions complete + stamps "Mission Complete."
  No server needed. (Optional later: sync across devices via a tiny backend.)
- **Wire real prev/next nav** from `missions.json` (today they're `#` placeholders).

### Reusable embedded-practice components (standardize these once, reuse everywhere)
| Component | Tech | Used for |
|---|---|---|
| **HTML/CSS live preview** | `<iframe srcdoc>` | web-building missions — edit, see it render instantly |
| **JS sandbox** | `new Function` + captured `console` | JavaScript missions (already exists in M04) |
| **Python runner** | Skulpt (has it) or upgrade to **Pyodide** for real libs | Python & data/AI missions |
| **Quiz / check-understanding** | vanilla JS | every mission's self-check |
| **Interactive challenge checklist** | vanilla JS + localStorage | Mission Challenge section |
| **AI "call the model" demo** | fetch → serverless proxy (Phase 2) | AI-Enabled/Native sectors |

### Phase 2 — Add a backend (only when the AI + data sectors arrive)
- **Why:** LLM API keys must never live in client HTML. Need a thin proxy.
- **Recommendation:** **Cloudflare Pages + Pages Functions/Workers** — matches the existing
  Cloudflare deployment mission (M09), free tier, no server to manage. A single function
  `/api/ask` forwards prompts to the model with the key kept server-side.
- **Database:** teach **both Supabase (SQL/Postgres) and Firebase (NoSQL)** as first-class
  stacks, with an explicit comparison mission so the cadet learns SQL vs NoSQL trade-offs.
- **Optional:** move progress tracking server-side for cross-device sync (nice-to-have).

---

## Part C — The curriculum (incremental, zero → AI-native)

Organized into **Sectors**. Each mission is one page. `[NEW]` = to build, `[HAVE]` = existing
page reused, `[EXPAND]` = existing page split/deepened. ~55 missions total — a multi-year path,
not a sprint. Every mission keeps the 7-section structure and ends with embedded practice.

### SECTOR 0 — Ground School · foundations & mental models  🟢
- 0.1 How computers & code think (input → process → output) `[NEW]`
- 0.2 How the web works: browser, server, HTTP, URL, DNS (light) `[NEW]`
- 0.3 Your workshop: editor (VS Code), files, running things, DevTools `[NEW]`

### SECTOR 1 — Building the Web · HTML, CSS & Design  🟢
- 1.1 HTML structure & semantics `[HAVE M02]`
- 1.2 Forms, inputs & media `[NEW]`
- 1.3 CSS fundamentals: selectors, cascade, the box model `[EXPAND from M03]`
- 1.4 Flexbox layout `[HAVE M03]`
- 1.5 CSS Grid layout `[NEW]`
- 1.6 Positioning & responsive design (mobile-first, media queries) `[NEW]`
- 1.7 Transitions, animations & polish `[NEW]`
- 1.8 **Design track:** visual hierarchy, color, type, spacing, accessibility basics `[NEW]`
- 1.9 🏁 Capstone: design & build a multi-section personal site `[NEW]`

### SECTOR 2 — Programming with JavaScript · real CS  🟢→🟡
- 2.1 Variables, types, operators `[EXPAND from M04]`
- 2.2 Conditionals & control flow `[NEW]`
- 2.3 Loops & iteration `[NEW]`
- 2.4 Functions in depth (params, return, scope) `[EXPAND from M04]`
- 2.5 Arrays & array methods (map/filter/reduce) `[NEW]`
- 2.6 Objects & structured data `[NEW]`
- 2.7 The DOM: finding & changing the page `[HAVE M04]`
- 2.8 Events & interactivity in depth `[HAVE M04]`
- 2.9 Debugging & the browser DevTools `[NEW]`
- 2.10 Thinking like a programmer: problem-solving & simple algorithms `[NEW]`
- 2.11 🏁 Capstone: an interactive game or quiz app `[NEW]`

### SECTOR 3 — Version Control & Collaboration  🟡
- 3.1 Git basics: commits, the log, staging `[HAVE M01]`
- 3.2 Branching & merging `[HAVE M01]`
- 3.3 GitHub, remotes, pull requests `[EXPAND from M01/M06]`

### SECTOR 4 — Dynamic & Connected Web · async, APIs, deploy  🟡
- 4.1 Organizing code: modules & files `[NEW]`
- 4.2 Async JavaScript: promises & async/await `[NEW]`
- 4.3 `fetch`, JSON & public APIs `[NEW]`
- 4.4 State & storage (localStorage) `[NEW]`
- 4.5 Deploying to the web (GitHub Pages / Cloudflare) `[HAVE M06]`
- 4.6 🏁 Capstone: an app that consumes a live public API `[NEW]`

### SECTOR 5 — Data & Backends  🟡→🔴
- 5.1 Data modeling: tables, rows, keys, relationships `[HAVE M07]`
- 5.2 Supabase: database + CRUD from the browser `[HAVE M07]`
- 5.3 Auth: sign up / sign in / protected UI `[HAVE M08/M09]`
- 5.4 Firebase as a first-class alternative stack (Firestore, Auth, realtime) `[HAVE M08]`
- 5.5 Supabase vs Firebase: SQL vs NoSQL, when to choose which `[NEW]`
- 5.6 What a backend is: serverless functions & building a tiny API `[NEW]`
- 5.7 🏁 Capstone: full-stack CRUD app with login `[EXPAND M09]`

### SECTOR 6 — Python & Computational Thinking  🟡
_(Python introduced here because it is the language of AI work ahead.)_
- 6.1 Python fundamentals `[HAVE M05]`
- 6.2 Lists, dicts & Python data structures `[NEW]`
- 6.3 Files, loops & working with data `[NEW]`
- 6.4 🏁 Capstone: a data-crunching Python mini-project `[NEW]`

### SECTOR 7 — AI-**Enabled** Applications · the pivot  🔴
- 7.1 What AI/ML/LLMs actually are — mental models (tokens, prediction, no magic) `[NEW]`
- 7.2 Prompt engineering fundamentals `[NEW]`
- 7.3 Calling an LLM API safely (via your serverless proxy) — build a chatbot `[NEW]`
- 7.4 Structured output & function/tool calling `[NEW]`
- 7.5 Embeddings & semantic search `[NEW]`
- 7.6 RAG: chat with your own notes `[NEW]`
- 7.7 AI in the UI: streaming, loading, guardrails `[NEW]`
- 7.8 **AI Economics & model selection**: token math, small vs large, routing & fallbacks `[NEW]`
- 7.9 **Context engineering**: managing the context window (the real skill beyond prompting) `[NEW]`
- 7.10 🏁 Capstone: an AI-enabled web app — **deployed, cost-estimated, guardrailed** `[NEW]`

### SECTOR 8 — AI-**Native** Apps & Agents · advanced  🔴
- 8.1 AI-native vs AI-enabled: designing around the model `[NEW]`
- 8.2 The agent loop: reason → act → observe `[NEW]`
- 8.3 Tool-using agents `[NEW]`
- 8.4 Multi-step planning & memory `[NEW]`
- 8.5 Connecting agents to real systems (MCP, intro) `[NEW]`
- 8.6 **Evals: how you *know* the AI works** (test sets, LLM-as-judge, regression) `[NEW]`
- 8.7 **Observability & tracing** for AI: logging prompts, outputs, cost, failures `[NEW]`
- 8.8 🏁 Capstone: a small autonomous agent — **with an eval suite** `[NEW]`

### SECTOR 9 — Engineering Craft · woven throughout, formalized here  🔴
- 9.1 Testing basics `[NEW]`
- 9.2 Debugging methodology & reading errors `[NEW]`
- 9.3 Using AI as a coding partner responsibly (an AI-native skill in itself) `[NEW]`
- 9.4 Code quality & refactoring `[NEW]`
- 9.5 Security & privacy basics `[NEW]`
- 9.6 **AI security: prompt injection, data exfiltration, key safety, output guardrails** `[NEW]`
- 9.7 **CI/CD & deploy pipelines**: automated build → test → ship `[NEW]`
- 9.8 🏁 Final capstone: ship a real **AI-native product on the Architect's Stack** —
  within the free tier, with evals, an architecture diagram, and a monitored public URL `[EXPAND]`

---

## Part D — Key decisions to confirm before building

1. **Language path:** JavaScript-first for the web, Python for AI (matches existing pages). ✅ recommended
2. **Databases:** teach **both Supabase and Firebase** fully, plus a SQL-vs-NoSQL comparison. ✅ confirmed
3. **AI keys/backend:** introduce a **Cloudflare serverless proxy** in Sector 5/7. ✅ recommended
4. **Production spine (the Architect's Stack):** master **Cloudflare** end-to-end (Pages,
   Workers, AI Gateway, Vectorize, D1, R2) as the one platform he productionizes on. ✅ recommended
5. **Scope:** ~62 missions across 10 sectors + 4 cross-cutting threads (multi-year). Adjust pace as desired.

## Part E — Suggested build order (execution)
1. Extract `academy.css` / `academy.js`; create `missions.json` + `index.html` dashboard.
2. Standardize the reusable practice components (`sandbox.js`).
3. Re-slot the 9 existing pages into their new sector positions; delete the duplicate.
4. Fill Sector 0 → 1 → 2 gaps first (foundations), then proceed sector by sector.
5. Add the Cloudflare proxy + Supabase when Sector 5 arrives; then Sectors 7–9 (AI).

---

## Part F — The AI Architect Layer (raising an "AI-ready", ship-cheap engineer)

Reframe: the goal is **not** "learn web dev, then bolt AI on at the end." It is to raise an
engineer who **designs systems around AI and productionizes them at near-zero cost**. That
means four habits ("threads") that run through *every* sector from the very start — not a
sector reached in year three.

### The four cross-cutting threads
- **Thread 1 — Build *with* AI (from S0).** He pairs with an AI coding assistant (e.g. Claude
  Code) responsibly: prompt it, *read and verify* its code, debug alongside it — never blind
  paste. The biggest force-multiplier and an AI-native skill in itself.
  Rule taught early: *"AI writes the first draft; you are the engineer who understands and owns it."*
- **Thread 2 — Ship it (from S1).** Every capstone goes to a real public URL on a free tier.
  "Done" means *deployed*, not "runs on my laptop." Builds the productionization reflex early.
- **Thread 3 — Cost-aware by default (from S4).** He learns what actually costs money —
  compute time, bandwidth/egress, database rows, and above all **LLM tokens** — and designs to
  stay inside free tiers. Architect's reflex: *"what does this cost at 1 user? at 10,000?"*
- **Thread 4 — Boxes & arrows (from S4).** Before coding a feature he draws the system: what
  are the pieces, how do they talk (contracts/APIs), where does data live, what is stateless.

### The Architect's Stack — one coherent, near-free, productionizable toolchain
An architect goes *deep* on one stack, not shallow on ten. Recommendation: master the
**Cloudflare Developer Platform** as the production spine — one mental model, generous free
tiers, **no egress fees**, covering every layer of an AI-native app:

| Layer | Cloudflare service | Role | Curriculum alternative |
|---|---|---|---|
| UI / static hosting | Pages | Host every capstone | GitHub Pages |
| Serverless API / hide keys | Workers / Pages Functions | The `/api/*` proxy | — |
| **LLM cost control** | **AI Gateway** | Caching, rate-limits, spend dashboards | — |
| Run models cheaply | Workers AI | Small models at low cost | hosted LLM APIs |
| Vector DB (RAG) | Vectorize | Semantic search / RAG | — |
| Relational DB | D1 (SQLite) | CRUD data | Supabase (SQL) |
| NoSQL / realtime | KV / Durable Objects | key-value & state | Firebase (NoSQL) |
| Object storage | R2 (no egress fee) | files / images | — |
| Agents | Agents SDK / Durable Objects | stateful agents | — |

Supabase (SQL) and Firebase (NoSQL) stay in the curriculum for concepts and comparison (S5);
**Cloudflare is the deploy/production spine.** AI Gateway especially teaches *cost control as
architecture* — caching identical calls and watching spend on a dashboard.

### AI Economics 101 (concept behind mission 7.8)
Token math made concrete: input + output tokens → cost per call → cost per user per day.
Cost levers he should reach for by instinct: smaller model, shorter prompt, **cache identical
calls** (AI Gateway), trim context, batch. He should be able to estimate an app's monthly bill
on a napkin *before* building it.

### The Production-Readiness Ladder (applied to every capstone; levels up each sector)
So "productionizing" becomes a habit, not a final exam:
- **L1 (S1):** deployed to a public URL; works on mobile.
- **L2 (S4):** secrets in env vars (never in code); handles error + loading states; has a README.
- **L3 (S5):** real data + auth; input validation; provably inside the free tier.
- **L4 (S7):** AI calls go through a proxy + AI Gateway; guardrails; cost estimated; graceful
  fallback when the model fails or is slow.
- **L5 (S8–9):** evals prove it works; logging/observability; prompt-injection defense;
  a documented architecture diagram.

### The AI-native reference architecture he should be able to draw from memory
`UI → Edge API (keys hidden) → Orchestration (prompt / agent / tools) → Model + Memory/Vector + Data`
— plus the cross-cutting concerns hanging off it: **Gateway (cost/cache), Evals, Observability,
Guardrails.** Every AI mission maps a piece onto this same diagram so understanding compounds.

### What this adds vs. the original plan (net-new, production-grade)
- **7.8 AI Economics & model selection**, **7.9 Context engineering** — cost + context as skills.
- **8.6 Evals**, **8.7 Observability/tracing** — "how do you *know* it works" and "what is it
  doing in production" — the two things hobby AI projects always skip.
- **9.6 AI security (prompt injection)**, **9.7 CI/CD** — the real last mile.
- Capstones now require **deploy + cost estimate + guardrails + evals**, not merely "it runs."
