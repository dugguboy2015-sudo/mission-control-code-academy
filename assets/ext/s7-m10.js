/* Mission 7.10 — Capstone: AI-Enabled App: auto-checks + quiz bank */
MCCA.ext("s7-m10", {
  objectives: {
    ch1: (ctx) => !ctx.error && (ctx.src.match(/FakeAIApp\.chat\(/g) || []).length >= 3 && /getStats\(\)/.test(ctx.src) && /totalCost/.test(ctx.output),
    ch2: (ctx) => !ctx.error && /FakeAIApp\.chat\(\s*(["'`])(\1|[^"'`]*spamword)/.test(ctx.src) && /(Allowed:\s*false|"allowed":\s*false|Rejected|message is empty|banned word)/i.test(ctx.output + ctx.display),
    ch3: (ctx) => !ctx.error && /forceFail\s*:\s*true/.test(ctx.src) && /assistant \(fallback\)|backup model/.test(ctx.display + ctx.output),
    ch4: (ctx) => !ctx.error && /\.includes\(|\.test\(|\.some\(/.test(ctx.src) && /(function\b|=>)/.test(ctx.src)
      && /(blocked|rejected|banned|not allowed|flagged)/i.test(ctx.output),
    ch5: (ctx) => /\bworkers?\b/i.test(ctx.comments) && /\bgateway\b/i.test(ctx.comments) && /\$\s?\d/.test(ctx.comments),
  },
  quiz: [
    { q: "Why does a rejected message add zero cost?", options: ["It's free on weekends", "The guardrail stops it BEFORE any model call is made", "Costs are refunded", "It's a bug"], answer: 1, why: "Correct — cheap checks first, expensive calls only when allowed." },
    { q: "What does an AI Gateway (like Cloudflare's) add in front of a model provider?", options: ["Nothing", "Logging, caching, rate limiting and analytics for every AI call", "A new model", "Free tokens"], answer: 1, why: "Right — one place to watch and control AI traffic." },
    { q: "The primary model times out. A well-built app…", options: ["Shows an error page", "Falls back to a backup model and tells the user which one answered", "Retries forever", "Crashes"], answer: 1, why: "Yes — graceful degradation." },
    { q: "Ladder Level L4 for this capstone adds…", options: ["Dark mode", "Production concerns — guardrails, cost tracking and failover", "More pages", "A logo"], answer: 1, why: "Correct — it's about running reliably and affordably." },
    { q: "50 users × 10 messages/day × 30 days at $0.001 per message is about…", options: ["$1.50", "$15", "$150", "$1,500"], answer: 1, why: "Right — 15,000 messages × $0.001 = $15/month." },
  ],
});
