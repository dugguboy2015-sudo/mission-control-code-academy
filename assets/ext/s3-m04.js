/* Mission 3.4 — Code Review & Teamwork: review-simulator auto-checks + quiz bank (item 5 is a real review) */
(function () {
  const comments = (ctx) => ctx.$$("#reviewDiff .rc-item").map((el) => ({ line: +el.dataset.line, cat: el.dataset.cat, text: el.querySelector(".rc-text").textContent }));
  const HARSH = /\b(stupid|dumb|idiot|terrible|awful|horrible|garbage|trash|sucks|lazy|bad code|you always|you never)\b/i;
  MCCA.ext("s3-m04", {
    trigger: "interaction",
    objectives: {
      ch1: (ctx) => comments(ctx).some((c) => c.line === 3 && c.cat === "security"),
      ch2: (ctx) => comments(ctx).some((c) => c.line === 5 && c.cat === "bug"),
      ch3: (ctx) => comments(ctx).some((c) => ctx.words(c.text) >= 12 && !HARSH.test(c.text)
        && /\b(could|should|consider|suggest|instead|try|how about|maybe|change|use|move|replace)\b/i.test(c.text)
        && /\b(because|so|since|which|means|otherwise|would|will)\b/i.test(c.text)),
      ch4: (ctx) => { const r = ctx.$("#reviewResult"); return !!r && r.dataset.verdict === "request" && comments(ctx).length >= 2; },
    },
    quiz: [
      { q: "What does \"Request changes\" mean on a Pull Request?", options: ["Delete the PR", "The code must be fixed before it can merge", "Approve it", "Ask for a new feature"], answer: 1, why: "Correct — it blocks the merge until the problems are addressed." },
      { q: "A reviewer writes \"nit: maybe call this previousBest\". The author should…", options: ["Panic", "Treat it as a small optional suggestion — nice to fix, not a blocker", "Close the PR", "Ignore all reviews"], answer: 1, why: "Right — \"nit\" signals a tiny style point." },
      { q: "Why are small Pull Requests better than giant ones?", options: ["They use less disk", "They're easier to review carefully, so bugs actually get caught", "GitHub limits size", "No reason"], answer: 1, why: "Yes — reviewers skim giant diffs." },
      { q: "In pair programming, the \"navigator\"…", options: ["Types everything", "Thinks ahead, spots mistakes and guides while the driver types", "Takes a break", "Writes the tests later"], answer: 1, why: "Correct — then you swap roles." },
      { q: "Your code gets 6 review comments. The healthiest reaction is…", options: ["Feel attacked", "Thank the reviewer, ask about anything unclear, and fix or explain", "Argue every point", "Delete the branch"], answer: 1, why: "Right — every comment is a free lesson about the code." },
    ],
  });
})();
