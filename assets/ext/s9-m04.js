/* Mission 9.4 — Code Quality: auto-checks + quiz bank (the starter already demonstrates item 1) */
(function () {
  function smells(code) {
    const el = document.getElementById("smellDisplay");
    const before = el ? el.innerHTML : null;
    try { return window.detectCodeSmells(code) || []; } catch (e) { return null; } finally { if (el) el.innerHTML = before; }
  }
  // Your own refactor: a code string that isn't the smelly original or the example.
  const mine = (ctx) => Array.from(ctx.src.matchAll(/`([\s\S]{25,}?)`/g)).map((m) => m[1])
    .filter((s) => !/function greetCaptain[\s\S]*function greetEngineer/.test(s) && !ctx.known.some((k) => k.includes(s.trim())));
  const dup = (list) => list.some((x) => /Duplicated line/.test(x));
  const magic = (list) => list.some((x) => /Magic number/.test(x));
  MCCA.ext("s9-m04", {
    objectives: {
      ch2: (ctx) => !ctx.error && mine(ctx).some((s) => { const l = smells(s); return !!l && !dup(l) && /function\s+\w+\s*\(\s*\w+\s*,\s*\w+/.test(s); }),
      ch3: (ctx) => !ctx.error && mine(ctx).some((s) => { const l = smells(s); return !!l && !magic(l) && /const\s+[A-Z][A-Z0-9_]*\s*=\s*[\d.]+/.test(s); }),
      ch4: (ctx) => {
        if (ctx.error || (ctx.src.match(/detectCodeSmells\(/g) || []).length < 2) return false;
        const starterSnippet = ((ctx.known[0] || "").match(/`([\s\S]*?)`/) || [])[1] || "";
        const original = smells(starterSnippet) || [];
        return mine(ctx).some((s) => { const l = smells(s); return !!l && l.length < Math.max(original.length, 1); });
      },
    },
    quiz: [
      { q: "What is a \"code smell\"?", options: ["A syntax error", "A pattern that works but hints at a deeper design problem", "Slow code", "A virus"], answer: 1, why: "Correct — duplication and magic numbers are classic smells." },
      { q: "What's a magic number?", options: ["A random number generator", "An unexplained literal like 0.15 buried in code", "A very large number", "π"], answer: 1, why: "Right — name it: const STANDARD_TIP_PERCENT = 0.15." },
      { q: "Two functions are identical except for one word. Best refactor?", options: ["Leave them", "One shared function that takes that word as a parameter", "Copy them a third time", "Delete both"], answer: 1, why: "Yes — DRY: Don't Repeat Yourself." },
      { q: "Refactoring means…", options: ["Adding new features", "Improving the structure WITHOUT changing what the code does", "Deleting tests", "Rewriting in another language"], answer: 1, why: "Correct — behavior stays the same; tests prove it." },
      { q: "Why do good names matter so much?", options: ["They don't", "Code is read far more often than it's written — names are the documentation", "Shorter names run faster", "Linters require them"], answer: 1, why: "Right — future-you is the main reader." },
    ],
  });
})();
