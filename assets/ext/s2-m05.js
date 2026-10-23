/* Mission 2.5 — Arrays: auto-checks (they read your real crew array) + quiz bank */
(function () {
  function crew(ctx) {
    if (ctx.error) return null;
    const c = ctx.grab("crew").crew;
    if (!Array.isArray(c) || c.length < 4) return null;
    return c.every((p) => p && typeof p.name === "string" && "role" in p && typeof p.xp === "number") ? c : null;
  }
  MCCA.ext("s2-m05", {
    objectives: {
      ch1: (ctx) => !!crew(ctx),
      ch2: (ctx) => !!crew(ctx) && /\bcrew\.map\(/.test(ctx.src),
      ch3: (ctx) => !!crew(ctx) && /\bcrew\.filter\([\s\S]{0,80}?\bxp\b/.test(ctx.src),
      ch4: (ctx) => !!crew(ctx) && /\bcrew\.find\(/.test(ctx.src),
      ch5: (ctx) => !!crew(ctx) && /\bcrew\.reduce\([\s\S]*?,\s*0\s*\)/.test(ctx.src),
      ch6: (ctx) => { const c = crew(ctx); return !!c && /console\.log\([^)]*crew\.length/.test(ctx.src) && ctx.output.includes(String(c.length)); },
    },
    quiz: [
      { q: "What does .map() return?", options: ["The same array, changed", "A NEW array with each item transformed", "One single value", "true or false"], answer: 1, why: "Correct — map never changes the original; it builds a new array." },
      { q: "What does .filter() return when nothing matches?", options: ["undefined", "null", "An empty array []", "An error"], answer: 2, why: "Right — filter always returns an array, possibly empty." },
      { q: "What does .find() return when nothing matches?", options: ["-1", "undefined", "[]", "false"], answer: 1, why: "Yes — find returns the first match or undefined." },
      { q: "What's the index of the LAST item in an array of length 5?", options: ["5", "4", "-1", "6"], answer: 1, why: "Correct — arrays start at 0, so the last index is length - 1." },
      { q: "Which method changes (mutates) the original array?", options: [".map()", ".filter()", ".push()", ".find()"], answer: 2, why: "Right — push adds to the original. map/filter/find leave it alone." },
    ],
  });
})();
