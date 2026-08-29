/* ============================================================
   MISSION CONTROL CODE ACADEMY — SHARED SITE CHROME
   Starfield, copy buttons, quiz, checklist persistence + auto
   mission-complete detection, dynamic prev/next nav, progress.
   Requires assets/missions-data.js loaded first (window.MISSION_MANIFEST).
   ============================================================ */
(function () {
  "use strict";

  const PROGRESS_KEY = "mcca_progress";

  /* ---------------- Manifest helpers (shared with index.html) ---------------- */
  function flattenMissions() {
    const manifest = window.MISSION_MANIFEST;
    const list = [];
    if (!manifest) return list;
    manifest.sectors.forEach((sector) => {
      sector.missions.forEach((m) => {
        list.push(Object.assign({ sectorId: sector.id, sectorName: sector.name, sectorAccent: sector.accent }, m));
      });
    });
    return list;
  }

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function setMissionComplete(missionId, complete) {
    const progress = getProgress();
    if (complete) progress[missionId] = true;
    else delete progress[missionId];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    // Fire-and-forget sync to Supabase when a child profile is active — the
    // localStorage write above already gave the UI its instant, synchronous
    // update; this just persists it server-side so it follows the child
    // across devices. Silently no-ops when Academy/Supabase isn't wired up.
    if (window.Academy && window.Academy.progress.isRemote()) {
      window.Academy.progress.markComplete(missionId, complete).catch((e) => console.error("[Academy] markComplete failed:", e));
    }
  }

  window.MCCA = { flattenMissions, getProgress, setMissionComplete };

  /* ---------------- Remote sync (Phase 2 — runs before the rest of boot) ----------------
     If a Supabase-backed child profile is active, pull that child's progress/theme/
     checklist-for-this-mission down into the SAME localStorage keys everything else
     already reads synchronously. This makes the remote data show up correctly on
     first paint without rewriting every read site to be async. Writes stay
     write-through (see setMissionComplete above and the checklist/theme call sites
     below) so the two stay in sync afterward. */
  async function syncFromRemote(missionId) {
    if (!window.Academy || !window.Academy.progress.isRemote()) return;
    try {
      const [remoteProgress, remoteTheme] = await Promise.all([
        window.Academy.progress.all(),
        window.Academy.progress.getTheme(),
      ]);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(remoteProgress));
      localStorage.setItem(THEME_KEY, remoteTheme);

      if (missionId) {
        const remoteChecklist = await window.Academy.checklist.get(missionId);
        localStorage.setItem("mcca_checklist_" + missionId, JSON.stringify(remoteChecklist));
      }
    } catch (e) {
      console.error("[Academy] remote sync failed, continuing with local data:", e);
    }
  }
  // Exposed so other scripts (e.g. index.html's own DOMContentLoaded listener)
  // can explicitly await this themselves rather than relying on the order two
  // independent async DOMContentLoaded listeners happen to run in — awaiting
  // it twice is safe (idempotent, just re-fetches) and removes the race.
  window.MCCA.syncFromRemote = syncFromRemote;

  /* ---------------- Starfield ---------------- */
  function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    }
    function initStars() {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.005,
        });
      }
    }
    function drawStars(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(s.phase + t * s.speed));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 236, 251, ${twinkle * 0.6})`;
        ctx.fill();
      }
      requestAnimationFrame(drawStars);
    }
    resizeCanvas();
    initStars();
    requestAnimationFrame(drawStars);
    window.addEventListener("resize", () => {
      resizeCanvas();
      initStars();
    });
  }

  /* ---------------- Copy buttons ---------------- */
  function initCopyButtons() {
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-copy");
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.textContent;
          btn.textContent = "COPIED";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove("copied");
          }, 1400);
        });
      });
    });
  }

  /* ---------------- Quiz buttons (data-correct="true"/"false") ---------------- */
  function initQuizzes() {
    document.querySelectorAll(".quiz-feedback").forEach((feedbackEl) => {
      const group = feedbackEl.parentElement;
      const buttons = group.querySelectorAll(".quiz-btn");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const correct = btn.getAttribute("data-correct") === "true";
          buttons.forEach((b) => b.classList.remove("correct", "wrong"));
          if (correct) {
            btn.classList.add("correct");
            feedbackEl.textContent = btn.getAttribute("data-feedback") || "Correct.";
            feedbackEl.style.color = "var(--success)";
          } else {
            btn.classList.add("wrong");
            feedbackEl.textContent = btn.getAttribute("data-feedback") || "Not quite. Try another option.";
            feedbackEl.style.color = "var(--danger)";
          }
        });
      });
    });
  }

  /* ---------------- Checklist persistence + auto mission-complete ---------------- */
  function initChecklist(missionId) {
    const boxes = document.querySelectorAll(".checklist input[type='checkbox']");
    if (!boxes.length || !missionId) return;
    const storeKey = "mcca_checklist_" + missionId;

    function load() {
      try {
        return JSON.parse(localStorage.getItem(storeKey)) || {};
      } catch (e) {
        return {};
      }
    }
    function save(state) {
      localStorage.setItem(storeKey, JSON.stringify(state));
    }
    function checkAllComplete() {
      const allChecked = Array.from(boxes).every((b) => b.checked);
      if (allChecked) {
        setMissionComplete(missionId, true);
        updateStamp(missionId);
      }
    }

    const state = load();
    boxes.forEach((box) => {
      if (state[box.id]) box.checked = true;
      box.addEventListener("change", () => {
        const s = load();
        s[box.id] = box.checked;
        save(s);
        checkAllComplete();
        if (window.Academy && window.Academy.progress.isRemote()) {
          window.Academy.checklist.set(missionId, box.id, box.checked).catch((e) => console.error("[Academy] checklist sync failed:", e));
        }
      });
    });
  }

  /* ---------------- Mission Complete stamp (click to toggle manually too) ---------------- */
  function updateStamp(missionId) {
    const stamp = document.getElementById("missionStamp");
    if (!stamp || !missionId) return;
    const complete = !!getProgress()[missionId];
    stamp.textContent = complete ? "✓ MISSION COMPLETE" : "◌ MARK MISSION COMPLETE";
    stamp.classList.toggle("is-complete", complete);
    stamp.classList.toggle("not-complete", !complete);
  }

  function initStamp(missionId) {
    const stamp = document.getElementById("missionStamp");
    if (!stamp || !missionId) return;
    updateStamp(missionId);
    stamp.addEventListener("click", () => {
      const nowComplete = !getProgress()[missionId];
      setMissionComplete(missionId, nowComplete);
      updateStamp(missionId);
    });
  }

  /* ---------------- Dynamic prev/next nav ---------------- */
  function initMissionNav(missionId) {
    const nav = document.getElementById("missionNav");
    if (!nav || !missionId) return;
    const list = flattenMissions();
    const idx = list.findIndex((m) => m.id === missionId);
    if (idx === -1) return;

    const prev = idx > 0 ? list[idx - 1] : null;
    const next = idx < list.length - 1 ? list[idx + 1] : null;

    function filename(path) {
      return path.split("/").pop();
    }

    let html = "";
    if (prev && prev.status !== "planned") {
      html += `<a href="${filename(prev.file)}">◂ MISSION ${prev.num}: ${prev.title.toUpperCase()}</a>`;
    } else if (prev) {
      html += `<a class="disabled" href="#">◂ MISSION ${prev.num}: NOT YET BUILT</a>`;
    } else {
      html += `<a class="disabled" href="#">◂ START OF ACADEMY</a>`;
    }
    html += `<a href="../dashboard.html">MISSION INDEX</a>`;
    if (next && next.status !== "planned") {
      html += `<a href="${filename(next.file)}">MISSION ${next.num}: ${next.title.toUpperCase()} ▸</a>`;
    } else if (next) {
      html += `<a class="disabled" href="#">MISSION ${next.num}: NOT YET BUILT ▸</a>`;
    } else {
      html += `<a class="disabled" href="#">FINAL MISSION ▸</a>`;
    }
    nav.innerHTML = html;
  }

  /* ---------------- Theme (dark default / light) ---------------- */
  const THEME_KEY = "mcca_theme";

  function getTheme() {
    try { return localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { return "dark"; }
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.textContent = theme === "light" ? "☾" : "☀";
      btn.title = theme === "light" ? "Switch to dark" : "Switch to light";
    });
  }
  function toggleTheme() {
    const next = getTheme() === "light" ? "dark" : "light";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme(next);
    if (window.Academy && window.Academy.progress.isRemote()) {
      window.Academy.progress.setTheme(next).catch((e) => console.error("[Academy] theme sync failed:", e));
    }
  }
  // Apply as early as possible to minimize flash.
  applyTheme(getTheme());
  window.MCCA.toggleTheme = toggleTheme;

  /* ---------------- Sidebar navigator (mission pages) ---------------- */
  function pathFilename(p) { return p.split("/").pop(); }

  function buildSidebar(missionId) {
    const manifest = window.MISSION_MANIFEST;
    if (!manifest) return;
    const progress = getProgress();

    const DOT = { cyan: "#4ee1ff", purple: "#b083ff", orange: "#ff9d4d", green: "#4dffb4", pink: "#ff6ec7", yellow: "#ffe66d" };

    let total = 0, done = 0;
    let navHtml = "";
    manifest.sectors.forEach((sector) => {
      navHtml += `<div class="mcca-nav-sector"><span class="s-dot" style="background:${DOT[sector.accent] || "#4ee1ff"}"></span>S${sector.num} · ${sector.name}</div>`;
      sector.missions.forEach((m) => {
        total++;
        const isDone = !!progress[m.id];
        if (isDone) done++;
        const isPlanned = m.status === "planned";
        const isCurrent = m.id === missionId;
        const cls = "mcca-nav-link" + (isCurrent ? " current" : "") + (isPlanned ? " planned" : "");
        const href = isPlanned ? "#" : pathFilename(m.file);
        navHtml += `<a class="${cls}" href="${href}">`
          + `<span class="mcca-nav-check${isDone ? " done" : ""}">${isDone ? "✓" : ""}</span>`
          + `<span class="m-num">${m.num}</span>`
          + `<span class="mcca-nav-title">${m.title}</span></a>`;
      });
    });
    const pct = total ? Math.round((done / total) * 100) : 0;

    const hamburger = document.createElement("button");
    hamburger.className = "mcca-hamburger";
    hamburger.setAttribute("aria-label", "Toggle navigation");
    hamburger.innerHTML = "☰";

    const aside = document.createElement("aside");
    aside.className = "mcca-sidebar";
    aside.innerHTML =
      `<div class="mcca-sidebar-head">`
      + `<a class="mcca-home" href="../dashboard.html">◈ MISSION CONTROL</a>`
      + `<button class="mcca-theme-toggle" data-theme-toggle aria-label="Toggle theme"></button>`
      + `</div>`
      + `<div class="mcca-sidebar-progress"><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="lbl">${done} / ${total} MISSIONS COMPLETE</div></div>`
      + `<nav class="mcca-nav">${navHtml}</nav>`;

    document.body.appendChild(hamburger);
    document.body.appendChild(aside);
    applyTheme(getTheme());

    function setOpen(open) {
      aside.classList.toggle("open", open);
      document.body.classList.toggle("mcca-push", open);
      try { localStorage.setItem("mcca_sidebar_open", open ? "1" : "0"); } catch (e) {}
    }
    hamburger.addEventListener("click", () => setOpen(!aside.classList.contains("open")));
    aside.querySelector(".mcca-theme-toggle").addEventListener("click", toggleTheme);

    // Default: open on wide screens, remember the user's choice otherwise.
    let stored = null;
    try { stored = localStorage.getItem("mcca_sidebar_open"); } catch (e) {}
    const defaultOpen = window.innerWidth >= 1100;
    setOpen(stored === null ? defaultOpen : stored === "1");

    // Scroll the current mission into view within the sidebar.
    const cur = aside.querySelector(".mcca-nav-link.current");
    if (cur) cur.scrollIntoView({ block: "center" });
  }

  /* ---------------- Floating theme toggle (non-mission pages) ---------------- */
  function injectFloatingThemeToggle() {
    if (document.querySelector("[data-theme-toggle]")) return;
    const btn = document.createElement("button");
    btn.className = "mcca-theme-float";
    btn.setAttribute("data-theme-toggle", "");
    btn.setAttribute("aria-label", "Toggle theme");
    btn.addEventListener("click", toggleTheme);
    document.body.appendChild(btn);
    applyTheme(getTheme());
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    initStarfield();
    initCopyButtons();
    initQuizzes();

    const missionId = document.body.getAttribute("data-mission-id");
    // Pull remote progress/theme/checklist (if a child profile is active) into
    // localStorage BEFORE the sync-only UI below reads it, so first paint is correct.
    await syncFromRemote(missionId);

    if (missionId) {
      initChecklist(missionId);
      initStamp(missionId);
      initMissionNav(missionId);
      buildSidebar(missionId);
    } else {
      injectFloatingThemeToggle();
    }
  });
})();
