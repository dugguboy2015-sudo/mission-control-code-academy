/* Mission 6.1 — Python Fundamentals: auto-checks + quiz bank */
(function () {
  const outLines = (ctx) => ctx.output.split("\n").filter((l) => l.trim()).length;
  MCCA.ext("s6-m01", {
    objectives: {
      ch1: (ctx) => { const m = !ctx.error && ctx.src.match(/\bcrew\s*=\s*\[([\s\S]*?)\]/); return !!m && (m[1].match(/["'][^"']+["']/g) || []).length >= 4; },
      ch2: (ctx) => !ctx.error && /def\s+greet_crew_member\s*\(\s*\w+\s*\)\s*:[\s\S]*?return\s+f["']/.test(ctx.src),
      ch3: (ctx) => !ctx.error && /for\s+\w+\s+in\s+crew\s*:[\s\S]*?greet_crew_member\(/.test(ctx.src) && outLines(ctx) >= 4,
      ch4: (ctx) => { const m = !ctx.error && ctx.src.match(/\bship_status\s*=\s*\{([\s\S]*?)\}/); return !!m && (m[1].match(/["'][^"']+["']\s*:/g) || []).length >= 3; },
      ch5: (ctx) => !ctx.error && /\bif\s+[^:\n]*ship_status\s*(\[|\.get\()[^:\n]*(<|<=|>|>=)[^:\n]*:/.test(ctx.src) && /\belse\s*:/.test(ctx.src),
    },
    quiz: [
      { q: "How does Python know which lines belong inside an if or a loop?", options: ["Curly braces { }", "Indentation", "Semicolons", "The word end"], answer: 1, why: "Correct — consistent indentation IS the block in Python." },
      { q: "What does f\"Hi {name}\" do?", options: ["Prints the letter f", "Builds a string with name's value dropped in", "Formats a file", "Makes the text bold"], answer: 1, why: "Right — an f-string fills in {expressions}." },
      { q: "Which keyword defines a function in Python?", options: ["function", "def", "func", "fn"], answer: 1, why: "Yes — def name(params):" },
      { q: "status = {\"fuel\": 80} — how do you read fuel?", options: ["status.fuel", "status[\"fuel\"]", "status(fuel)", "status->fuel"], answer: 1, why: "Correct — square brackets with the key." },
      { q: "In Python, the JavaScript `else if` is written…", options: ["else if", "elif", "elseif", "or if"], answer: 1, why: "Right — elif." },
    ],
  });
})();
