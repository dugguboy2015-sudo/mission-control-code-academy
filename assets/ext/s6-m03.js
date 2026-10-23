/* Mission 6.3 — Python Files & Data: auto-checks + quiz bank (item 4 happens on your own computer) */
MCCA.ext("s6-m03", {
  objectives: {
    ch1: (ctx) => !ctx.error && /\blog_entries\b/.test(ctx.src) && /\bint\(/.test(ctx.src) && /splitlines\(\)|split\(\s*["']\\n["']\s*\)/.test(ctx.src),
    // 40 + 15 + 8 + 5 = 68 — proof the numbers were really converted and added.
    ch2: (ctx) => !ctx.error && /\bsum\(/.test(ctx.src) && /\b68\b/.test(ctx.output),
    ch3: (ctx) => !ctx.error && /\bwhile\b[^:\n]*:/.test(ctx.src) && /\b2\b/.test(ctx.src),
  },
  quiz: [
    { q: "Why use with open(\"log.csv\") as f: instead of plain open()?", options: ["It's faster", "It closes the file automatically, even if an error happens", "It encrypts the file", "It's required for CSV"], answer: 1, why: "Correct — the with block guarantees cleanup." },
    { q: "\"40\" + \"15\" in Python gives…", options: ["55", "\"4015\"", "An error", "None"], answer: 1, why: "Right — strings join. Convert with int() before doing math." },
    { q: "\"a,b,c\".split(\",\") returns…", options: ["\"abc\"", "[\"a\", \"b\", \"c\"]", "3", "(a, b, c)"], answer: 1, why: "Yes — split breaks a string into a list." },
    { q: "Why skip lines[0] when parsing a CSV?", options: ["It's always empty", "It's the header row (column names), not data", "Python starts at 1", "To save memory"], answer: 1, why: "Correct — lines[1:] is the actual data." },
    { q: "When is a while loop the right tool?", options: ["Always", "When you stop based on a condition (like a count), not \"until the items run out\"", "Never in Python", "Only with files"], answer: 1, why: "Right — for loops walk every item; while loops stop when you say." },
  ],
});
