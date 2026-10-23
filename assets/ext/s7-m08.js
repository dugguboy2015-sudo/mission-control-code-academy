/* Mission 7.8 — AI Economics: auto-checks + quiz bank */
(function () {
  const num = (src, key) => Array.from(src.matchAll(new RegExp(key + "\\s*:\\s*([\\d_.]+)", "g"))).map((m) => Number(m[1].replace(/_/g, "")));
  MCCA.ext("s7-m08", {
    objectives: {
      // A class of 30 at YOUR estimated rate (not the starter's placeholder of 8).
      ch1: (ctx) => !ctx.error && num(ctx.src, "users").includes(30) && num(ctx.src, "requestsPerUserPerDay").some((n) => n !== 8)
        && num(ctx.src, "avgInputTokens").length > 0 && num(ctx.src, "avgOutputTokens").length > 0,
      ch2: (ctx) => !ctx.error && (ctx.src.match(/estimateLLMCost\(/g) || []).length >= 2 && new Set(num(ctx.src, "inputPricePerMillion")).size >= 2
        && (ctx.output.match(/\$\d/g) || []).length >= 2,
      ch3: (ctx) => {
        if (ctx.error || (ctx.src.match(/routeModel\(/g) || []).length < 3 && !/(forEach|for\s*\(|map\()[\s\S]*routeModel\(/.test(ctx.src)) return false;
        return new Set(ctx.output.match(/(small-fast|mid-tier|large-reasoning)-model/g) || []).size >= 2;
      },
      ch4: (ctx) => !ctx.error && /callWithFallback\(/.test(ctx.src) && /throw\s+new\s+Error/.test(ctx.src) && ctx.output.trim().length > 0,
    },
    quiz: [
      { q: "LLM APIs usually charge by…", options: ["The hour", "Tokens — input and output counted separately", "The number of users", "Lines of code"], answer: 1, why: "Correct — and output tokens often cost more." },
      { q: "Model routing means…", options: ["Sending every question to the biggest model", "Sending easy questions to a cheap model and hard ones to a stronger model", "Using a VPN", "Random selection"], answer: 1, why: "Right — big savings, same quality where it matters." },
      { q: "What does a fallback protect against?", options: ["Typos", "The primary model being down or timing out", "High prices", "Long prompts"], answer: 1, why: "Yes — the app keeps working on a backup." },
      { q: "Cost per call × calls per day × days. 1,500 calls/day at $0.001 each, for 30 days, is about…", options: ["$1.50", "$45", "$450", "$4,500"], answer: 1, why: "Correct — 1,500 × 0.001 × 30 = $45." },
      { q: "The cheapest way to cut AI costs is often…", options: ["Shorter, tighter prompts and caching repeated answers", "Buying a GPU", "Turning off guardrails", "More retries"], answer: 0, why: "Right — fewer tokens and no repeated work." },
    ],
  });
})();
