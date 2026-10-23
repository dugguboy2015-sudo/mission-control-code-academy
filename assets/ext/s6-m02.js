/* Mission 6.2 — Python Data Structures: auto-checks + quiz bank */
MCCA.ext("s6-m02", {
  objectives: {
    ch1: (ctx) => !ctx.error && /\bcargo\s*=\s*\[/.test(ctx.src) && (ctx.src.match(/["']weight_kg["']\s*:/g) || []).length >= 5
      && (ctx.src.match(/["']fragile["']\s*:\s*(True|False)/g) || []).length >= 5,
    ch2: (ctx) => !ctx.error && /fragile_items\s*=\s*\[[^\]]*\bfor\b[^\]]*\bin\b[^\]]*\bif\b[^\]]*\]/.test(ctx.src),
    ch3: (ctx) => !ctx.error && /sorted\([\s\S]*?weight_kg[\s\S]*?(reverse\s*=\s*True|-\s*\w+\[)/.test(ctx.src),
    ch4: (ctx) => !ctx.error && /sum\([\s\S]*?weight_kg/.test(ctx.src),
    ch5: (ctx) => !ctx.error && /\.get\(\s*["']origin["']\s*,\s*["']UNKNOWN["']\s*\)/.test(ctx.src) && /UNKNOWN/.test(ctx.output),
  },
  quiz: [
    { q: "What does [x * 2 for x in nums] build?", options: ["One number", "A new list with every value doubled", "A dictionary", "An error"], answer: 1, why: "Correct — a list comprehension: a loop that builds a list in one line." },
    { q: "item.get(\"origin\", \"UNKNOWN\") when origin is missing returns…", options: ["An error", "None", "\"UNKNOWN\"", "\"origin\""], answer: 2, why: "Right — .get() returns the default instead of crashing." },
    { q: "What does item[\"origin\"] do when the key is missing?", options: ["Returns None", "Raises a KeyError", "Returns \"\"", "Creates the key"], answer: 1, why: "Yes — that's exactly why .get() exists." },
    { q: "sorted(cargo, key=lambda c: c[\"weight_kg\"], reverse=True) sorts…", options: ["Lightest first", "Heaviest first", "Alphabetically", "Randomly"], answer: 1, why: "Correct — reverse=True flips to descending." },
    { q: "Which Python structure matches a JavaScript object?", options: ["list", "tuple", "dict", "set"], answer: 2, why: "Right — key/value pairs." },
  ],
});
