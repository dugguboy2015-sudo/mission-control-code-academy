/* Mission 7.3 — Calling LLM APIs Safely: auto-checks + quiz bank */
(function () {
  function ownMessages(ctx) {
    const sys = ctx.src.match(/role:\s*["']system["']\s*,\s*content:\s*(["'`])([\s\S]*?)\1/);
    const usr = ctx.src.match(/role:\s*["']user["']\s*,\s*content:\s*(["'`])([\s\S]*?)\1/);
    return !!sys && !!usr && sys[2] !== "You are a cheerful mission control assistant." && usr[2] !== "What's the status of the fuel tank?";
  }
  MCCA.ext("s7-m03", {
    objectives: {
      ch1: (ctx) => !ctx.error && ownMessages(ctx),
      ch2: (ctx) => !ctx.error && ownMessages(ctx) && /(FakeLLMProxy\.callChat|LiveAI\.chat)\(/.test(ctx.src) && ctx.output.trim().length > 10,
      ch3: (ctx) => !ctx.error && /FakeLLMProxy\.SECRET_KEY/.test(ctx.src) && /\bundefined\b/.test(ctx.output),
      ch4: (ctx) => /\bworkers?\b/i.test(ctx.comments) && /(secret|env|environment|wrangler|dashboard|variable|settings)/i.test(ctx.comments),
    },
    quiz: [
      { q: "Why must an LLM API key never be in front-end JavaScript?", options: ["It slows the page", "Anyone can open DevTools, copy it, and spend your money", "Browsers delete it", "It's fine if minified"], answer: 1, why: "Correct — front-end code is fully public." },
      { q: "What does a proxy (like a Cloudflare Worker) do here?", options: ["Makes the AI smarter", "Holds the secret key server-side and forwards requests on the browser's behalf", "Caches images", "Hosts the HTML"], answer: 1, why: "Right — the browser talks to YOUR proxy, the proxy talks to the AI." },
      { q: "In a chat API, the messages array holds…", options: ["Only the latest question", "The conversation so far — system, user and assistant turns", "Images only", "The API key"], answer: 1, why: "Yes — the model has no memory except what you send." },
      { q: "Besides hiding the key, what else should a proxy enforce?", options: ["Nothing", "Limits — like a daily quota and a max reply length — so nobody can run up costs", "Font sizes", "Dark mode"], answer: 1, why: "Correct — this academy's own proxy does exactly that." },
      { q: "A key was accidentally committed to a public repo. First step?", options: ["Delete the commit and relax", "Revoke/rotate the key immediately — assume it's already been copied", "Make the repo private", "Ignore it"], answer: 1, why: "Right — bots scan GitHub for keys within minutes." },
    ],
  });
})();
