/* Mission 8.1 — AI-Native vs AI-Enabled: auto-checks + quiz bank */
(function () {
  const KNOWN = [
    "A todo app with a button to ask AI to summarize my tasks.",
    "An app with no traditional buttons — you describe what you want in natural language, and the model decides which tasks to reorganize and plans your whole afternoon.",
  ];
  const ownCalls = (ctx) => Array.from(ctx.src.matchAll(/classifyDesign\(\s*(["'`])([\s\S]*?)\1\s*\)/g)).map((m) => m[2].trim()).filter((d) => d.length > 15 && !KNOWN.includes(d));
  const commentLines = (ctx, re) => ctx.comments.split("\n").filter((c) => ctx.words(c) >= 6 && re.test(c));
  MCCA.ext("s8-m01", {
    objectives: {
      ch1: (ctx) => !ctx.error && ownCalls(ctx).length >= 1 && /Leans AI-|Too close/.test(ctx.display),
      ch2: (ctx) => commentLines(ctx, /\b(traditional|deterministic|normal code|regular code|plain code|rules?|hard-?coded|always the same)\b/i).length >= 1,
      ch3: (ctx) => commentLines(ctx, /\b(model|AI|judg(e)?ment|flexib\w*)\b/i).some((c) => /\b(because|since|so that|so it|which means)\b/i.test(c)),
      ch4: (ctx) => !ctx.error && ownCalls(ctx).length >= 2 && /Leans AI-NATIVE/.test(ctx.display),
    },
    quiz: [
      { q: "What makes an app AI-NATIVE rather than AI-ENABLED?", options: ["It uses a bigger model", "The model's judgment drives a core mechanism — remove it and the product doesn't exist", "It has a chat box", "It's newer"], answer: 1, why: "Correct — AI-enabled bolts AI onto a traditional app as one feature." },
      { q: "Which job should stay in deterministic code, not the model?", options: ["Writing a friendly summary", "Calculating the order total and charging the card", "Suggesting a gift idea", "Rephrasing a note"], answer: 1, why: "Right — money and exact rules need guaranteed, testable behavior." },
      { q: "Which job genuinely benefits from a model's flexible judgment?", options: ["Adding two numbers", "Understanding a messy, natural-language request", "Sorting a list by date", "Checking a password"], answer: 1, why: "Yes — fuzzy human input is where models shine." },
      { q: "A spell-checker that suggests fixes is…", options: ["AI-native", "AI-enabled — a helpful feature on top of a traditional editor", "Not AI at all", "An agent"], answer: 1, why: "Correct — the editor works fine without it." },
      { q: "Why does the distinction matter for a builder?", options: ["Marketing only", "It changes architecture, testing, cost and how you handle failure", "It doesn't", "Only for big companies"], answer: 1, why: "Right — AI-native products need evals, guardrails and fallbacks at the core." },
    ],
  });
})();
