/* Mission 8.2 — The Agent Loop: auto-checks + quiz bank (the starter already demonstrates item 1) */
MCCA.ext("s8-m02", {
  objectives: {
    ch2: (ctx) => !ctx.error && /runAgentLoop\([^)]*,\s*1\s*\)/.test(ctx.src) && /max iterations reached/.test(ctx.output),
    ch3: (ctx) => !ctx.error && /\.history\b/.test(ctx.src) && /observation/.test(ctx.output),
    ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /(forever|infinite|never stop|keep going|keeps going|loop|cost|money|bill|stuck)/i.test(c)),
  },
  quiz: [
    { q: "What are the three repeating steps of an agent loop?", options: ["Read, write, delete", "Reason (decide), Act (call a tool), Observe (read the result)", "Ask, wait, guess", "Plan, sleep, repeat"], answer: 1, why: "Correct — until the model decides it can give a final answer." },
    { q: "Why does an agent need a maxIterations limit?", options: ["For speed", "A confused agent could loop forever, burning time and money", "Tools require it", "It doesn't"], answer: 1, why: "Right — always cap the loop." },
    { q: "What does the agent's history hold?", options: ["Nothing", "Each step taken and the observation it produced", "Only the final answer", "The API key"], answer: 1, why: "Yes — the agent reasons over what it has already learned." },
    { q: "An agent hits maxIterations without an answer. A good app…", options: ["Pretends it succeeded", "Says honestly it couldn't finish and shows what it tried", "Restarts silently forever", "Crashes"], answer: 1, why: "Correct — honest failure beats a fake answer." },
    { q: "The difference between a chatbot and an agent is that the agent…", options: ["Is friendlier", "Can take actions with tools and use the results to decide what to do next", "Uses more emojis", "Never makes mistakes"], answer: 1, why: "Right — act, observe, continue." },
  ],
});
