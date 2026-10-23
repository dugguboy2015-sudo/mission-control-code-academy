/* Mission 5.1 — Data Modeling: auto-checks (they inspect your real tables object) + quiz bank */
(function () {
  function tables(ctx) {
    if (ctx.error) return null;
    const t = ctx.grab("tables").tables;
    return t && typeof t === "object" ? t : null;
  }
  const cols = (tb) => (tb && tb.columns) || {};
  const fk = (tb, col, target) => !!(tb && tb.fk && String(tb.fk[col] || "").replace(/\s/g, "") === target);
  MCCA.ext("s5-m01", {
    objectives: {
      ch1: (ctx) => { const t = tables(ctx); return !!t && !!t.authors && t.authors.pk === "id" && "id" in cols(t.authors) && "name" in cols(t.authors); },
      ch2: (ctx) => { const t = tables(ctx); return !!t && !!t.books && t.books.pk === "id" && "title" in cols(t.books) && "author_id" in cols(t.books) && fk(t.books, "author_id", "authors.id"); },
      ch3: (ctx) => { const t = tables(ctx); return !!t && !!t.tags && t.tags.pk === "id" && "label" in cols(t.tags); },
      ch4: (ctx) => { const t = tables(ctx); return !!t && !!t.book_tags && fk(t.book_tags, "book_id", "books.id") && fk(t.book_tags, "tag_id", "tags.id"); },
      ch5: (ctx) => !!tables(ctx) && /renderSchema\(\s*tables\s*\)/.test(ctx.src) && ["authors", "books", "tags", "book_tags"].every((n) => ctx.display.includes(n)),
    },
    quiz: [
      { q: "What is a primary key?", options: ["The first column", "A column whose value uniquely identifies each row", "A password for the table", "The biggest number in the table"], answer: 1, why: "Correct — no two rows can share a primary key." },
      { q: "What does a foreign key do?", options: ["Translates data", "Points at a primary key in another table, linking the rows", "Encrypts a column", "Deletes old rows"], answer: 1, why: "Right — books.author_id → authors.id ties each book to its author." },
      { q: "One author writes many books. Where does author_id go?", options: ["In authors", "In books", "In a third table", "Nowhere"], answer: 1, why: "Yes — the \"many\" side holds the foreign key." },
      { q: "Why does many-to-many need a junction table?", options: ["It's faster", "Neither side can hold a single foreign key — each pairing needs its own row", "SQL requires three tables", "To store passwords"], answer: 1, why: "Correct — book_tags has one row per (book, tag) pair." },
      { q: "Why not store an author's name directly in every book row?", options: ["Names are too long", "If the name changes you'd have to fix it in many places — and they'd drift out of sync", "SQL can't store text", "It's fine, always do that"], answer: 1, why: "Right — store a fact once, reference it everywhere." },
    ],
  });
})();
