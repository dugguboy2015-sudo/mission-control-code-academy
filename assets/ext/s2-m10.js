/* Mission 2.10 — Algorithmic Thinking: auto-checks (sandbox + animator) + quiz bank */
(function () {
  function search(ctx) {
    if (!ctx.authored || ctx.error) return null;
    const f = ctx.grab("linearSearch").linearSearch;
    if (typeof f !== "function") return null;
    try {
      const a = [42, 17, 89, 5, 63];
      return f(a, 42) === 0 && f(a, 63) === 4 && f(a, 89) === 2 && f(a, 7) === -1 && f([], 1) === -1 ? f : null;
    } catch (e) { return null; }
  }
  const final = (ctx, sel) => !!ctx.$(sel + ".is-final");
  MCCA.ext("s2-m10", {
    trigger: "both",
    objectives: {
      ch1: (ctx) => !!search(ctx),
      ch2: (ctx) => !!search(ctx) && (ctx.src.match(/linearSearch\s*\(/g) || []).length >= 4 && /-1/.test(ctx.output),
      ch4: (ctx) => final(ctx, "#ssBinaryResult") && /SORTED/.test(ctx.text("#ssSortStatus")) && !/UNSORTED/.test(ctx.text("#ssSortStatus")),
      ch5: (ctx) => /SORTED/.test(ctx.text("#ssSortStatus")) && !/UNSORTED/.test(ctx.text("#ssSortStatus")) && /Swaps: [1-9]/.test(ctx.text("#ssSortSteps")),
      ch6: (ctx) => final(ctx, "#ssLinearResult") && final(ctx, "#ssBinaryResult"),
    },
    quiz: [
      { q: "Linear search through 1,000 items — worst case, how many checks?", options: ["1", "10", "500", "1,000"], answer: 3, why: "Correct — if the target is last (or missing) you check every item." },
      { q: "Binary search through 1,000 SORTED items — roughly how many checks at most?", options: ["10", "100", "500", "1,000"], answer: 0, why: "Right — halving 1,000 about 10 times gets you down to one item." },
      { q: "What's an algorithm?", options: ["A programming language", "A precise step-by-step method for solving a problem", "A type of computer", "A bug"], answer: 1, why: "Yes — and you can describe one before writing any code." },
      { q: "Bubble sort repeatedly…", options: ["Picks a random item", "Compares neighbours and swaps them if they're out of order", "Splits the array in half", "Deletes duplicates"], answer: 1, why: "Correct — big values \"bubble\" to the end each pass." },
      { q: "Why does it matter how an algorithm SCALES?", options: ["It doesn't", "Something fine for 10 items may be far too slow for 10 million", "Faster code is always shorter", "Computers are infinitely fast"], answer: 1, why: "Right — growth rate matters more than speed on tiny inputs." },
    ],
  });
})();
