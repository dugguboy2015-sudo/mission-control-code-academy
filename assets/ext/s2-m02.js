/* Mission 2.2 — Conditionals: auto-checks (they actually call your function) + quiz bank */
(function () {
  function fn(ctx) {
    if (ctx.error) return null;
    const f = ctx.grab("checkDockingClearance").checkDockingClearance;
    return typeof f === "function" && f.length >= 3 ? f : null;
  }
  MCCA.ext("s2-m02", {
    objectives: {
      ch1: (ctx) => !!fn(ctx),
      ch2: (ctx) => !!fn(ctx) && /&&/.test(ctx.src),
      ch3: (ctx) => !!fn(ctx) && /\|\|/.test(ctx.src),
      // Three distinct answers across a spread of situations.
      ch4: (ctx) => {
        const f = fn(ctx); if (!f) return false;
        const out = new Set();
        [[100, true, false], [100, false, false], [5, true, false], [100, true, true], [50, false, true], [0, false, false], [30, true, false]]
          .forEach((a) => { try { out.add(JSON.stringify(f(...a))); } catch (e) {} });
        return out.size >= 3;
      },
      ch5: (ctx) => !!fn(ctx) && /[^?\s]\s*\?\s*[^.?\s:][^:\n]*:\s*\S/.test(ctx.src.replace(/\?\./g, "")),
      ch6: (ctx) => !!fn(ctx) && /\.textContent\s*=/.test(ctx.src) && /console\.log\(/.test(ctx.src)
        && ctx.display.trim() !== "" && !/STATUS: STANDBY/.test(ctx.display) && ctx.output.trim() !== "",
    },
    quiz: [
      { q: "What does && mean?", options: ["Either side can be true", "BOTH sides must be true", "Neither side is true", "Add the two values"], answer: 1, why: "Correct — && is AND: true only when both are true." },
      { q: "fuel < 10 || hostile — when is this true?", options: ["Only when both are true", "When at least one of them is true", "Never", "Only when fuel is exactly 10"], answer: 1, why: "Right — || is OR: one true side is enough." },
      { q: "What does !shieldsUp mean?", options: ["shieldsUp is very true", "The opposite of shieldsUp", "shieldsUp is undefined", "Delete shieldsUp"], answer: 1, why: "Yes — ! flips true to false and false to true." },
      { q: "const label = fuel > 50 ? \"FULL\" : \"LOW\"; — fuel is 20. What's label?", options: ["\"FULL\"", "\"LOW\"", "true", "20"], answer: 1, why: "Correct — the condition is false, so the ternary picks the value after the colon." },
      { q: "In an if / else if / else chain, how many branches run?", options: ["All of them", "Exactly one — the first whose condition is true (or else)", "Two", "It depends on the browser"], answer: 1, why: "Right — the chain stops at the first match." },
    ],
  });
})();
