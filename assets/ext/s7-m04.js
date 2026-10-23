/* Mission 7.4 — Structured Output & Tools: auto-checks + quiz bank */
(function () {
  const STARTER_SENTENCE = "Order placed for Priya, total came to $42.00";
  const ownSentence = (ctx) => { const m = ctx.src.match(/extractJSON\(\s*(["'`])([\s\S]*?)\1/); return !!m && m[2] !== STARTER_SENTENCE && m[2].trim().length > 10; };
  const toolQuestion = (ctx) => { const m = ctx.src.match(/callWithTools\(\s*(["'`])([\s\S]*?)\1/); return !!m && /weather|rain|sunny|temperature|forecast/i.test(m[2]) && m[2] !== "What's the weather in Paris?"; };
  MCCA.ext("s7-m04", {
    objectives: {
      ch1: (ctx) => !ctx.error && ownSentence(ctx) && /try\s*\{[\s\S]*?JSON\.parse\([\s\S]*?\}\s*catch/.test(ctx.src),
      ch2: (ctx) => !ctx.error && ownSentence(ctx) && /typeof\s+[\w.]*amount\s*!==?\s*["']number["']/.test(ctx.src) && /throw\s+new\s+Error\(/.test(ctx.src),
      ch3: (ctx) => !ctx.error && toolQuestion(ctx) && /\.name\b/.test(ctx.src) && /\.arguments\b/.test(ctx.src),
      ch4: (ctx) => !ctx.error && toolQuestion(ctx) && /(function\s+get_weather\s*\(\s*\w+\s*\)|get_weather\s*=\s*(\(\s*\w+\s*\)|\w+)\s*=>)/.test(ctx.src)
        && /get_weather\(\s*[\w.]*arguments/.test(ctx.src),
    },
    quiz: [
      { q: "Why ask a model for JSON instead of a paragraph?", options: ["It's shorter", "Your code can parse it reliably into real fields", "Models prefer it", "It's free"], answer: 1, why: "Correct — structure turns text into data your program can use." },
      { q: "Why wrap JSON.parse of model output in try/catch?", options: ["It's tradition", "Models sometimes return broken or extra text — parsing can throw", "It runs faster", "JSON.parse never fails"], answer: 1, why: "Right — always plan for malformed output." },
      { q: "In tool calling, who actually runs get_weather?", options: ["The model", "YOUR code — the model only asks for it by name with arguments", "The browser automatically", "Nobody"], answer: 1, why: "Yes — the model proposes; your code executes." },
      { q: "The model returns { amount: \"42\" }. What should your code do?", options: ["Trust it", "Validate the type and convert or reject it — never assume", "Crash", "Ignore amount"], answer: 1, why: "Correct — validate before using model output." },
      { q: "A tool call gives you {name, arguments}. Before running it you should…", options: ["Run any name it says", "Check the name is a tool you actually offered, and validate the arguments", "Ask the user for a password", "Nothing"], answer: 1, why: "Right — the model's request is untrusted input." },
    ],
  });
})();
