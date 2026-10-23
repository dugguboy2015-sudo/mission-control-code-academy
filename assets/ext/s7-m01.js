/* Mission 7.1 — What Is AI?: auto-checks (they inspect the real TOY_MODEL) + quiz bank */
(function () {
  const ORIGINAL = Object.keys(window.TOY_MODEL || {});
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function newPhrases() {
    const m = window.TOY_MODEL || {};
    return Object.keys(m).filter((k) => !ORIGINAL.includes(k) && Array.isArray(m[k]) && m[k].length >= 4
      && Math.abs(m[k].reduce((s, p) => s + (Array.isArray(p) ? Number(p[1]) || 0 : 0), 0) - 1) < 0.011);
  }
  // generate(<your phrase>, n, <temp>) three times — in a loop or written out.
  function ranThrice(ctx, tempTest) {
    return newPhrases().some((ph) => {
      const re = new RegExp("generate\\(\\s*([\"'`])" + esc(ph) + "\\1\\s*,\\s*\\d+\\s*,\\s*([\\d.]+)\\s*\\)", "g");
      const calls = Array.from(ctx.src.matchAll(re)).filter((m) => tempTest(Number(m[2])));
      if (!calls.length) return false;
      return calls.length >= 3 || /for\s*\(|while\s*\(|\.forEach\(/.test(ctx.src);
    });
  }
  MCCA.ext("s7-m01", {
    objectives: {
      ch1: (ctx) => !ctx.error && newPhrases().length >= 1,
      ch2: (ctx) => !ctx.error && ranThrice(ctx, (t) => t === 0),
      ch3: (ctx) => !ctx.error && ranThrice(ctx, (t) => t >= 1),
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /determin|same|random|differ|predict|chance/i.test(c)),
    },
    quiz: [
      { q: "At its core, what does a language model do?", options: ["Looks answers up in a database", "Predicts a likely next word (token), over and over", "Understands the world like a person", "Searches Google"], answer: 1, why: "Correct — very good next-token prediction, repeated." },
      { q: "Temperature 0 means…", options: ["The model is turned off", "Always pick the single most likely next token — the same output every time", "Maximum creativity", "The model runs cold and faster"], answer: 1, why: "Right — deterministic." },
      { q: "Why can an AI confidently say something false?", options: ["It's lying on purpose", "It predicts plausible-sounding text, which isn't the same as checking facts", "It's broken", "It never does"], answer: 1, why: "Yes — that's what \"hallucination\" means." },
      { q: "Where does a model's \"knowledge\" come from?", options: ["Live internet access, always", "Patterns learned from its training data", "A human typing answers", "Your computer's files"], answer: 1, why: "Correct — and it can be out of date." },
      { q: "Higher temperature (like 1.5) gives…", options: ["The same answer every time", "More varied, more surprising — sometimes weirder — output", "Faster answers", "Shorter answers"], answer: 1, why: "Right — less likely tokens get picked more often." },
    ],
  });
})();
