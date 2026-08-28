# Content Build Plan — Completing the 57 Planned Missions

_A page-by-page plan to author every mission still in `planned` state, to the same standard as
the 12 live pages. For review alongside `PHASE2-BACKEND-PLAN.md` before implementation._

**Scope:** 57 missions across Sectors 1–9 (12 already live). Every page is an independent
`.html` file in `/missions`, using the shared design system — so authoring is now pure content,
not boilerplate.

---

## 1. The authoring standard (what "done" means for every page)

Because Phase 1 extracted the shared runtime, each new page only needs:
- `<link rel="stylesheet" href="../assets/academy.css">` + an optional small `<style>` block for a bespoke widget
- `<body class="accent-COLOR" data-mission-id="sX-mNN">` (accent per sector; `data-mission-id` wires everything)
- the **7-section skeleton**: Hero → Briefing → Field Manual → Command Console → Mission Challenge → Debrief/Cheat Sheet → Footer
- the three shared script tags (`missions-data.js`, `academy.js`, `sandbox.js`)

The sidebar, theme toggle, prev/next nav, progress tracking, copy buttons, quiz wiring, and
mission-complete stamp then all work **automatically** — no per-page JS for any of them.

**Definition of Done (per page):**
1. 7 sections present; correct sector accent; difficulty badge matches the manifest.
2. ≥1 inline-SVG diagram in the Briefing.
3. ≥1 **runnable / interactive** practice element in the Command Console.
4. Mission Challenge = a checklist with a hidden **hint** (never the answer) + a bonus objective.
5. Debrief has a cheat-sheet grid, a "common mistakes" box, and a quiz (`data-correct` + `data-feedback`).
6. Cross-cutting **thread** honored where flagged (see §3).
7. Manifest `status` flipped `planned → live`; `assets/missions-data.js` regenerated.
8. **Verified in a browser**: no console errors, the interactive widget actually runs.

---

## 2. Interactive-practice component palette

| Component | Source | Reuse for |
|---|---|---|
| JS live sandbox | `initJsSandbox()` | all JS missions (S2, S4, S9) |
| Python runner (Skulpt) | `initPythonSandbox()` | all Python missions (S6) |
| HTML/CSS live preview | `initHtmlCssPreview()` | HTML/CSS missions (S1) |
| Quiz / checklist / copy | `academy.js` (automatic) | every page |
| **Bespoke widget** | per-page `<script>` + `<style>` | anything the three runners can't express (playgrounds, visualizers, simulators) |

Bespoke widgets are where the teaching shines — the plan names a specific one for most missions
below. They follow the established pattern (dark "island", accent-colored, `<style>` block after
the `<link>`, logic in the page's own IIFE).

---

## 3. Cross-cutting threads & the AI-demo strategy

**Threads to honor** (from the Architect's Layer):
- **Thread 4 (boxes & arrows):** missions flagged `{thread}` in S4.3 require a system diagram
  *before* any code.
- **Thread 3 (cost-aware):** S5.6 and S7.8 must include real free-tier / token cost math.
- **Thread 1 (build-with-AI):** S9.3 formalizes the "read it, own it" rule from Mission 0.3.

**AI embedded-demo strategy (important):** real LLM calls need the Cloudflare AI proxy + keys +
spend (Phase 2d). To keep every lesson page **free, offline, and instant**, all embedded AI
demos in S7/S8 use a **deterministic simulated model** (canned/mock responses that still teach
the mechanic), with the "swap in the real proxy here" seam clearly marked. The learner wires the
**real** proxy only in the hands-on capstones (7.10, 8.8, 9.8), which they run on their own
deploy. → _Default; overridable — see §6._

---

## 4. Sequencing, batching & Phase-2 dependencies

Build in curriculum order (front-to-back, so the path fills in for the learner), parallelizing
*within* a sector via subagents (each page is independent, same proven pattern as the migration).
I (orchestrator) verify each batch in-browser, fix issues, and flip manifest status.

| Batch | Missions | Notes |
|---|---|---|
| A | S1: 1.2, 1.3, 1.5, 1.6, 1.7, 1.8, 1.9 (7) | HTML/CSS + design track |
| B | S2: 2.2–2.11 (10) | JS core — likely split into two waves |
| C | S3: 3.2, 3.3 + S4: 4.1–4.6 (7) | Git + async/APIs/deploy |
| D | S5: 5.1, 5.3, 5.5, 5.6 + S6: 6.2–6.4 (7) | data + Python |
| E | S7: 7.1–7.10 (10) | AI-enabled (mock demos) |
| F | S8: 8.1–8.8 + S9: 9.1–9.8 (16) | agents + engineering craft |

**Soft dependencies on Phase 2** (content works without them via mocks, but is *better* if the
real thing exists first — suggest landing these after their Phase 2 counterpart):
- **S5.3 (Auth)** and **S5.6 (serverless backend)** ↔ Phase 2a/2b (real Supabase auth + the
  data layer become live reference material).
- **S7.3 + the AI capstones (7.10, 8.8, 9.8)** ↔ Phase 2d (the real AI proxy).

Everything else is fully independent of Phase 2 and can be built anytime.

---

## 5. Per-mission content briefs

_Format: **concept scope** · **interactive practice** · **challenge** · notes._

### Sector 1 — Building the Web (accent: cyan)
- **1.2 Forms, Inputs & Media** · form controls, input types, labels, `<audio>/<video>`, validation attributes · HTML/CSS live preview building a form · build a working sign-up/contact form with required fields.
- **1.3 CSS Fundamentals & the Box Model** · selectors recap, specificity/cascade, box model (margin/border/padding/content), `box-sizing` · **bespoke box-model visualizer** (sliders adjust each layer live) + preview · style a card from scratch.
- **1.5 CSS Grid Layout** · grid vs flex, template columns/rows, gap, spans, areas · **bespoke Grid Playground** (pill controls, like the Flexbox one) + preview · build a responsive photo gallery / dashboard grid.
- **1.6 Positioning & Responsive Design** · position values, mobile-first, media queries, units (%, rem, vw) · **bespoke resizable-viewport widget** (drag width, watch breakpoints fire) · make a layout that reflows on mobile.
- **1.7 Transitions, Animation & Polish** · transitions, `@keyframes`, easing, transforms, tasteful motion · preview + **bespoke easing/duration controls** that replay an animation · animate a launch button + a loading state.
- **1.8 Design Track: Visual Hierarchy & Accessibility** · hierarchy, color, type scale, spacing rhythm, WCAG basics · **bespoke contrast checker** (fg/bg → ratio + pass/fail) + before/after redesign toggle · fix a badly-designed card and pass AA contrast.
- **1.9 Capstone: Your Personal Site (L1)** · combine all of S1; ship it · scaffold in preview + build checklist · design, build, and **deploy** a multi-section personal site (Ladder L1: public URL, mobile-OK).

### Sector 2 — Programming with JavaScript (accent: cyan)
- **2.2 Conditionals & Control Flow** · `if/else`, `switch`, truthiness, boolean logic, ternary · JS sandbox · write a status/grading function with layered conditions.
- **2.3 Loops & Iteration** · `for`, `while`, `for...of`, `break/continue` · JS sandbox + **bespoke loop-tracer** (steps highlight each iteration) · sum/filter a list with a loop.
- **2.4 Functions in Depth** · params/args, return, scope, closures (gently), arrow fns · JS sandbox · refactor repeated code into reusable functions.
- **2.5 Arrays & Array Methods** · `map/filter/reduce/find/sort`, immutability · JS sandbox + **bespoke pipeline visualizer** (data flowing map→filter→reduce) · transform a crew roster with chained methods.
- **2.6 Objects & Structured Data** · properties, methods, nesting, `this` basics, JSON shape · JS sandbox · model a ship as a nested object and read/update it.
- **2.7 The DOM In Depth** · query/create/insert/remove nodes, attributes, classes · JS sandbox wired to a **live mini-DOM panel** · build a to-do list that adds/removes DOM nodes.
- **2.8 Events In Depth** · listeners, the event object, bubbling, delegation, `preventDefault` · JS sandbox + **bespoke bubbling/delegation visualizer** · one delegated listener handling a whole list.
- **2.9 Debugging & DevTools** · reading stack traces, `console` methods, breakpoints, the Sources panel · **bespoke buggy-code + console widget** · find and fix three planted bugs.
- **2.10 Thinking Like a Programmer** · decomposition, pseudocode→code, linear/binary search, simple sort, Big-O intuition · JS sandbox + **bespoke sort/search animator** · implement a search and reason about its cost.
- **2.11 Capstone: Interactive Game or Quiz (L1)** · combine S2; state + events + DOM · JS sandbox scaffold · build a playable number-guess or quiz game and **deploy** it (Ladder L1).

### Sector 3 — Version Control (accent: orange)
- **3.2 Branching & Merging Deep-Dive** · branch strategy, fast-forward vs merge commit, **conflict resolution** · **extend the Git terminal simulator** with a conflict scenario + graph · branch, commit on both, merge, resolve a conflict.
- **3.3 GitHub, Remotes & Pull Requests** · remotes, push/pull/fetch, PR review flow, `.gitignore` · **bespoke PR-flow stepper** + simulated push/pull · push a repo to GitHub and open a real PR (hands-on, off-page).

### Sector 4 — Dynamic & Connected Web (accent: cyan; deploy pages orange)
- **4.1 Organizing Code: Modules & Files** · `import/export`, single-responsibility files, folder layout · **bespoke two-file "exports → imports" simulator** · split a script into modules.
- **4.2 Async JavaScript** · the event loop, callbacks, Promises, `async/await`, error handling · JS sandbox + **bespoke sync-vs-async timeline** · await a simulated delayed operation.
- **4.3 fetch, JSON & Public APIs** `{Thread 4}` · HTTP recap, `fetch`, JSON parse, rendering data, errors · **diagram FIRST** (client→API→render), then JS sandbox hitting a mock/public API + JSON explorer · fetch and render live data.
- **4.4 State & Storage** · app state, `localStorage`, serialization, when to persist · JS sandbox using **real localStorage** · persist a counter/notes across reloads.
- **4.6 Capstone: Live API App (L2)** · consume a real public API, deploy · scaffold + checklist · build and **deploy** an app on a live API (Ladder L2: secrets in env, error/loading states, README).

### Sector 5 — Data & Backends (accent: green)  ·  _soft-dep on Phase 2_
- **5.1 Data Modeling** · entities, keys, relationships, normalization basics · **bespoke ER-diagram/table visualizer** · model a schema (users→posts→comments).
- **5.3 Auth: Sign Up / Sign In / Protected UI** · sessions, hashing (concept), protected routes · **bespoke auth-flow simulation** (reuse the 5.7 capstone's auth widget) · gate a page behind sign-in. _Best authored after Phase 2a._
- **5.5 Supabase vs Firebase** · SQL vs NoSQL, trade-offs, when to choose which · **bespoke "which stack?" decision widget** (answer scenarios → recommendation) · pick + justify a stack for three scenarios.
- **5.6 What a Backend Is** `{Thread 3}` · servers, serverless functions, request→function→response, **free-tier cost math** · **bespoke request simulator + free-tier calculator** · reason about a tiny API's limits. _Best after Phase 2b._

### Sector 6 — Python (accent: purple)
- **6.2 Lists, Dicts & Data Structures** · lists, dicts, tuples, sets, comprehensions · Python sandbox · manipulate a crew dataset with comprehensions.
- **6.3 Files, Loops & Working with Data** · iteration over data, parsing text/CSV (in-memory, Skulpt-safe), aggregation · Python sandbox on an embedded dataset · parse and summarize records.
- **6.4 Capstone: Data-Crunching Mini-Project** · combine S6 on a real-ish dataset · Python sandbox scaffold · analyze an embedded dataset and print computed stats.

### Sector 7 — AI-Enabled (accent: pink)  ·  _embedded demos = simulated model (§3)_
- **7.1 What AI/ML/LLMs Actually Are** · training vs inference, tokens, next-token prediction, "no magic," limits · **bespoke tokenizer + next-token predictor toy** (mock probabilities) · tokenize sentences; predict the next word.
- **7.2 Prompt Engineering Fundamentals** · role/instruction/context/examples, specificity, format control · **bespoke prompt playground** (mock model; weak vs strong prompt → different canned quality) · rewrite a weak prompt into a strong one.
- **7.3 Calling an LLM API Safely** `{Thread}` · client→**proxy**→model, why keys never ship, request/response shape · **diagram + mock chatbot** calling a simulated `/api/ask` · build the chatbot UI; wire it to the real proxy (hands-on). _Pairs with Phase 2d._
- **7.4 Structured Output & Tool Calling** · JSON mode, schemas, function/tool calling loop · **bespoke tool-calling simulator** (mock model "decides" to call a tool) · define a schema; parse structured output.
- **7.5 Embeddings & Semantic Search** · meaning as vectors, similarity, nearest-neighbor · **bespoke 2D embedding-space visualizer** (words as dots; search finds neighbors) · build a tiny semantic search over sample docs (precomputed vectors).
- **7.6 RAG: Chat With Your Own Notes** · retrieve→augment→generate, chunking, why RAG · **bespoke RAG pipeline stepper** + mock "chat with these notes" · assemble a RAG prompt from retrieved chunks.
- **7.7 AI in the UI** · streaming, loading/empty/error states, guardrails, refusals · **bespoke streaming-text + guardrail-filter demo** · add streaming and a refusal guardrail to a mock chat.
- **7.8 AI Economics & Model Selection** `{Thread 3}` · token pricing, input/output cost, small vs large, routing/fallbacks · **bespoke token-cost calculator** (→ cost/call, /user/day, /month) + model picker · napkin-estimate an app's monthly bill.
- **7.9 Context Engineering** · the context window, what to include/trim/prioritize, memory vs context · **bespoke context-window packer** (fill a fixed budget; trim to fit) · fit a long conversation into a token budget.
- **7.10 Capstone: AI-Enabled Web App (L4)** · combine S7; ship it · scaffold + Ladder L4 checklist · build, **deploy**, cost-estimate, and guardrail a real AI-enabled app (via the real proxy).

### Sector 8 — AI-Native & Agents (accent: pink)  ·  _simulated model_
- **8.1 AI-Native vs AI-Enabled** · designing *around* the model vs bolting AI on · comparison diagram + **bespoke app classifier** · redesign an "AI-enabled" app to be AI-native.
- **8.2 The Agent Loop** · reason → act → observe, when to loop, stopping conditions · **bespoke loop animator** (mock agent solves a task step by step) · trace and author an agent loop.
- **8.3 Tool-Using Agents** · tools as the agent's hands, tool schemas, choosing tools · **bespoke agent-with-tools simulator** (calculator/search) · add a new tool the agent can call.
- **8.4 Multi-Step Planning & Memory** · decomposition, plans, short/long-term memory · **bespoke planner + memory-store visualizer** · give the agent memory across steps.
- **8.5 Connecting Agents to Real Systems (MCP)** · what MCP is, servers/tools/resources, safety · **diagram** agent↔MCP server↔systems (conceptual) · map a set of tools to an MCP server.
- **8.6 Evals** · why eval, test sets, expected outputs, LLM-as-judge, regression · **bespoke eval-runner** (inputs→expected; score a mock model) · write five evals for an agent.
- **8.7 Observability & Tracing** · logging prompts/outputs/tokens/cost/latency, finding failures · **bespoke trace viewer** · read a trace and locate the failing step.
- **8.8 Capstone: Small Autonomous Agent (L5)** · combine S8 + an eval suite · scaffold + Ladder L5 checklist · build a small agent **with evals** and observability.

### Sector 9 — Engineering Craft (accent: orange)
- **9.1 Testing Basics** · why test, unit tests, assertions, arrange-act-assert · JS sandbox with a **tiny assert harness** · write tests for a function.
- **9.2 Debugging Methodology** · reproduce → isolate → hypothesize → fix → verify · **bespoke buggy-scenario** walked through the method · debug a broken feature systematically.
- **9.3 Using AI as a Coding Partner** `{Thread 1}` · prompt well, read critically, verify, own it · **bespoke "review the AI's code" widget** (AI output with a subtle bug to catch) · critique and fix AI-generated code.
- **9.4 Code Quality & Refactoring** · naming, DRY, small functions, readability · JS sandbox before/after · refactor messy code without changing behavior.
- **9.5 Security & Privacy Basics** · input validation, XSS, secrets, least privilege, PII · **bespoke "spot the vulnerability" widget** · find and fix planted issues.
- **9.6 AI Security** · prompt injection, data exfiltration, key safety, output guardrails · **bespoke prompt-injection demo** (malicious input hijacks a mock agent) · defend an agent against injection.
- **9.7 CI/CD & Deploy Pipelines** · build→test→deploy, automation, rollbacks · **bespoke pipeline stepper** (reuse the launch-sequence widget style) · author a build→test→ship pipeline. _Best after a real deploy exists._
- **9.8 Final Capstone: AI-Native Product (L5)** · the whole academy, shipped · capstone brief + full Ladder L5 checklist · ship a real AI-native product on the Architect's Stack — free tier, **evals, architecture diagram, monitored public URL**.

---

## 6. Open questions (defaults chosen if you don't weigh in)
1. **AI demos:** simulated/mock model in lesson pages, real proxy only in capstones (free & offline)? _Default: yes._
2. **Depth per page:** match the current live pages' depth (~5 rich sections, real runnable practice)? _Default: yes — consistency matters for a product._
3. **Sequencing vs Phase 2:** OK to build content in parallel, but land S5.3/5.6 and the AI capstones *after* their Phase 2 counterparts so they reference the real thing? _Default: yes._
4. **Batch cadence:** build sector-by-sector with an in-browser verification gate per batch before flipping pages live? _Default: yes._

---

## 7. Effort shape
57 pages in ~6 batches (§4). Each batch: parallel authoring via subagents → orchestrator
verification in-browser → fix → flip `status` to `live` + regenerate `missions-data.js`. The
dashboard's progress toward "69 / 69" is the visible burndown.
