/* Mission 5.5 — SQL vs NoSQL: auto-checks + quiz bank (the starter already demonstrates items 1–2) */
MCCA.ext("s5-m05", {
  objectives: {
    ch3: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /\b(firebase|supabase|sql|nosql|firestore|postgres)\b/i.test(c)),
    ch4: (ctx) => !ctx.error && /needsHistoricalReporting\s*:\s*true/.test(ctx.src) && /decideStack\(/.test(ctx.src) && /better fit|close to call/i.test(ctx.display),
  },
  quiz: [
    { q: "Which is a strength of SQL databases?", options: ["No schema at all", "Powerful queries across related tables (JOINs, aggregates)", "Built-in realtime by default", "They can't lose data"], answer: 1, why: "Correct — relational structure is SQL's superpower." },
    { q: "Which is a strength of document (NoSQL) databases?", options: ["Complex reports", "Flexible record shapes and easy realtime sync", "Strict schemas", "JOINs"], answer: 1, why: "Right — each document can look a little different." },
    { q: "\"Which database is best?\" The honest answer is…", options: ["Always SQL", "Always NoSQL", "It depends on the app's real requirements", "Whichever is newest"], answer: 2, why: "Yes — you choose based on queries, shape, realtime needs and the team." },
    { q: "Your app needs historical stats with filters and totals. That leans…", options: ["NoSQL", "SQL", "Neither", "A spreadsheet"], answer: 1, why: "Correct — aggregations and filtering are SQL's home turf." },
    { q: "What is a schema?", options: ["A secret key", "The defined structure of the data — tables, columns, types", "A backup", "A server"], answer: 1, why: "Right — SQL enforces one; document stores are looser." },
  ],
});
