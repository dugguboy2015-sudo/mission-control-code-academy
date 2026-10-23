/* Mission 0.1 — Computers & Code: auto-checks + quiz bank */
(function () {
  const PRESETS = [
    "1. Get two slices of bread\n2. Open the peanut butter jar\n3. Spread peanut butter on one slice\n4. Put the slices together\n5. Put the sandwich on a plate",
    "1. Get some bread\n2. Put a bit of peanut butter on it\n3. Make it into a sandwich",
    "1. Place 2 slices of bread on the plate\n2. Open the peanut butter jar\n3. Using the knife, spread 1 tablespoon of peanut butter evenly on slice 1\n4. Place slice 2 on top of slice 1, matching the edges\n5. STOP — the sandwich is complete",
  ];
  // Your own instructions (not a preset) that the robot has actually run.
  function ranLines(ctx) {
    const v = ctx.edited("#robotEditor", PRESETS);
    if (!v) return null;
    const lines = v.split("\n").map((l) => l.trim()).filter(Boolean);
    const said = ctx.$$("#robotOutput .robot-said").map((el) => el.textContent.replace(/^ROBOT READS: /, ""));
    if (lines.length < 3 || said.length !== lines.length || said.some((s, i) => s !== lines[i])) return null;
    return lines;
  }
  MCCA.ext("s0-m01", {
    trigger: "interaction",
    objectives: {
      ch1: (ctx) => { const l = ranLines(ctx); return !!l && l.every((x) => /^\d+\.\s*\S/.test(x)); },
      ch2: (ctx) => { const l = ranLines(ctx); return !!l && !l.some((x) => /\b(some|a bit|a little|carefully|nicely|properly|enough|a few|a lot)\b/i.test(x)); },
      ch3: (ctx) => { const l = ranLines(ctx); return !!l && l.some((x) => /\b(stop|halt|end)\b/i.test(x)); },
      ch4: (ctx) => !!ranLines(ctx),
    },
    quiz: [
      { q: "What is a program, really?", options: ["A list of exact instructions a computer follows in order", "A file that makes the computer smarter", "A website that runs on the internet", "A set of suggestions the computer can choose from"], answer: 0, why: "Right — a program is just precise, ordered instructions. The computer adds no judgment of its own." },
      { q: "The robot reads \"spread a bit of peanut butter\". Why is that a problem?", options: ["Robots don't understand food", "\"A bit\" has no exact amount, so the result is unpredictable", "The step should be in capital letters", "It isn't — that instruction is fine"], answer: 1, why: "Correct — vague quantities force the machine to pick some arbitrary value, which is rarely what you meant." },
      { q: "Which instruction is the most precise?", options: ["Toast the bread until it looks good", "Toast the bread for a while", "Toast the bread for 2 minutes at setting 4", "Toast the bread carefully"], answer: 2, why: "Yes — a measurable time and setting leaves nothing to guess." },
      { q: "Why does a good set of instructions need a stopping condition?", options: ["So the steps look tidy", "Without one, the machine may never know it's finished and keep going", "Computers get tired", "It makes the program run faster"], answer: 1, why: "Exactly — loops and processes need a clear, checkable \"done\" point or they can run forever." },
      { q: "Your robot did something silly. What's the right fix?", options: ["Blame the robot", "Rewrite your instructions until they say exactly what you mean", "Run it again and hope", "Add more exclamation marks"], answer: 1, why: "Right — the machine did what you wrote. Debugging means fixing the instructions, not the machine." },
    ],
  });
})();
