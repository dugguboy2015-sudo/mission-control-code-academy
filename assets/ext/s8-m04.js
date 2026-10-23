/* Mission 8.4 — Planning & Memory: auto-checks + quiz bank */
(function () {
  // Item 3 needs a REAL page reload: remember a key on one visit, recall it on a later one.
  const PENDING = "mcca_s8m04_remembered";
  let earlier = null;
  try { earlier = JSON.parse(localStorage.getItem(PENDING)); } catch (e) {}
  document.addEventListener("mcca:run", (e) => {
    const d = e.detail;
    if (!d || d.error || !d.authored) return;
    const m = d.code.match(/AgentMemory\.remember\(\s*["'`]([^"'`]+)["'`]/);
    if (m) try { localStorage.setItem(PENDING, JSON.stringify(m[1])); } catch (err) {}
  });
  function newPlans(ctx) {
    if (typeof window.planTask !== "function") return [];
    return Array.from(ctx.src.matchAll(/(["'`])([^"'`\n]{6,})\1/g)).map((m) => m[2]).filter((goal) => {
      if (/trip/i.test(goal)) return false;
      try { const p = window.planTask(goal); return Array.isArray(p) && p.length >= 3; } catch (e) { return false; }
    });
  }
  MCCA.ext("s8-m04", {
    objectives: {
      ch1: (ctx) => !ctx.error && newPlans(ctx).length >= 1,
      ch2: (ctx) => {
        if (ctx.error || !newPlans(ctx).length) return false;
        const m = ctx.output.match(/Completed\s+(\d+)\s+of\s+(\d+)/) || ctx.output.match(/"completedSteps":\s*(\d+),\s*"totalSteps":\s*(\d+)/);
        return !!m && m[1] === m[2] && Number(m[1]) >= 3;
      },
      ch3: (ctx) => !ctx.error && !!earlier && new RegExp("AgentMemory\\.recall\\(\\s*[\"'`]" + earlier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(ctx.src)
        && !!window.AgentMemory && window.AgentMemory.recall(earlier) !== null,
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /(short|long|persist|forget|lost|reload|session|memory)/i.test(c)),
    },
    quiz: [
      { q: "Why have an agent write a plan before acting?", options: ["It looks smart", "Breaking a big goal into ordered steps makes each step simpler and easier to check", "Plans are required by APIs", "To use more tokens"], answer: 1, why: "Correct — decomposition is the core planning skill." },
      { q: "Short-term memory for an agent is usually…", options: ["A database", "The conversation/history inside the current run — gone when it ends", "Your hard drive", "The model's weights"], answer: 1, why: "Right — it lives only in the context." },
      { q: "Long-term memory (like AgentMemory) survives because…", options: ["Models remember everything", "It's written to real storage (here, localStorage) outside the run", "Browsers cache it", "It's in the prompt"], answer: 1, why: "Yes — persisted, then recalled later." },
      { q: "What should an agent NOT store in long-term memory?", options: ["A preferred unit like metric", "Passwords and other secrets", "A home city", "A favorite color"], answer: 1, why: "Correct — memory can leak; keep secrets out." },
      { q: "Step 2 of a plan fails. A good agent…", options: ["Continues as if it worked", "Notices, and replans or reports — later steps may depend on it", "Deletes the plan", "Starts over silently forever"], answer: 1, why: "Right — plans are hypotheses, not promises." },
    ],
  });
})();
