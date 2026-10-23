/* Mission 6.6 — How Machines Learn: auto-checks + quiz bank
   With k=3 on this data: mystery (4, 1) → lemon; TEST accuracy 75% ((8, 7) apple is guessed orange). */
(function () {
  const keepsData = (ctx) => /TRAIN\s*=\s*\[/.test(ctx.src) && /TEST\s*=\s*\[/.test(ctx.src) && /\(8,\s*7,\s*"apple"\)/.test(ctx.src);
  MCCA.ext("s6-m07", {
    objectives: {
      ch1: (ctx) => !ctx.error && keepsData(ctx) && /def\s+distance\s*\(/.test(ctx.src) && /(sqrt\(|\*\*\s*0?\.5)/.test(ctx.src)
        && ctx.output.split("\n").some((l) => /distance/i.test(l) && /\b5\.0\b/.test(l)),
      // The 3 nearest to (4, 1) are (5, 1), (4, 2) and (3, 2) — all lemons.
      ch2: (ctx) => !ctx.error && keepsData(ctx) && /sorted\(\s*TRAIN[\s\S]*?key\s*=[\s\S]*?distance/.test(ctx.src) && /\[\s*:\s*(3|k)\s*\]/.test(ctx.src)
        && ["(5, 1, 'lemon')", "(4, 2, 'lemon')", "(3, 2, 'lemon')"].filter((t) => ctx.output.includes(t)).length >= 3,
      ch3: (ctx) => !ctx.error && keepsData(ctx) && /def\s+predict\s*\(/.test(ctx.src) && !/\?\?\?/.test(ctx.output)
        && ctx.output.split("\n").some((l) => /mystery/i.test(l) && /lemon/.test(l)),
      ch4: (ctx) => !ctx.error && keepsData(ctx) && /for\s+[\w\s,]+\s+in\s+TEST/.test(ctx.src) && /(75\s*%|0\.75\b|3\s*\/\s*4)/.test(ctx.output),
      ch5: (ctx) => ctx.comments.split("\n").some((c) => !/TODO/.test(c) && ctx.words(c) >= 8
        && /(orange|apple)/i.test(c) && /(big|large|size|sweet|example|data|bias|train)/i.test(c)),
    },
    quiz: [
      { q: "In machine learning, a \"label\" is…", options: ["A sticker", "The right answer attached to a training example", "A variable name", "The model's guess"], answer: 1, why: "Correct — features are the measurements, the label is the answer." },
      { q: "Why keep a separate TEST set?", options: ["To save memory", "To measure how the model does on examples it has NEVER seen", "Python requires it", "To train twice as fast"], answer: 1, why: "Right — that's the only honest measure of a model." },
      { q: "With k=3, the 3 nearest neighbours are apple, orange, orange. The prediction is…", options: ["apple", "orange", "a tie", "lemon"], answer: 1, why: "Yes — majority vote, 2 to 1." },
      { q: "A model trained only on medium apples sees a giant apple. What might happen?", options: ["It always gets it right", "It may misclassify it — the training data never covered that case (bias)", "It crashes", "It asks a human"], answer: 1, why: "Correct — gaps in data become mistakes in the model." },
      { q: "How is this classifier related to Sector 7's language models?", options: ["Not at all", "Both learn patterns from examples instead of following hand-written rules", "They're the same program", "Language models use rules"], answer: 1, why: "Right — same core idea, vastly bigger scale." },
    ],
  });
})();
