/* Mission 6.5 — Analyzing Data: auto-checks + quiz bank
   Expected answers for GAME_LOG: mean 118.33, median 115, minutes RR 110 / SP 90 / CQ 170,
   best average Code Quest 157.5. */
(function () {
  const keepsData = (ctx) => /GAME_LOG\s*=\s*\[/.test(ctx.src) && (ctx.src.match(/"score":\s*\d+/g) || []).length === 12;
  const line = (ctx, name, re) => ctx.output.split("\n").some((l) => l.includes(name) && re.test(l));
  MCCA.ext("s6-m06", {
    objectives: {
      ch1: (ctx) => !ctx.error && keepsData(ctx) && /def\s+mean\s*\(/.test(ctx.src) && /def\s+median\s*\(/.test(ctx.src) && !/import\s+statistics/.test(ctx.src)
        && /118\.3/.test(ctx.output) && /\b115(\.0)?\b/.test(ctx.output),
      ch2: (ctx) => !ctx.error && keepsData(ctx) && line(ctx, "Rocket Run", /\b110\b/) && line(ctx, "Star Puzzle", /\b90\b/) && line(ctx, "Code Quest", /\b170\b/),
      ch3: (ctx) => !ctx.error && keepsData(ctx) && line(ctx, "Code Quest", /157\.5/),
      ch4: (ctx) => !ctx.error && keepsData(ctx) && line(ctx, "Code Quest", /#{17}(?!#)/) && line(ctx, "Star Puzzle", /#{9}(?!#)/) && line(ctx, "Rocket Run", /#{11}(?!#)/),
      ch5: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 10 && /\d/.test(c) && /(only|small|few|might|may|could|limit|not prove|maybe)/i.test(c)),
    },
    quiz: [
      { q: "The median of [3, 9, 4] is…", options: ["4", "5.33", "9", "3"], answer: 0, why: "Correct — sorted it's [3, 4, 9]; the middle is 4." },
      { q: "Which line totals minutes per game?", options: ["total = sum(GAME_LOG)", "d[game] = d.get(game, 0) + s[\"minutes\"]", "d[game] = s[\"minutes\"]", "print(GAME_LOG[\"minutes\"])"], answer: 1, why: "Right — start at 0, keep adding." },
      { q: "Ice-cream sales and sunburns rise together. What can you conclude?", options: ["Ice cream causes sunburn", "They're correlated — probably both caused by sunny weather", "Sunburn causes ice cream", "Nothing at all"], answer: 1, why: "Yes — correlation, with a hidden common cause." },
      { q: "What does \"#\" * 5 produce in Python?", options: ["An error", "\"#####\"", "5", "\"#5\""], answer: 1, why: "Correct — multiplying a string repeats it." },
      { q: "Why report how many data points a finding is based on?", options: ["To look smart", "Small samples can mislead — readers need to know how confident to be", "It's required by Python", "No reason"], answer: 1, why: "Right — four sessions per game is a hint, not proof." },
    ],
  });
})();
