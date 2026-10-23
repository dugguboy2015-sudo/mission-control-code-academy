/* Mission 8.8 — Capstone: Agent: auto-checks + quiz bank */
(function () {
  const ORIG = (window.AGENT_EVAL_CASES || []).map((c) => c.name);
  const added = () => (window.AGENT_EVAL_CASES || []).filter((c) => c && !ORIG.includes(c.name) && typeof c.check === "function");
  const goals = (ctx) => new Set(Array.from(ctx.src.matchAll(/Agent\.run\(\s*(["'`])([\s\S]*?)\1/g)).map((m) => m[2]));
  const CF = /(workers?\b|pages\b|durable objects?|\bKV\b|\bD1\b|vectorize|workers ai|ai gateway|\bR2\b|queues)/gi;
  MCCA.ext("s8-m08", {
    objectives: {
      ch1: (ctx) => !ctx.error && goals(ctx).size >= 2 && (ctx.output.match(/answer/gi) || []).length >= 2,
      ch2: (ctx) => !ctx.error && /runAgentEvals\(/.test(ctx.src) && added().some((c) => ctx.display.includes("✓ " + c.name) || ctx.output.includes("PASS: " + c.name)),
      ch3: (ctx) => !ctx.error && added().length >= 1 && /runAgentEvals\(/.test(ctx.src) && /\d+\s*\/\s*\d+/.test(ctx.output),
      ch4: (ctx) => !ctx.error && goals(ctx).size >= 2 && /AgentLog\.getStats\(\)/.test(ctx.src) && /\{.*\}/.test(ctx.output),
      ch5: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /(data|inject|instruction|untrusted|trust|command)/i.test(c)),
      ch6: (ctx) => new Set((ctx.comments.match(CF) || []).map((s) => s.toLowerCase())).size >= 2 && /\b(UI|proxy|orchestrat|agent loop|model)\b/i.test(ctx.comments),
    },
    quiz: [
      { q: "What is prompt injection?", options: ["A faster prompt", "Text hidden in data (a note, a web page) that tries to trick the AI into following new instructions", "A syntax error", "A type of eval"], answer: 1, why: "Correct — and agents that read the web or files are exposed to it." },
      { q: "The best defense in this capstone was to…", options: ["Trust every note", "Treat retrieved content as DATA, never as instructions to obey", "Turn off tools", "Use a bigger model"], answer: 1, why: "Right — instructions come only from the user and system prompt." },
      { q: "Why run agent evals on every change?", options: ["For fun", "Agents have many moving parts; a small prompt or tool change can quietly break behavior", "They're free", "To slow releases"], answer: 1, why: "Yes — regressions hide in agents." },
      { q: "In the real architecture, where does the secret model API key live?", options: ["In the UI", "In the server-side proxy/orchestration layer (e.g. a Worker secret)", "In localStorage", "In the README"], answer: 1, why: "Correct — never in the browser." },
      { q: "AgentLog recording failed runs as well as successes lets you…", options: ["Hide problems", "See exactly where and how often the agent fails, then fix it", "Make the agent faster", "Skip evals"], answer: 1, why: "Right — observability closes the loop." },
    ],
  });
})();
