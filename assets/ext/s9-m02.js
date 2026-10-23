/* Mission 9.2 — Debugging Methodology: auto-checks + quiz bank */
(function () {
  const STARTER_ITEMS = "[{ price: 20, qty: 2 }, { price: 5, qty: 1 }]";
  const ORIGINAL_PROCESS = window.processOrder; // the buggy one, before any fix
  MCCA.ext("s9-m02", {
    objectives: {
      // Your OWN reproducing input (not the starter's), shown to be wrong.
      ch1: (ctx) => !ctx.error && /(processOrder|traceCall)\(/.test(ctx.src) && !ctx.src.includes(STARTER_ITEMS) && /\bprice\s*:\s*\d/.test(ctx.src),
      ch2: (ctx) => !ctx.error && /traceCall\(/.test(ctx.src) && /subtotal/i.test(ctx.output) && /(applyDiscount|isWrong|true)/.test(ctx.output),
      ch3: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /(hypothes|I think|I suspect|probably|maybe|guess|predict)/i.test(c)),
      // A corrected discount step that really gives subtotal × (1 − pct/100).
      ch4: (ctx) => {
        if (ctx.error) return false;
        const fns = ctx.grab("applyDiscount", "processOrder");
        const f = typeof fns.applyDiscount === "function" ? fns.applyDiscount : null;
        if (f) { try { return Math.abs(f(45, 10) - 40.5) < 0.001 && Math.abs(f(200, 25) - 150) < 0.001; } catch (e) { return false; } }
        const p = typeof fns.processOrder === "function" && fns.processOrder !== ORIGINAL_PROCESS ? fns.processOrder : null;
        try { return !!p && Math.abs(p([{ price: 20, qty: 2 }, { price: 5, qty: 1 }], 10) - 40.5) < 0.001; } catch (e) { return false; }
      },
    },
    quiz: [
      { q: "What's the FIRST step in debugging?", options: ["Rewrite the whole file", "Reproduce the bug reliably with an exact input", "Ask someone else", "Add random console.logs everywhere"], answer: 1, why: "Correct — if you can't make it happen on demand, you can't prove you fixed it." },
      { q: "Why write a hypothesis BEFORE reading the suspect code?", options: ["It's tradition", "It forces a testable prediction, so you learn instead of guessing", "It's faster", "No reason"], answer: 1, why: "Right — confirm or reject it with evidence." },
      { q: "Tracing each step's value helps you find…", options: ["The CSS bug", "The FIRST step where a value goes wrong", "Who wrote the code", "The fastest step"], answer: 1, why: "Yes — everything after it is just a consequence." },
      { q: "\"Fix the root cause, not the symptom\" means…", options: ["Add +4.5 to the final total", "Repair the step that computes the wrong value, so every input is right", "Hide the total", "Round the numbers"], answer: 1, why: "Correct — a patch on the symptom breaks on the next input." },
      { q: "After fixing a bug, you should also…", options: ["Delete the reproduction", "Keep the reproducing input as a test so the bug can't sneak back", "Never mention it", "Rename the function"], answer: 1, why: "Right — every fixed bug becomes a regression test." },
    ],
  });
})();
