/* Mission 8.3 — Tool-Using Agents: auto-checks + quiz bank */
(function () {
  const toolNames = () => (window.AVAILABLE_TOOLS || []).map((t) => t.name);
  MCCA.ext("s8-m03", {
    objectives: {
      ch1: (ctx) => {
        if (ctx.error) return false;
        const calls = (ctx.src.match(/chooseTool\(/g) || []).length;
        if (calls < 3 && !/(forEach|for\s*\(|map\()[\s\S]*chooseTool\(/.test(ctx.src)) return false;
        return toolNames().filter((n) => ctx.output.includes(n)).length >= 3;
      },
      ch2: (ctx) => !ctx.error && /forceFail\s*:\s*true/.test(ctx.src) && /runToolAgent\(/.test(ctx.src) && ctx.output.trim().length > 0,
      ch3: (ctx) => {
        const m = ctx.src.match(/name\s*:\s*["']([\w-]+)["'][\s\S]{0,300}?description\s*:\s*["'`]([^"'`]{20,})["'`][\s\S]{0,400}?parameters\s*:/);
        return !!m && !toolNames().includes(m[1]);
      },
      ch4: (ctx) => /read[- ]?only/i.test(ctx.comments) && /\bwrite\b/i.test(ctx.comments) && /send_reminder/.test(ctx.comments),
    },
    quiz: [
      { q: "How does a model decide which tool to call?", options: ["Randomly", "From each tool's name and DESCRIPTION — so descriptions must be clear", "From the tool's code", "Alphabetically"], answer: 1, why: "Correct — a vague description means wrong tool choices." },
      { q: "Why treat \"write\" tools (send, delete, buy) more carefully than read-only ones?", options: ["They're slower", "Their effects are real and may not be undoable — they often need confirmation", "They cost more", "No reason"], answer: 1, why: "Right — reading is safe to retry; sending isn't." },
      { q: "A tool call fails. A well-built agent…", options: ["Crashes", "Notices the failure and tells the user honestly, or tries another approach", "Makes up the result", "Ignores it"], answer: 1, why: "Yes — failure is an observation too." },
      { q: "Which is a better tool description?", options: ["\"weather\"", "\"Get the current weather for a city. Input: city name. Returns temperature and conditions.\"", "\"tool 2\"", "\"does stuff\""], answer: 1, why: "Correct — say what it does, what it needs and what it returns." },
      { q: "Should an agent get every tool you can think of?", options: ["Yes, more is better", "No — give it only the tools the task needs (least privilege)", "Only on weekends", "Tools don't matter"], answer: 1, why: "Right — fewer tools, fewer ways to go wrong." },
    ],
  });
})();
