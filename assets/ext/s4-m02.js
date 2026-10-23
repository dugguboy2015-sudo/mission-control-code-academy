/* Mission 4.2 — Async JavaScript: auto-checks + quiz bank
   (The starter already demonstrates items 1 and 3.) */
(function () {
  const lines = (ctx) => (ctx.run && ctx.run.outputEl ? Array.from(ctx.run.outputEl.children) : []);
  MCCA.ext("s4-m02", {
    objectives: {
      ch2: (ctx) => {
        if (ctx.error) return false;
        const bodies = ctx.src.split(/async\s+function\b|async\s*\(/).slice(1);
        return bodies.some((b) => (b.match(/\bawait\b/g) || []).length >= 2) && lines(ctx).length >= 3;
      },
      ch4: (ctx) => !ctx.error && /new\s+Promise\(\s*(function\s*\(\s*\w+\s*,\s*\w+\s*\)|\(\s*\w+\s*,\s*\w+\s*\)\s*=>)[\s\S]*?\breject\s*\(/.test(ctx.src),
      ch5: (ctx) => !ctx.error && /try\s*\{[\s\S]*?\bawait\b[\s\S]*?\}\s*catch\s*\(?[\s\S]*?console\.error\(/.test(ctx.src),
      // An error was caught AND the program carried on logging afterwards.
      ch6: (ctx) => {
        const l = lines(ctx);
        const e = l.findIndex((x) => x.classList.contains("log-error"));
        return e !== -1 && l.slice(e + 1).some((x) => !x.classList.contains("log-error")) && /catch/.test(ctx.src);
      },
    },
    quiz: [
      { q: "What does await do?", options: ["Freezes the whole browser", "Pauses THIS async function until the Promise settles, while other code keeps running", "Makes code run faster", "Cancels the Promise"], answer: 1, why: "Correct — only the async function waits; the page stays responsive." },
      { q: "Where can you use await?", options: ["Anywhere", "Inside a function declared async (or a module's top level)", "Only inside loops", "Only in HTML"], answer: 1, why: "Right — that's why the function gets the async keyword." },
      { q: "A Promise can end up…", options: ["Only resolved", "Resolved (success) or rejected (failure)", "Deleted", "Paused forever by design"], answer: 1, why: "Yes — pending, then either fulfilled or rejected." },
      { q: "What happens to an awaited Promise that rejects with no try/catch?", options: ["Nothing", "The error is thrown from the await and stops that function", "It retries", "It resolves to undefined"], answer: 1, why: "Correct — wrap risky awaits in try/catch." },
      { q: "contactRelay(); console.log(\"after\"); — contactRelay awaits a 2s wait first. Which logs first?", options: ["contactRelay's awaited line", "\"after\"", "They log at the same time", "Neither"], answer: 1, why: "Right — the call starts, hits await, and the next line runs immediately." },
    ],
  });
})();
