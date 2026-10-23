/* Mission 7.6 — RAG: auto-checks (they inspect the real NOTES) + quiz bank */
(function () {
  const ORIG = (window.NOTES || []).slice();
  const newNotes = () => (window.NOTES || []).filter((n) => !ORIG.includes(n) && typeof n === "string");
  MCCA.ext("s7-m06", {
    objectives: {
      ch1: (ctx) => !ctx.error && newNotes().filter((n) => /\d/.test(n) && n.split(/\s+/).length >= 5).length >= 2,
      ch2: (ctx) => !ctx.error && /ragAnswer\(/.test(ctx.src) && newNotes().some((n) => ctx.output.includes("Based on your notes: \"" + n + "\"")),
      ch3: (ctx) => !ctx.error && /ragAnswer\(/.test(ctx.src) && /I don't know/.test(ctx.output) && !/capital of France/i.test(ctx.src),
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /(hallucinat|make\s*up|made\s*up|guess|invent|lie|wrong|confident)/i.test(c)),
    },
    quiz: [
      { q: "What does RAG stand for?", options: ["Random Answer Generator", "Retrieval-Augmented Generation", "Rapid AI Gateway", "Read And Guess"], answer: 1, why: "Correct — retrieve relevant text, add it to the prompt, then generate." },
      { q: "Why does RAG reduce made-up answers?", options: ["It makes the model bigger", "The model answers from real retrieved text instead of only its memory", "It blocks questions", "It doesn't"], answer: 1, why: "Right — grounding." },
      { q: "Why tell the model \"if it's not in the context, say you don't know\"?", options: ["To be polite", "So it doesn't fill gaps with confident guesses", "It's required syntax", "To save tokens"], answer: 1, why: "Yes — an honest \"I don't know\" beats a fluent wrong answer." },
      { q: "In RAG, what usually finds the relevant chunks?", options: ["Random choice", "Semantic search over embeddings (Mission 7.5)", "Alphabetical sort", "The user"], answer: 1, why: "Correct — retrieval is embeddings + similarity." },
      { q: "Your RAG app retrieves the wrong notes. Where do you look first?", options: ["The CSS", "The retrieval step — chunking, embeddings, or the relevance threshold", "The browser", "The model's temperature only"], answer: 1, why: "Right — garbage retrieved, garbage generated." },
    ],
  });
})();
