/* Mission 6.7 — Capstone: Python Data Analyzer: auto-checks + quiz bank
   (The starter already demonstrates items 2–3; item 5 happens on your own computer.) */
MCCA.ext("s6-m04", {
  objectives: {
    // Feed it a broken row and prove it gets skipped, not crashed on.
    ch1: (ctx) => !ctx.error && /def\s+parse_log\s*\(/.test(ctx.src) && /\btry\s*:/.test(ctx.src) && /\bexcept\b/.test(ctx.src)
      && /(Skipped malformed|skipped [1-9])/i.test(ctx.output),
    ch4: (ctx) => !ctx.error && /\[\s*\w+\s+for\s+\w+\s+in\s+\w+\s+if\s+\w+\[\s*["']event["']\s*\]\s*==\s*/.test(ctx.src),
  },
  quiz: [
    { q: "What does try / except do?", options: ["Runs code twice", "Catches an error so the program can handle it instead of crashing", "Hides output", "Speeds up loops"], answer: 1, why: "Correct — the except block runs only if the try block fails." },
    { q: "f\"{3.14159:.1f}\" prints…", options: ["3.14159", "3.1", "3", "3.14"], answer: 1, why: "Right — .1f = one decimal place." },
    { q: "Why split the analyzer into total_fuel(), average_fuel() and most_fuel_event()?", options: ["Python requires it", "Each does one job — easy to test, reuse and fix", "It runs faster", "To make the file longer"], answer: 1, why: "Yes — small single-purpose functions." },
    { q: "max(entries, key=lambda e: e[\"fuel_used\"]) returns…", options: ["The biggest fuel number", "The whole entry with the biggest fuel_used", "The last entry", "A list"], answer: 1, why: "Correct — key decides how to compare, but you get the full item back." },
    { q: "Why report skipped rows instead of silently ignoring them?", options: ["It looks nice", "So someone knows the data had problems and can fix the source", "Python requires it", "It's faster"], answer: 1, why: "Right — silent data loss is a bug waiting to bite." },
  ],
});
