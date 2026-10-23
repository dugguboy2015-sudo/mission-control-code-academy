/* Mission 5.6 — Serverless Backends: auto-checks + quiz bank */
(function () {
  const num = (src, key) => { const m = src.match(new RegExp(key + "\\s*:\\s*([\\d_.]+)")); return m ? Number(m[1].replace(/_/g, "")) : null; };
  // Your own honest estimate for a class of 30 — not the starter's placeholder of 5.
  const own = (ctx) => !ctx.error && num(ctx.src, "users") === 30 && num(ctx.src, "requestsPerUserPerDay") !== null && num(ctx.src, "requestsPerUserPerDay") !== 5;
  MCCA.ext("s5-m06", {
    objectives: {
      ch1: (ctx) => own(ctx),
      ch2: (ctx) => own(ctx) && num(ctx.src, "freeRequestsPerDay") === 100000 && /estimateUsage\(/.test(ctx.src) && /req\/day/.test(ctx.display),
      ch3: (ctx) => own(ctx) && /Well within the free tier/.test(ctx.display) && /\d+(\.\d+)?\s*%/.test(ctx.comments),
      ch4: (ctx) => !ctx.error && num(ctx.src, "users") === 50000 && num(ctx.src, "requestsPerUserPerDay") === 1 && /req\/day/.test(ctx.display),
    },
    quiz: [
      { q: "What does \"serverless\" really mean?", options: ["There's no server anywhere", "You write a function; the provider runs and scales the servers for you", "It only works offline", "It's free forever"], answer: 1, why: "Correct — the servers exist, you just don't manage them." },
      { q: "Why keep an API key in a serverless function instead of front-end JavaScript?", options: ["It's faster", "Anything in front-end code can be read by every visitor", "Browsers block keys", "It's not important"], answer: 1, why: "Right — the function holds the secret; the browser never sees it." },
      { q: "30 users × 20 requests/day against a 100,000/day free tier uses about…", options: ["0.6%", "6%", "60%", "600%"], answer: 0, why: "Yes — 600 / 100,000 = 0.6%. Small projects fit easily." },
      { q: "What usually makes a free tier run out?", options: ["Writing more code", "Many more users or requests than you planned — e.g. going viral", "Using comments", "Deploying twice"], answer: 1, why: "Correct — usage scales with traffic, not code size." },
      { q: "A Worker or serverless function is triggered by…", options: ["A cron job only", "An incoming request (or event) — it runs, responds, and stops", "Turning on your laptop", "A database backup"], answer: 1, why: "Right — request in, response out." },
    ],
  });
})();
