/* Mission 8.7 — Observability: auto-checks + quiz bank */
(function () {
  const fiveCalls = (ctx) => (ctx.src.match(/AILogger\.call\(/g) || []).length >= 5 || /(for\s*\(|forEach\(|while\s*\()[\s\S]*AILogger\.call\(/.test(ctx.src);
  MCCA.ext("s8-m07", {
    objectives: {
      ch1: (ctx) => !ctx.error && fiveCalls(ctx) && /AILogger\.call\(\s*["'`][^"'`]*fail/i.test(ctx.src),
      ch2: (ctx) => !ctx.error && fiveCalls(ctx) && /getStats\(\)/.test(ctx.src) && /total/i.test(ctx.output) && /(success|rate)/i.test(ctx.output) && /latency|ms/i.test(ctx.output),
      ch3: (ctx) => !ctx.error && /getFailures\(\)/.test(ctx.src) && /(error|fail)/i.test(ctx.output),
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /\btrace\b/i.test(c)),
    },
    quiz: [
      { q: "Why log every AI call, not just the failures?", options: ["Storage is free", "You need the full picture — success rate, latency and cost over time", "Logs are required by law", "No reason"], answer: 1, why: "Correct — you can't spot trends without the normal cases." },
      { q: "Average latency tells you…", options: ["How accurate answers are", "How long calls typically take to come back", "How many users you have", "Your bill"], answer: 1, why: "Right — and a sudden jump means something changed." },
      { q: "What does a trace ID let you do?", options: ["Encrypt logs", "Group every call that belonged to one user request or agent run, end to end", "Delete logs", "Speed up calls"], answer: 1, why: "Yes — follow one request through many steps." },
      { q: "Which should NEVER be written to logs?", options: ["Latency", "Model name", "Passwords, API keys and private personal data", "Success/failure"], answer: 2, why: "Correct — logs get read by many people and tools." },
      { q: "Success rate drops from 99% to 80% overnight. First move?", options: ["Ignore it", "Check the failures log for a common error message", "Delete the logs", "Switch off monitoring"], answer: 1, why: "Right — the failures tell you what broke." },
    ],
  });
})();
