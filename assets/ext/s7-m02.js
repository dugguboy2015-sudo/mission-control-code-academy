/* Mission 7.2 — Prompt Engineering: auto-checks + quiz bank */
(function () {
  const STARTER_USER = "Tell me about dogs.";
  const EXAMPLE_USER = "List 3 bullet points about low-shedding dog breeds good for apartments.";
  const EXAMPLE_SYSTEM = "You are a friendly pirate captain.";
  // Every chat(system, user) call with two plain string literals.
  function calls(ctx) {
    return Array.from(ctx.src.matchAll(/(?:FakePromptLLM|LiveAI)\.chat\(\s*(["'`])([\s\S]*?)\1\s*,\s*(["'`])([\s\S]*?)\3\s*[,)]/g))
      .map((m) => ({ system: m[2].trim(), user: m[4].trim() }));
  }
  const words = (s) => (s.match(/\S+/g) || []).length;
  MCCA.ext("s7-m02", {
    objectives: {
      ch1: (ctx) => !ctx.error && calls(ctx).some((c) => words(c.user) > 0 && words(c.user) < 5 && c.user !== STARTER_USER),
      ch2: (ctx) => !ctx.error && calls(ctx).some((c) => c.user !== EXAMPLE_USER && /\d/.test(c.user)
        && /\b(bullet|bullets|numbered|list|points|steps|sentences?|words|table)\b/i.test(c.user) && words(c.user) >= 6),
      ch3: (ctx) => !ctx.error && calls(ctx).some((c) => c.system && c.system !== EXAMPLE_SYSTEM && words(c.system) >= 3),
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /\b(specific|specificity|format|persona|system)\b/i.test(c)),
    },
    quiz: [
      { q: "Which prompt will get the most useful answer?", options: ["Dogs?", "Tell me about dogs", "List 3 calm dog breeds for a small apartment, one sentence each", "DOGS!!!"], answer: 2, why: "Correct — topic, format, and length are all specified." },
      { q: "What is a system prompt?", options: ["An error message", "Instructions that set the model's role, rules and tone for the whole conversation", "The user's question", "A password"], answer: 1, why: "Right — the user prompt asks; the system prompt frames." },
      { q: "Giving the model one example of the output you want is called…", options: ["Zero-shot", "Few-shot (or one-shot) prompting", "Fine-tuning", "Debugging"], answer: 1, why: "Yes — examples are one of the strongest steering tools." },
      { q: "The model's answer is too long. Best fix?", options: ["Ask again and hope", "Add an explicit limit: \"in under 50 words\"", "Use capital letters", "Switch browsers"], answer: 1, why: "Correct — say the constraint out loud." },
      { q: "Why test the same prompt more than once?", options: ["You shouldn't", "Outputs vary — one good result might be luck", "It's free", "To make the model learn"], answer: 1, why: "Right — check it's reliably good, not occasionally good." },
    ],
  });
})();
