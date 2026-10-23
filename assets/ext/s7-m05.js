/* Mission 7.5 — Embeddings: auto-checks (they inspect the real TOY_EMBEDDINGS and DOCUMENTS) + quiz bank */
(function () {
  const ORIG_WORDS = Object.keys(window.TOY_EMBEDDINGS || {});
  const ORIG_DOCS = (window.DOCUMENTS || []).slice();
  const newWords = () => Object.keys(window.TOY_EMBEDDINGS || {}).filter((w) => !ORIG_WORDS.includes(w)
    && Array.isArray(window.TOY_EMBEDDINGS[w]) && window.TOY_EMBEDDINGS[w].length === 5 && window.TOY_EMBEDDINGS[w].every((n) => typeof n === "number"));
  const newDocs = () => (window.DOCUMENTS || []).filter((d) => !ORIG_DOCS.includes(d));
  const docText = (d) => (typeof d === "string" ? d : (d && d.text) || "");
  MCCA.ext("s7-m05", {
    objectives: {
      ch1: (ctx) => !ctx.error && newWords().length >= 2,
      ch2: (ctx) => !ctx.error && newDocs().filter((d) => newWords().some((w) => docText(d).toLowerCase().includes(w.toLowerCase()))).length >= 2,
      // A query about one of your words, with one of your documents ranked first.
      ch3: (ctx) => {
        if (ctx.error) return false;
        const m = ctx.src.match(/semanticSearch\(\s*(["'`])([\s\S]*?)\1/);
        if (!m || !newWords().some((w) => m[2].toLowerCase().includes(w.toLowerCase()))) return false;
        const first = ctx.output.split("\n").find((l) => l.trim());
        return !!first && newDocs().some((d) => first.includes(docText(d)));
      },
      ch4: (ctx) => !ctx.error && (ctx.src.match(/cosineSimilarity\(/g) || []).length >= 2 && (ctx.output.match(/-?\d\.\d+/g) || []).length >= 2,
    },
    quiz: [
      { q: "What is an embedding?", options: ["A hidden image", "A list of numbers that captures the meaning of a piece of text", "A type of database", "A compressed file"], answer: 1, why: "Correct — similar meanings get similar numbers." },
      { q: "Cosine similarity close to 1 means…", options: ["The texts are unrelated", "The vectors point the same way — very similar meaning", "An error", "The texts are identical letter-for-letter"], answer: 1, why: "Right — near 0 means unrelated." },
      { q: "Semantic search finds \"puppy training tips\" for the query \"teaching my new dog\". Why?", options: ["Same keywords", "Their embeddings are close in meaning even without shared words", "Luck", "Alphabetical order"], answer: 1, why: "Yes — that's the advantage over keyword search." },
      { q: "In a real app, embeddings are usually stored in…", options: ["CSS", "A vector database or a table with a vector column", "Cookies", "The README"], answer: 1, why: "Correct — so you can search them fast." },
      { q: "Real embeddings have hundreds of dimensions, not 5, because…", options: ["Bigger is always prettier", "Meaning has many more facets than a handful of hand-picked ones", "Computers need even numbers", "It's random"], answer: 1, why: "Right — the toy version just makes the idea visible." },
    ],
  });
})();
