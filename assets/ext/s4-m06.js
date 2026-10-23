/* Mission 4.6 — Capstone: API App: auto-checks + quiz bank
   The starter is a complete reference app, so each check also requires the
   code to be mostly YOUR OWN (not the starter or an example lightly edited). */
(function () {
  const own = (ctx) => !ctx.error && ctx.copiedRatio() < 0.5 && ctx.src.split("\n").filter((l) => l.trim()).length >= 20;
  MCCA.ext("s4-m06", {
    objectives: {
      ch1: (ctx) => own(ctx) && /\bfetch\(\s*["'`]https:\/\//.test(ctx.src) && /createElement\(\s*["']input["']\s*\)|<input/.test(ctx.src) && /addEventListener\(/.test(ctx.src),
      ch4: (ctx) => own(ctx) && /\.ok\b/.test(ctx.src) && /throw\s+new\s+Error|\.ok\)\s*\{|!\s*\w+\.ok/.test(ctx.src),
      ch5: (ctx) => own(ctx) && /(hidden\s*=\s*true|textContent\s*=\s*["']{2}|innerHTML\s*=\s*["']{2})/.test(ctx.src),
      ch6: (ctx) => own(ctx) && /localStorage\.setItem\(/.test(ctx.src) && /localStorage\.getItem\(/.test(ctx.src) && /["'`][\w-]+[_:.\/][\w.:-]+["'`]/.test(ctx.src),
    },
    quiz: [
      { q: "Why show a loading state?", options: ["It looks cool", "So users know something is happening and don't click again or give up", "APIs require it", "It makes requests faster"], answer: 1, why: "Correct — silence feels broken." },
      { q: "What's the difference between a network error and a 404?", options: ["None", "Network error: the request never got an answer. 404: the server answered \"not found\"", "404 is worse", "Network errors only happen on phones"], answer: 1, why: "Right — they need different messages and different handling." },
      { q: "Why reset error and result state at the start of each search?", options: ["To save memory", "So a stale error doesn't linger under a fresh, successful result", "APIs require it", "It doesn't matter"], answer: 1, why: "Yes — every search should start from a clean slate." },
      { q: "Why namespace a localStorage key like \"myapp:lastSearch\"?", options: ["Required by browsers", "So it can't collide with another feature's key on the same site", "It's faster", "It encrypts it"], answer: 1, why: "Correct — a little prefix prevents painful overwrites." },
      { q: "What belongs in a README?", options: ["Your passwords", "What the project does, how to run it, and what it depends on", "Every line of code", "Nothing — READMEs are optional"], answer: 1, why: "Right — it's the front door for anyone (including future you)." },
    ],
  });
})();
