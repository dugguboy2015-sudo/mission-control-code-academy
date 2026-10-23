/* Mission 2.11 — Capstone: Game/Quiz: auto-checks + quiz bank */
MCCA.ext("s2-m11", {
  objectives: {
    ch1: (ctx) => !ctx.error && /(?:const|let)\s+\w+\s*=\s*\{[^}]*\b(score|attempts|index|lives|level|round|turn|guesses|points|current)\s*:/.test(ctx.src),
    ch2: (ctx) => !ctx.error && /(\.(forEach|map|filter|reduce|some|every|find)\(|\bfor\s*\()/.test(ctx.src),
    ch4: (ctx) => !ctx.error && /addEventListener\([\s\S]*?\b(e|ev|evt|event)\.target\b/.test(ctx.src),
    ch6: (ctx) => !ctx.error && /(function\s+(reset|restart|newGame|startGame|playAgain)\w*|(reset|restart|newGame|startGame|playAgain)\w*\s*=\s*(\(|function))/i.test(ctx.src)
      && /addEventListener\(\s*["']click["']/.test(ctx.src),
    // Mostly your own code — not the starter or an example with tweaks.
    ch8: (ctx) => !ctx.error && ctx.src.split("\n").filter((l) => l.trim()).length >= 25 && ctx.copiedRatio() < 0.5,
  },
  quiz: [
    { q: "Why keep game state in one object (state.score, state.index…)?", options: ["Objects run faster", "One clear place to read, update and reset everything", "Variables are deprecated", "It's required by the DOM"], answer: 1, why: "Correct — scattered variables are how resets miss something." },
    { q: "A good \"play again\" button must…", options: ["Reload the page", "Put EVERY piece of state back to its starting value and re-render", "Only clear the screen", "Change the color"], answer: 1, why: "Right — if the score resets but the question index doesn't, you've got a bug." },
    { q: "Which is an edge case for a number-guessing game?", options: ["Guessing 7", "Clicking GUESS with an empty box", "Winning", "Starting the game"], answer: 1, why: "Yes — empty, weird, or out-of-range input is where bugs hide." },
    { q: "What's the cleanest way to make a game feel finished?", options: ["More colors", "Clear win/lose feedback a player instantly understands", "Longer code", "A loading spinner"], answer: 1, why: "Correct — players need to know what happened and what to do next." },
    { q: "Why deploy the game instead of leaving it in the sandbox?", options: ["Sandboxes are slow", "Real people can play it from a URL — and that's Ladder Level L1", "GitHub requires it", "It makes the code shorter"], answer: 1, why: "Right — shipping is part of building." },
  ],
});
