/* ============================================================
   MISSION CONTROL CODE ACADEMY — ENGAGEMENT ENGINE
   XP, ranks, streaks, badges, auto-checked objectives, quizzes.

   Load order: after academy.js (needs window.MCCA), before sandbox.js
   is fine either way — this file only listens for sandbox `mcca:run`
   events, it never calls the runners.

   DESIGN RULES
   • One source of truth: XP / rank / streak / badges are COMPUTED from
     the activity log + mission progress, never stored as totals.
   • Local-first: every event lands in localStorage immediately and is
     mirrored to Supabase (`activity` table) when that exists. If the
     engagement schema hasn't been installed yet, everything still works
     locally and is backfilled automatically once it is.
   • XP only for verified actions: objectives the code actually passed,
     quiz questions answered right on the FIRST try, missions finished.
     Self-ticked checklist items earn nothing.
   • Nobody gets stuck: an auto-check that refuses to pass after a few
     genuine attempts offers "mark it myself (no XP)".
   ============================================================ */
(function () {
  "use strict";

  const M = window.MCCA || (window.MCCA = {});
  const BASE = (document.currentScript && document.currentScript.src || "").replace(/engagement\.js.*$/, "");

  /* ---------------- tuning ---------------- */
  const XP = { objective: 20, quizFirstTry: 10, mission: 50, capstone: 150, sidequest: 40 };
  const SIDE_QUEST_TOTAL = 12;     // keep in sync with side-quests.html
  const ESCAPE_AFTER_MS = 120000; // "mark it myself" appears after 3 tries AND 2 minutes

  const RANKS = [
    { id: "cadet", name: "Cadet", min: 0, insignia: "◇" },
    { id: "ensign", name: "Ensign", min: 400, insignia: "◆" },
    { id: "lieutenant", name: "Lieutenant", min: 1200, insignia: "◆◆" },
    { id: "lt-commander", name: "Lieutenant Commander", min: 2600, insignia: "◆◆◆" },
    { id: "commander", name: "Commander", min: 4500, insignia: "★" },
    { id: "captain", name: "Captain", min: 7000, insignia: "★★" },
    { id: "admiral", name: "Admiral", min: 10000, insignia: "★★★" },
  ];

  // Each test receives the computed stats object (see computeStats).
  const BADGES = [
    { id: "liftoff", icon: "🚀", name: "Liftoff", desc: "Pass your first auto-checked objective.", test: (s) => s.objectives >= 1 },
    { id: "first-mission", icon: "🎖️", name: "First Mission", desc: "Complete your first mission.", test: (s) => s.completed >= 1 },
    { id: "ten-missions", icon: "🔟", name: "Double Digits", desc: "Complete 10 missions.", test: (s) => s.completed >= 10 },
    { id: "sharpshooter", icon: "🎯", name: "Sharpshooter", desc: "Answer 25 quiz questions right on the first try.", test: (s) => s.quizFirstTry >= 25 },
    { id: "quiz-ace", icon: "🧠", name: "Quiz Ace", desc: "Answer 100 quiz questions right on the first try.", test: (s) => s.quizFirstTry >= 100 },
    { id: "streak-3", icon: "🔥", name: "Warming Up", desc: "Learn 3 days in a row.", test: (s) => s.longestStreak >= 3 },
    { id: "streak-7", icon: "⚡", name: "Week Warrior", desc: "Learn 7 days in a row.", test: (s) => s.longestStreak >= 7 },
    { id: "streak-30", icon: "🌟", name: "Unstoppable", desc: "Learn 30 days in a row.", test: (s) => s.longestStreak >= 30 },
    { id: "solo-flight", icon: "🛩️", name: "Solo Flight", desc: "Finish a mission's challenge without opening its hint.", test: (s) => s.soloFlights >= 1 },
    { id: "first-deploy", icon: "🌐", name: "First Deploy", desc: "Complete Mission 4.5 — ship something to the real internet.", test: (s) => s.done("s4-m05") },
    { id: "live-wire", icon: "🔌", name: "Live Wire", desc: "Talk to a real AI model through your own proxy.", test: (s) => s.aiCalls >= 1 },
    { id: "agent-builder", icon: "🤖", name: "Agent Builder", desc: "Complete the Sector 8 capstone agent.", test: (s) => s.done("s8-m08") },
    { id: "side-quester", icon: "🗺️", name: "Side Quester", desc: "Complete 5 side quests.", test: (s) => s.sidequests >= 5 },
    { id: "quest-master", icon: "🏆", name: "Quest Master", desc: "Complete every side quest.", test: (s) => s.sidequestTotal > 0 && s.sidequests >= s.sidequestTotal },
    { id: "graduate", icon: "🎓", name: "Graduate", desc: "Complete the final capstone.", test: (s) => s.done("s9-m08") },
  ];
  // One "Sector N Cleared" badge per sector, generated from the manifest.
  function sectorBadges() {
    const manifest = window.MISSION_MANIFEST;
    if (!manifest) return [];
    return manifest.sectors.map((sec) => ({
      id: "sector-" + sec.num,
      icon: "🛰️",
      name: "Sector " + sec.num + " Cleared",
      desc: "Complete every mission in " + sec.name + ".",
      test: (s) => s.sectorsCleared.includes(sec.id),
    }));
  }
  function allBadges() { return BADGES.concat(sectorBadges()); }

  /* ---------------- who is learning? (sync, from Academy session state) ---------------- */
  function childKey() {
    const A = window.Academy;
    if (!A) return "local";
    const active = A.session && A.session.getActiveChild();
    if (active) return active;
    const link = A.childLink && A.childLink.getSession();
    return (link && link.childId) || "local";
  }

  /* ---------------- activity store (localStorage-first, Supabase mirror) ---------------- */
  let remoteState = "unknown"; // "unknown" | "ok" | "missing" | "error"

  const store = {
    key() { return "mcca_activity_" + childKey(); },
    load() {
      try { return JSON.parse(localStorage.getItem(store.key())) || []; } catch (e) { return []; }
    },
    save(list) {
      try { localStorage.setItem(store.key(), JSON.stringify(list)); } catch (e) {}
    },
    has(kind, ref) { return store.load().some((a) => a.kind === kind && a.ref === ref); },
  };

  function remoteEnabled() {
    return window.Academy && window.Academy.progress && window.Academy.progress.isRemote() && remoteState !== "missing";
  }

  async function sync() {
    if (!window.Academy || !window.Academy.progress.isRemote()) return;
    try {
      const remote = await window.Academy.activity.all();
      remoteState = "ok";
      const local = store.load();
      const seen = new Set(remote.map((a) => a.kind + "|" + a.ref));
      const localOnly = local.filter((a) => !seen.has(a.kind + "|" + a.ref));
      // Backfill anything earned offline / before the schema existed.
      await Promise.allSettled(localOnly.map((a) => window.Academy.activity.log(a.kind, a.ref, a.correct, a.xp)));
      store.save(remote.concat(localOnly));
    } catch (e) {
      remoteState = e && e.missingSchema ? "missing" : "error";
      if (!e || !e.missingSchema) console.error("[engage] activity sync failed, using local copy:", e);
    }
  }

  /**
   * Record an event once (per child, kind, ref). Returns true if it was new.
   * opts: { correct, xp, quiet }
   */
  function log(kind, ref, opts) {
    opts = opts || {};
    if (store.has(kind, ref)) return false;
    const before = computeStats();
    const entry = { kind, ref, correct: opts.correct === undefined ? null : opts.correct, xp: opts.xp || 0, created_at: new Date().toISOString() };
    const list = store.load();
    list.push(entry);
    store.save(list);
    if (remoteEnabled()) {
      window.Academy.activity.log(kind, ref, entry.correct, entry.xp).catch((e) => {
        if (e && e.missingSchema) remoteState = "missing";
        else console.error("[engage] activity log failed (kept locally):", e);
      });
    }
    if (!opts.quiet && entry.xp > 0) toast("+" + entry.xp + " XP", opts.label || "", "xp");
    afterChange(before);
    return true;
  }

  /* ---------------- stats ---------------- */
  function dayKey(iso) {
    const d = new Date(iso);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function computeStreaks(days) {
    if (!days.size) return { current: 0, longest: 0 };
    const sorted = Array.from(days).sort();
    let longest = 1, run = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + "T12:00:00");
      const cur = new Date(sorted[i] + "T12:00:00");
      const diff = Math.round((cur - prev) / 86400000);
      run = diff === 1 ? run + 1 : 1;
      if (run > longest) longest = run;
    }
    const today = new Date();
    const key = (d) => dayKey(d.toISOString());
    let cursor = new Date(today);
    if (!days.has(key(cursor))) cursor.setDate(cursor.getDate() - 1); // today not started yet — streak still alive
    let current = 0;
    while (days.has(key(cursor))) { current++; cursor.setDate(cursor.getDate() - 1); }
    return { current, longest: Math.max(longest, current) };
  }

  function computeStats(activityList, progressMap) {
    const acts = activityList || store.load();
    const progress = progressMap || (M.getProgress ? M.getProgress() : {});
    const missions = M.flattenMissions ? M.flattenMissions() : [];
    const capstones = new Set(missions.filter((m) => m.capstone).map((m) => m.id));

    let xp = 0;
    acts.forEach((a) => { if (a.kind !== "badge") xp += a.xp || 0; });
    const completedIds = missions.filter((m) => progress[m.id]).map((m) => m.id);
    completedIds.forEach((id) => { xp += capstones.has(id) ? XP.capstone : XP.mission; });

    let rankIdx = 0;
    RANKS.forEach((r, i) => { if (xp >= r.min) rankIdx = i; });
    const rank = RANKS[rankIdx];
    const next = RANKS[rankIdx + 1] || null;
    const pctToNext = next ? Math.min(100, Math.round(((xp - rank.min) / (next.min - rank.min)) * 100)) : 100;

    const days = new Set(acts.filter((a) => a.kind !== "badge" && a.kind !== "hint").map((a) => dayKey(a.created_at)));
    const streaks = computeStreaks(days);

    const manifest = window.MISSION_MANIFEST;
    const sectorsCleared = manifest ? manifest.sectors
      .filter((s) => s.missions.length && s.missions.every((m) => progress[m.id]))
      .map((s) => s.id) : [];

    const objectiveMissions = new Set(acts.filter((a) => a.kind === "objective").map((a) => a.ref.split("/")[0]));
    const hinted = new Set(acts.filter((a) => a.kind === "hint").map((a) => a.ref));
    const soloFlights = completedIds.filter((id) => objectiveMissions.has(id) && !hinted.has(id)).length;

    return {
      xp, rank, rankIdx, next, pctToNext,
      streak: streaks.current, longestStreak: streaks.longest,
      completed: completedIds.length,
      totalMissions: missions.length,
      objectives: acts.filter((a) => a.kind === "objective").length,
      quizFirstTry: acts.filter((a) => a.kind === "quiz" && a.correct).length,
      quizAnswered: acts.filter((a) => a.kind === "quiz").length,
      // "daily:<date>" entries are the daily-quest bonus, not separate quests.
      sidequests: acts.filter((a) => a.kind === "sidequest" && !/^daily:/.test(a.ref)).length,
      sidequestTotal: SIDE_QUEST_TOTAL,
      aiCalls: acts.filter((a) => a.kind === "ai").length,
      soloFlights,
      sectorsCleared,
      badges: new Set(acts.filter((a) => a.kind === "badge").map((a) => a.ref.replace(/^badge:/, ""))),
      done: (id) => !!progress[id],
    };
  }

  /* ---------------- reactions to change: rank-ups, badges, HUD refresh ---------------- */
  function seenRankKey() { return "mcca_seen_rank_" + childKey(); }

  function afterChange(before) {
    const after = computeStats();
    awardBadges(after);
    if (before && after.rankIdx > before.rankIdx) showRankUp(after.rank);
    try { localStorage.setItem(seenRankKey(), after.rank.id); } catch (e) {}
    document.dispatchEvent(new CustomEvent("mcca:stats", { detail: after }));
  }

  function awardBadges(stats, quiet) {
    const s = stats || computeStats();
    allBadges().forEach((b) => {
      if (s.badges.has(b.id)) return;
      let earned = false;
      try { earned = b.test(s); } catch (e) { earned = false; }
      if (!earned) return;
      // Record without re-entering afterChange (badges carry no XP).
      const list = store.load();
      if (list.some((a) => a.kind === "badge" && a.ref === "badge:" + b.id)) return;
      list.push({ kind: "badge", ref: "badge:" + b.id, correct: null, xp: 0, created_at: new Date().toISOString() });
      store.save(list);
      s.badges.add(b.id);
      if (remoteEnabled()) window.Academy.activity.log("badge", "badge:" + b.id, null, 0).catch(() => {});
      if (!quiet) toast(b.icon + " Badge unlocked", b.name, "badge");
    });
  }

  /** Called by academy.js the moment a mission flips to complete. */
  function onMissionComplete(missionId, before) {
    const m = (M.flattenMissions ? M.flattenMissions() : []).find((x) => x.id === missionId);
    const xp = m && m.capstone ? XP.capstone : XP.mission;
    toast("+" + xp + " XP", "Mission complete" + (m ? " · " + m.num : ""), "xp");
    afterChange(before);
  }

  /* ---------------- UI: toasts ---------------- */
  let toastHost = null;
  const toastQueue = [];
  let toastBusy = 0;
  function toast(title, sub, kind) {
    if (!toastHost) {
      toastHost = document.createElement("div");
      toastHost.className = "mcca-toasts";
      toastHost.setAttribute("aria-live", "polite");
      toastHost.setAttribute("role", "status");
      document.body.appendChild(toastHost);
    }
    toastQueue.push({ title, sub, kind });
    pumpToasts();
  }
  function pumpToasts() {
    while (toastBusy < 3 && toastQueue.length) {
      const t = toastQueue.shift();
      toastBusy++;
      const el = document.createElement("div");
      el.className = "mcca-toast mcca-toast-" + (t.kind || "info");
      el.innerHTML = '<strong></strong><span></span>';
      el.querySelector("strong").textContent = t.title;
      el.querySelector("span").textContent = t.sub || "";
      toastHost.appendChild(el);
      setTimeout(() => {
        el.classList.add("leaving");
        setTimeout(() => { el.remove(); toastBusy--; pumpToasts(); }, 350);
      }, t.kind === "badge" ? 4200 : 2600);
    }
  }

  /* ---------------- UI: rank-up moment ---------------- */
  function showRankUp(rank) {
    const overlay = document.createElement("div");
    overlay.className = "mcca-rankup";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "mccaRankupTitle");
    overlay.innerHTML =
      '<div class="mcca-rankup-card">'
      + '<div class="mcca-rankup-burst" aria-hidden="true"></div>'
      + '<div class="mcca-rankup-insignia"></div>'
      + '<div class="mcca-rankup-label">PROMOTION</div>'
      + '<h2 id="mccaRankupTitle"></h2>'
      + '<p>Mission Control has recognized your work. Keep flying.</p>'
      + '<button type="button" class="mcca-rankup-btn">CONTINUE</button>'
      + '</div>';
    overlay.querySelector(".mcca-rankup-insignia").textContent = rank.insignia;
    overlay.querySelector("h2").textContent = rank.name.toUpperCase();
    const close = () => { overlay.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape" || e.key === "Enter") close(); };
    overlay.querySelector("button").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    overlay.querySelector("button").focus();
  }

  /* ---------------- UI: HUD (rank, XP bar, streak) ---------------- */
  function hudHtml(s) {
    const nextTxt = s.next ? (s.next.min - s.xp) + " XP to " + s.next.name : "Top rank reached";
    return '<div class="mcca-hud">'
      + '<div class="mcca-hud-top">'
      + '<span class="mcca-hud-insignia" aria-hidden="true">' + s.rank.insignia + '</span>'
      + '<span class="mcca-hud-rank">' + s.rank.name.toUpperCase() + '</span>'
      + '<span class="mcca-hud-streak" title="Days in a row">' + (s.streak > 0 ? "🔥 " + s.streak : "🔥 0") + '</span>'
      + '</div>'
      + '<div class="mcca-hud-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + s.pctToNext + '" aria-label="Progress to next rank"><div style="width:' + s.pctToNext + '%"></div></div>'
      + '<div class="mcca-hud-meta"><span>' + s.xp.toLocaleString() + ' XP</span><span>' + nextTxt + '</span></div>'
      + '</div>';
  }
  function mountHud(el) {
    if (!el) return;
    const render = () => { el.innerHTML = hudHtml(computeStats()); };
    render();
    document.addEventListener("mcca:stats", render);
  }

  /* ---------------- mission extension loader (assets/ext/<id>.js) ---------------- */
  const registry = {};
  M.ext = function (missionId, def) { registry[missionId] = def || {}; };
  function loadExt(missionId) {
    return new Promise((resolve) => {
      if (registry[missionId]) return resolve(registry[missionId]);
      const s = document.createElement("script");
      s.src = BASE + "ext/" + missionId + ".js";
      s.onload = () => resolve(registry[missionId] || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }

  /* ---------------- objectives engine ---------------- */
  function stripComments(code, kind) {
    if (kind === "python") return code.replace(/#.*$/gm, "");
    if (kind === "sql") return code.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    if (kind === "html") return code.replace(/<!--[\s\S]*?-->/g, "");
    return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
  }
  function extractComments(code, kind) {
    if (kind === "python") return (code.match(/#.*$/gm) || []).join("\n");
    if (kind === "sql") return (code.match(/--.*$/gm) || []).join("\n");
    if (kind === "html") return (code.match(/<!--[\s\S]*?-->/g) || []).join("\n");
    return ((code.match(/\/\*[\s\S]*?\*\//g) || []).concat(code.match(/(?:^|[^:"'`\\])\/\/.*$/gm) || [])).join("\n");
  }

  function buildCtx(lastRun) {
    const run = lastRun || null;
    const kind = run ? run.kind : "js";
    const code = run ? run.code || "" : "";
    const out = run && run.outputEl ? run.outputEl.innerText || "" : "";
    const dispEl = run && run.displayId ? document.getElementById(run.displayId) : null;
    const ctx = {
      run, kind, code,
      src: stripComments(code, kind),          // code with comments removed — use for "did they write X"
      comments: extractComments(code, kind),   // just the comments — use for "explain in a comment"
      output: out,
      display: dispEl ? dispEl.innerText || "" : "",
      displayEl: dispEl,
      error: !!(run && run.error),
      frameDoc: run && run.frame ? run.frame.contentDocument : null,
      $: (sel) => document.querySelector(sel),
      $$: (sel) => Array.from(document.querySelectorAll(sel)),
      text: (sel) => { const el = document.querySelector(sel); return el ? el.innerText || el.textContent || "" : ""; },
      val: (sel) => { const el = document.querySelector(sel); return el ? el.value || "" : ""; },
      count: (re, str) => ((str === undefined ? code : str).match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g")) || []).length,
      words: (str) => (String(str || "").match(/[A-Za-z]{2,}/g) || []).length,
      authored: !!(run && run.authored),
      known: (run && run.known) || [],
      // Share of the cadet's non-blank lines copied verbatim from the starter
      // or an example (0 = all their own, 1 = untouched copy).
      copiedRatio: () => {
        const known = new Set(((run && run.known) || []).join("\n").split("\n").map((l) => l.trim()).filter(Boolean));
        const mine = code.split("\n").map((l) => l.trim()).filter((l) => l && !/^[{}()[\];,]*$/.test(l));
        return mine.length ? mine.filter((l) => known.has(l)).length / mine.length : 1;
      },
      // Re-run the cadet's JS against an inert stand-in DOM and hand back the
      // named top-level bindings, so a check can CALL their functions:
      //   const { linearSearch } = ctx.grab("linearSearch");
      grab: (...names) => {
        if (kind !== "js" || !code) return {};
        const inert = new Proxy(function () {}, {
          get: (t, p) => (p === Symbol.toPrimitive ? () => "" : p === "length" ? 0 : inert),
          set: () => true, apply: () => inert, construct: () => inert,
        });
        const quiet = { log() {}, error() {}, warn() {}, table() {}, info() {} };
        const ret = "return {" + names.map((n) => JSON.stringify(n) + ": (typeof " + n + " !== 'undefined' ? " + n + " : undefined)").join(",") + "};";
        try { return new Function("console", "document", code + "\n;" + ret)(quiet, inert) || {}; } catch (e) { return {}; }
      },
      // Value of a field ONLY if the cadet changed it from every preset —
      // the bespoke-simulator equivalent of the sandbox `authored` rule.
      edited: (sel, presets) => {
        const el = document.querySelector(sel);
        const v = el ? el.value || "" : "";
        const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
        if (!norm(v)) return "";
        return (presets || []).some((p) => norm(p) === norm(v)) ? "" : v;
      },
      win: window,
    };
    return ctx;
  }

  function initObjectives(missionId, def) {
    const objectives = (def && def.objectives) || {};
    const ids = Object.keys(objectives);
    const boxes = Array.from(document.querySelectorAll(".checklist input[type='checkbox']"));
    if (!boxes.length) return;

    const trigger = def.trigger || "run"; // "run" | "interaction" | "both"
    let lastRun = null;
    let attempts = 0;

    boxes.forEach((box) => {
      const li = box.closest("li");
      if (!li) return;
      const auto = ids.includes(box.id);
      li.classList.add(auto ? "obj-auto" : "obj-self");
      const tag = document.createElement("span");
      tag.className = "obj-tag";
      tag.textContent = auto ? "AUTO-CHECK" : "SELF-CHECK";
      tag.title = auto
        ? "Checks itself the moment your work actually does this — earns XP."
        : "Can't be checked automatically (it happens outside this page) — tick it yourself when done.";
      li.appendChild(tag);
      if (!auto) return;

      // Auto items can't be ticked by hand — unless the escape hatch opened.
      box.addEventListener("click", (e) => {
        if (!e.isTrusted || li.classList.contains("obj-unlocked") || box.checked) return;
        e.preventDefault();
        flashNote(li, trigger === "interaction"
          ? "This one checks itself when you actually do it above."
          : "This one checks itself — write the code in the Command Console and hit RUN.");
      });
    });

    function setChecked(box) {
      box.checked = true;
      box.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function passed(id) {
      const box = document.getElementById(id);
      return !!(box && box.checked);
    }

    function evaluate() {
      if (trigger !== "interaction" && !(lastRun && lastRun.authored) && trigger !== "both") return;
      const ctx = buildCtx(lastRun);
      ids.forEach((id) => {
        if (passed(id)) return;
        const box = document.getElementById(id);
        if (!box) return;
        let ok = false;
        try { ok = !!objectives[id](ctx); } catch (e) { ok = false; }
        if (!ok) return;
        setChecked(box);
        const li = box.closest("li");
        if (li) { li.classList.add("obj-just-passed"); setTimeout(() => li.classList.remove("obj-just-passed"), 1600); }
        log("objective", missionId + "/" + id, { xp: XP.objective, label: "Objective verified" });
      });
      maybeUnlockEscapes();
    }

    // After a few genuine attempts spread over a couple of minutes, never
    // leave a cadet stuck on a check that might be stricter than it should
    // be. (Time-gated too: the HTML preview re-runs on every keystroke, so
    // a raw run count alone would open the hatch after three letters.)
    let firstAttemptAt = 0;
    function maybeUnlockEscapes() {
      if (attempts && !firstAttemptAt) {
        firstAttemptAt = Date.now();
        setTimeout(maybeUnlockEscapes, ESCAPE_AFTER_MS + 500);
      }
      if (attempts < 3 || Date.now() - firstAttemptAt < ESCAPE_AFTER_MS) return;
      ids.forEach((id) => {
        if (passed(id)) return;
        const box = document.getElementById(id);
        const li = box && box.closest("li");
        if (!li || li.querySelector(".obj-escape")) return;
        const a = document.createElement("button");
        a.type = "button";
        a.className = "obj-escape";
        a.textContent = "Did it, but it won't check? Mark it myself (no XP)";
        a.addEventListener("click", () => {
          li.classList.add("obj-unlocked");
          setChecked(box);
          a.remove();
        });
        li.appendChild(a);
      });
    }

    const recheck = () => { evaluate(); setTimeout(evaluate, 400); setTimeout(evaluate, 1500); setTimeout(evaluate, 4000); };

    // Async work (a fetch, a 15-second sort animation, awaited timers)
    // finishes long after the click or run — re-check whenever the page
    // settles, for a minute after the cadet last did something.
    let lastAct = 0, mt = null;
    new MutationObserver(() => {
      if (Date.now() - lastAct > 60000) return;
      clearTimeout(mt);
      mt = setTimeout(evaluate, 700);
    }).observe(document.querySelector(".content-wrap") || document.body, { childList: true, subtree: true, characterData: true });

    document.addEventListener("mcca:run", (e) => {
      if (trigger === "interaction") return;
      lastRun = e.detail;
      if (e.detail && e.detail.authored) { attempts++; lastAct = Date.now(); recheck(); }
    });

    if (trigger === "interaction" || trigger === "both") {
      let t = null;
      const onAct = (e) => {
        if (!e.isTrusted) return;
        if (e.target && e.target.closest && e.target.closest(".checklist, .mcca-sidebar, .mcca-quiz")) return;
        if (e.type === "click") attempts++;
        lastAct = Date.now();
        clearTimeout(t);
        t = setTimeout(recheck, 250);
      };
      ["click", "input", "change", "keyup"].forEach((ev) => document.addEventListener(ev, onAct, true));
    }

    M.objectivesDebug = { evaluate, ctx: () => buildCtx(lastRun), ids };
  }

  function flashNote(li, text) {
    let n = li.querySelector(".obj-note");
    if (!n) {
      n = document.createElement("div");
      n.className = "obj-note";
      n.setAttribute("role", "status");
      li.appendChild(n);
    }
    n.textContent = text;
    n.classList.remove("show");
    void n.offsetWidth;
    n.classList.add("show");
  }

  /* ---------------- hint tracking (for the Solo Flight badge) ---------------- */
  function initHints(missionId) {
    document.querySelectorAll("details").forEach((d) => {
      const sum = d.querySelector("summary");
      if (!sum || !/HINT/i.test(sum.textContent)) return;
      d.addEventListener("toggle", () => { if (d.open) log("hint", missionId, { xp: 0, quiet: true }); });
    });
  }

  /* ---------------- quiz engine (multi-question, randomized, first-try XP) ---------------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function harvestOriginalQuiz() {
    const fb = document.querySelector(".quiz-feedback");
    if (!fb) return null;
    const group = fb.parentElement;
    const p = group.querySelector("p");
    const btns = Array.from(group.querySelectorAll(".quiz-btn"));
    if (!p || !btns.length) return null;
    const answer = btns.findIndex((b) => b.getAttribute("data-correct") === "true");
    return {
      group,
      q: { id: "q0", q: p.textContent.trim(), options: btns.map((b) => b.innerHTML), answer, why: btns[answer] ? btns[answer].getAttribute("data-feedback") || "Correct." : "Correct.", html: true },
    };
  }

  function initQuiz(missionId, def) {
    const original = harvestOriginalQuiz();
    if (!original) return;
    const bank = [original.q].concat(((def && def.quiz) || []).map((q, i) => Object.assign({ id: q.id || "q" + (i + 1) }, q)));
    if (bank.length < 2) return; // nothing extra to add — keep the original single question as-is

    const draw = shuffle(bank).slice(0, Math.min(4, bank.length));
    const group = original.group;
    group.classList.add("mcca-quiz");
    group.innerHTML =
      '<div class="mcca-quiz-head"><span>MISSION QUIZ</span><span class="mcca-quiz-score"></span></div>'
      + '<p class="mcca-quiz-sub">Questions are drawn from a bigger bank each visit. Right on the <strong>first</strong> try = +' + XP.quizFirstTry + ' XP.</p>';

    let answeredFirst = 0, rightFirst = 0;
    const scoreEl = group.querySelector(".mcca-quiz-score");
    const updateScore = () => { scoreEl.textContent = rightFirst + " / " + draw.length + " first-try"; };
    updateScore();

    draw.forEach((item, qi) => {
      const ref = missionId + "/" + item.id;
      const already = store.load().find((a) => a.kind === "quiz" && a.ref === ref);
      const card = document.createElement("div");
      card.className = "mcca-quiz-q";
      const qEl = document.createElement("p");
      qEl.className = "mcca-quiz-text";
      qEl.textContent = (qi + 1) + ". " + item.q;
      card.appendChild(qEl);
      if (already) {
        const tag = document.createElement("span");
        tag.className = "mcca-quiz-prev " + (already.correct ? "ok" : "miss");
        tag.textContent = already.correct ? "✓ earned before" : "answered before";
        qEl.appendChild(tag);
      }

      const opts = shuffle(item.options.map((o, i) => ({ o, i })));
      const fb = document.createElement("div");
      fb.className = "quiz-feedback";
      let firstDone = false;

      opts.forEach(({ o, i }) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "quiz-btn";
        if (item.html) b.innerHTML = o; else b.textContent = o;
        b.addEventListener("click", () => {
          const correct = i === item.answer;
          card.querySelectorAll(".quiz-btn").forEach((x) => x.classList.remove("correct", "wrong"));
          b.classList.add(correct ? "correct" : "wrong");
          if (!firstDone) {
            firstDone = true;
            answeredFirst++;
            if (correct) rightFirst++;
            updateScore();
            log("quiz", ref, { correct, xp: correct ? XP.quizFirstTry : 0, label: "Quiz · first try" });
          }
          fb.textContent = correct ? (item.why || "Correct.") : "Not quite — try another option.";
          fb.style.color = correct ? "var(--success)" : "var(--danger)";
          if (correct) card.classList.add("solved");
        });
        card.appendChild(b);
      });
      card.appendChild(fb);
      group.appendChild(card);
    });
  }

  /* ---------------- boot for a mission page ---------------- */
  async function bootMission(missionId) {
    try { localStorage.setItem("mcca_last_mission_" + childKey(), missionId); } catch (e) {}
    await sync();
    const def = (await loadExt(missionId)) || {};
    initObjectives(missionId, def);
    initQuiz(missionId, def);
    initHints(missionId);
    // First visit after the engagement layer shipped: award anything
    // already earned (e.g. sector badges from earlier progress) quietly
    // into the log, and remember the current rank without a fanfare.
    const s = computeStats();
    // First boot for this cadet: badges already earned before the engagement
    // layer existed are recorded silently — no wall of toasts.
    let firstBoot = false;
    try { firstBoot = !localStorage.getItem(seenRankKey()); } catch (e) {}
    awardBadges(s, firstBoot);
    try { if (firstBoot) localStorage.setItem(seenRankKey(), s.rank.id); } catch (e) {}
    document.dispatchEvent(new CustomEvent("mcca:stats", { detail: computeStats() }));
  }

  async function bootPage() {
    await sync();
    const s = computeStats();
    // First boot for this cadet: badges already earned before the engagement
    // layer existed are recorded silently — no wall of toasts.
    let firstBoot = false;
    try { firstBoot = !localStorage.getItem(seenRankKey()); } catch (e) {}
    awardBadges(s, firstBoot);
    try { if (firstBoot) localStorage.setItem(seenRankKey(), s.rank.id); } catch (e) {}
    document.dispatchEvent(new CustomEvent("mcca:stats", { detail: computeStats() }));
  }

  M.engage = {
    XP, RANKS, BADGES: allBadges, SIDE_QUEST_TOTAL,
    computeStats, log, sync, mountHud, toast, onMissionComplete,
    bootMission, bootPage, store, hudHtml, loadExt,
    remoteState: () => remoteState,
    lastMission: () => { try { return localStorage.getItem("mcca_last_mission_" + childKey()); } catch (e) { return null; } },
  };
})();
