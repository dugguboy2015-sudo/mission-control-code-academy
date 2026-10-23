/* Mission 5.2 — SQL & Supabase CRUD: auto-checks against the real in-browser database + quiz bank
   The database persists between RUNs, so each objective passes on the run
   that actually does it — create first, then insert, then query. */
(function () {
  let inserted = 0;
  const ok = (ctx) => ctx.authored && !ctx.error;
  const rows = (ctx) => ctx.run && ctx.run.outputEl ? ctx.run.outputEl.querySelectorAll("tr").length - ctx.run.outputEl.querySelectorAll("table").length : 0;
  document.addEventListener("mcca:run", (e) => {
    const d = e.detail;
    if (!d || d.kind !== "sql" || d.error || !d.authored) return;
    (d.code.replace(/--.*$/gm, "").match(/INSERT\s+INTO\s+ship_log[\s\S]*?;|INSERT\s+INTO\s+ship_log[\s\S]*$/gi) || []).forEach((stmt) => {
      const values = stmt.split(/\bVALUES\b/i)[1] || "";
      inserted += (values.match(/\(/g) || []).length;
    });
  });
  MCCA.ext("s5-m02", {
    objectives: {
      ch1: (ctx) => ok(ctx) && /CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?ship_log\s*\(/i.test(ctx.src)
        && ["id", "entry_date", "author", "message"].every((c) => new RegExp("\\b" + c + "\\b", "i").test(ctx.src)) && /PRIMARY\s+KEY/i.test(ctx.src),
      ch2: (ctx) => ok(ctx) && inserted >= 4,
      ch3: (ctx) => ok(ctx) && /SELECT[\s\S]+FROM\s+ship_log[\s\S]+WHERE\s+author\s*=\s*'[^']+'/i.test(ctx.src) && rows(ctx) >= 1,
      ch4: (ctx) => ok(ctx) && /SELECT[\s\S]+FROM\s+ship_log[\s\S]+ORDER\s+BY\s+entry_date/i.test(ctx.src) && rows(ctx) >= 2,
      ch5: (ctx) => ok(ctx) && /UPDATE\s+ship_log\s+SET\s+message\s*=[\s\S]+WHERE\s+id\s*=\s*\d+/i.test(ctx.src),
    },
    quiz: [
      { q: "What do the letters in CRUD stand for?", options: ["Copy, Run, Undo, Delete", "Create, Read, Update, Delete", "Code, Review, Upload, Deploy", "Create, Restore, Upgrade, Drop"], answer: 1, why: "Correct — the four things almost every app does with data." },
      { q: "Which SQL statement is the R in CRUD?", options: ["INSERT", "SELECT", "UPDATE", "DELETE"], answer: 1, why: "Right — SELECT reads rows." },
      { q: "What happens if you run UPDATE ship_log SET message = 'oops'; with NO WHERE?", options: ["Nothing", "Every single row's message becomes 'oops'", "Only the first row changes", "SQL refuses to run it"], answer: 1, why: "Yes — a missing WHERE hits the whole table. Always double-check it." },
      { q: "ORDER BY entry_date DESC sorts…", options: ["Oldest first", "Newest first", "Alphabetically", "Randomly"], answer: 1, why: "Correct — DESC is descending (biggest/latest first)." },
      { q: "What is Supabase, in one line?", options: ["A JavaScript framework", "A hosted Postgres database with auth and an API around it", "A CSS library", "A code editor"], answer: 1, why: "Right — real SQL, without running your own server." },
    ],
  });
})();
