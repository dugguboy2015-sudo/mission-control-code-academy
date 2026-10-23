/* Mission 9.3 — AI as a Coding Partner: auto-checks + quiz bank (the starter already demonstrates item 1) */
(function () {
  // Run the page's reviewer on a string without disturbing what the display shows.
  function review(code) {
    const el = document.getElementById("reviewDisplay");
    const before = el ? el.innerHTML : null;
    try { return window.reviewGeneratedCode(code) || []; } catch (e) { return null; } finally { if (el) el.innerHTML = before; }
  }
  const KNOWN = ["const apiKey = \"sk-1234567890abcdef\";"];
  // Your own code-as-string literals (multi-line template strings).
  const snippets = (ctx) => Array.from(ctx.src.matchAll(/`([\s\S]{25,}?)`/g)).map((m) => m[1]).filter((s) => !KNOWN.some((k) => s.includes(k)) && !ctx.known.some((k) => k.includes(s.trim())));
  MCCA.ext("s9-m03", {
    objectives: {
      ch2: (ctx) => !ctx.error && /reviewGeneratedCode\(/.test(ctx.src) && snippets(ctx).some((s) => { const f = review(s); return !!f && f.length >= 2; }),
      ch3: (ctx) => !ctx.error && (ctx.src.match(/reviewGeneratedCode\(/g) || []).length >= 2
        && snippets(ctx).some((s) => { const f = review(s); return !!f && f.length === 0 && s.split("\n").filter((l) => l.trim()).length >= 3; }),
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 10 && /(fix|add|wrap|remove|move|replace|handle)/i.test(c)),
    },
    quiz: [
      { q: "The AI's code runs without errors. Is it correct?", options: ["Yes", "Not necessarily — running isn't the same as right; read and test it", "Only if it's short", "Only in Python"], answer: 1, why: "Correct — you own every line you ship." },
      { q: "An AI suggests const apiKey = \"sk-...\" in front-end code. You should…", options: ["Ship it", "Move the key server-side (a proxy) and rotate it if it was ever committed", "Rename the variable", "Comment it out"], answer: 1, why: "Right — never trust generated code with secrets." },
      { q: "Which prompt to an AI coding assistant is best?", options: ["\"fix it\"", "\"Wrap the fetch in getData in try/catch, check response.ok, and return null on failure\"", "\"make it better\"", "\"do the thing\""], answer: 1, why: "Yes — specific requests produce verifiable results." },
      { q: "A TODO comment left in generated code means…", options: ["The code is finished", "Something was knowingly left unfinished — check what", "It's documentation", "Nothing"], answer: 1, why: "Correct — TODOs are unfinished work." },
      { q: "The best way to use an AI coding partner is…", options: ["Paste everything it gives you", "Treat it like a fast junior teammate: ask clearly, review carefully, test everything", "Never use one", "Let it commit directly to main"], answer: 1, why: "Right — speed plus your judgment." },
    ],
  });
})();
