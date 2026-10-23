/* Mission 2.3 — Loops: auto-checks + quiz bank (the starter's 1–10 sum is item 1's worked example) */
MCCA.ext("s2-m03", {
  objectives: {
    ch2: (ctx) => !ctx.error && /\bwhile\s*\([^)]+\)/.test(ctx.src) && ctx.output.split("\n").filter(Boolean).length >= 2,
    ch3: (ctx) => {
      if (ctx.error) return false;
      const m = ctx.src.match(/for\s*\(\s*(?:const|let|var)\s+\w+\s+of\s+(\w+)\s*\)/);
      if (!m) return false;
      const arr = ctx.src.match(new RegExp("\\b" + m[1] + "\\s*=\\s*\\[([^\\]]*)\\]"));
      return !!arr && (arr[1].match(/["'`][^"'`]+["'`]/g) || []).length >= 3;
    },
    ch4: (ctx) => !ctx.error && /\b(break|continue)\s*;?/.test(ctx.src) && /\bif\s*\(/.test(ctx.src),
    ch5: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 6 && !/Try me/.test(c)
      && /\b(each|every|pass|until|stop|stops|ends|while|condition|increase|decrease|adds|grows|shrinks)\b/i.test(c)),
  },
  quiz: [
    { q: "How many times does for (let i = 0; i < 3; i++) run its body?", options: ["2", "3", "4", "Forever"], answer: 1, why: "Correct — i is 0, 1, 2; at 3 the condition fails." },
    { q: "What does break do inside a loop?", options: ["Skips to the next pass", "Exits the loop immediately", "Crashes the program", "Restarts the loop"], answer: 1, why: "Right — break leaves the loop entirely. continue skips just the current pass." },
    { q: "When is a while loop a better fit than a for loop?", options: ["Never", "When you don't know in advance how many passes it will take", "Only for arrays", "When counting from 1 to 10"], answer: 1, why: "Yes — while is for \"keep going until something changes\"." },
    { q: "for (const name of crew) — what is name each pass?", options: ["The index (0, 1, 2…)", "The next item in the crew array", "The array's length", "Always the first item"], answer: 1, why: "Correct — for...of hands you each value directly." },
    { q: "Your while loop never stops. What's the most likely cause?", options: ["The browser is slow", "Nothing inside the loop changes the value the condition checks", "You used const", "Loops always stop eventually"], answer: 1, why: "Right — something in the body must move toward the exit condition." },
  ],
});
