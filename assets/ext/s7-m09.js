/* Mission 7.9 — Context Engineering: auto-checks + quiz bank */
(function () {
  let sawDropped = false;
  // buildContext() renders "N / MAX tokens used — K oldest message(s) dropped" (or "— nothing dropped").
  const dropped = (ctx) => {
    if (/nothing dropped/.test(ctx.display)) return 0;
    const m = ctx.display.match(/(\d+) oldest message\(s\) dropped/);
    return m ? Number(m[1]) : null;
  };
  function history(ctx) {
    if (ctx.error) return null;
    const h = ctx.grab("history").history;
    if (!Array.isArray(h) || h.length < 12) return null;
    const alternating = h.every((m, i) => m && typeof m.content === "string" && (i === 0 || m.role !== h[i - 1].role));
    return alternating ? h : null;
  }
  MCCA.ext("s7-m09", {
    objectives: {
      ch1: (ctx) => !!history(ctx),
      ch2: (ctx) => { const ok = !!history(ctx) && /buildContext\(/.test(ctx.src) && (dropped(ctx) || 0) > 0; if (ok) sawDropped = true; return ok; },
      ch3: (ctx) => {
        if (!history(ctx)) return false;
        const used = ctx.display.match(/(\d+) \/ (\d+) tokens used/);
        return /totalTokens/.test(ctx.src) && !!used && Number(used[1]) <= Number(used[2]) && ctx.output.includes(used[1]);
      },
      ch4: (ctx) => !!history(ctx) && sawDropped && dropped(ctx) === 0,
    },
    quiz: [
      { q: "What is a context window?", options: ["A browser tab", "The maximum amount of text (tokens) a model can consider at once", "A chat log file", "The prompt box"], answer: 1, why: "Correct — everything you send must fit inside it." },
      { q: "With a sliding window, which messages get dropped first?", options: ["The newest", "The oldest", "The longest", "Random ones"], answer: 1, why: "Right — the recent conversation matters most." },
      { q: "Roughly how many characters is one token in English?", options: ["1", "About 4", "About 40", "About 400"], answer: 1, why: "Yes — a handy rule of thumb for estimates." },
      { q: "Instead of deleting old messages, a smarter strategy is to…", options: ["Ignore the limit", "Summarize them into a short note that stays in context", "Restart the chat every time", "Send them twice"], answer: 1, why: "Correct — keep the gist, drop the bulk." },
      { q: "Why not just always send the entire history?", options: ["You should", "It costs more tokens, gets slower, and eventually won't fit", "Models forget it anyway", "It's illegal"], answer: 1, why: "Right — context is a budget." },
    ],
  });
})();
