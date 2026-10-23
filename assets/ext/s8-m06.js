/* Mission 8.6 — Evals: auto-checks (they inspect the real EVAL_CASES) + quiz bank */
(function () {
  const ORIG = (window.EVAL_CASES || []).map((c) => c.name);
  const added = () => (window.EVAL_CASES || []).filter((c) => c && !ORIG.includes(c.name) && typeof c.check === "function");
  const rowFor = (ctx, name, verdict) => ctx.output.split("\n").some((l) => l.includes(verdict + ": " + name)) || new RegExp("(✓|✗)\\s*" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(ctx.display) && ctx.display.includes(verdict === "PASS" ? "✓ " + name : "✗ " + name);
  MCCA.ext("s8-m06", {
    objectives: {
      // Property checks look at qualities (includes, length, typeof…) rather than one exact string.
      ch1: (ctx) => !ctx.error && added().filter((c) => !/===?\s*["'`]|["'`]\s*===?/.test(String(c.check))).length >= 2,
      ch2: (ctx) => !ctx.error && /runEvalSuite\(/.test(ctx.src) && added().filter((c) => rowFor(ctx, c.name, "PASS")).length >= 2,
      ch3: (ctx) => !ctx.error && /runEvalSuite\(/.test(ctx.src) && added().some((c) => rowFor(ctx, c.name, "FAIL")),
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /(judge|tone|helpful|kind|clear|creative|quality|friendly|polite|accurate|relevan|empath)/i.test(c)),
    },
    quiz: [
      { q: "What is an eval?", options: ["A JavaScript function that runs code", "A repeatable test that checks whether AI output meets your requirements", "An error", "A model"], answer: 1, why: "Correct — the AI equivalent of a test suite." },
      { q: "Why check a PROPERTY (\"mentions Paris\", \"under 10 words\") instead of an exact string?", options: ["It's shorter", "Model wording varies run to run — properties stay stable while exact text doesn't", "Exact strings are illegal", "No reason"], answer: 1, why: "Right — test what matters, not the exact phrasing." },
      { q: "You change a prompt and one eval starts failing. That's called…", options: ["A feature", "A regression — the change broke something that used to work", "A hallucination", "A fallback"], answer: 1, why: "Yes — evals catch regressions before users do." },
      { q: "LLM-as-judge means…", options: ["The model goes to court", "Using a model to grade qualities rules can't easily check, like tone or helpfulness", "Users vote", "Random scoring"], answer: 1, why: "Correct — useful, but check the judge too." },
      { q: "When should you run your eval suite?", options: ["Once, at launch", "Every time you change a prompt, model or tool", "Never", "Only when users complain"], answer: 1, why: "Right — just like running tests before you ship." },
    ],
  });
})();
