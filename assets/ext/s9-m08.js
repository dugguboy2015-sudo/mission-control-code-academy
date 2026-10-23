/* Mission 9.8 — Final Capstone: auto-check + quiz bank (the rest is a real, shipped product — self-checked) */
MCCA.ext("s9-m08", {
  objectives: {
    // YOUR project's description, with every readiness flag resolved.
    ch7: (ctx) => {
      if (ctx.error || !/runFinalReadinessCheck\(/.test(ctx.src) || ctx.copiedRatio() > 0.85) return false;
      const m = (ctx.output + "\n" + ctx.display).match(/(\d+)\s*\/\s*(\d+)/);
      return !!m && m[1] === m[2] && Number(m[2]) >= 10;
    },
  },
  quiz: [
    { q: "What does \"done\" mean for this capstone?", options: ["It runs on my laptop", "It's live at a public URL, works on a phone, and meets the readiness checklist", "The code is long", "A friend saw a screenshot"], answer: 1, why: "Correct — shipped, not just written." },
    { q: "Your AI feature is live. What proves it behaves correctly?", options: ["It worked once", "A set of eval cases you can re-run any time", "The model is popular", "Nobody complained yet"], answer: 1, why: "Right — evidence, repeatable." },
    { q: "Where does the architecture diagram's \"Edge API\" box run in this academy's stack?", options: ["On your laptop", "On Cloudflare Workers / Pages Functions", "In the browser", "In the README"], answer: 1, why: "Yes — the proxy that holds secrets and enforces limits." },
    { q: "Why write down your free-tier math?", options: ["For decoration", "So you know when growth will start costing money — before the bill arrives", "It's required by GitHub", "No reason"], answer: 1, why: "Correct — plan, don't get surprised." },
    { q: "The most important habit you've built across all 10 sectors is…", options: ["Memorizing syntax", "Build it, verify it, ship it — and stay honest about what works", "Using the newest framework", "Typing fast"], answer: 1, why: "That's the AI-native builder mindset. Well flown, Graduate." },
  ],
});
