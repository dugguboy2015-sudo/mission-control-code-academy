/* Mission 0.4 — Learning How to Learn: trainer auto-checks + quiz bank (items 4–5 happen off-screen) */
(function () {
  const words = (s) => (String(s || "").match(/\S+/g) || []).length;
  MCCA.ext("s0-m04", {
    trigger: "interaction",
    objectives: {
      ch1: (ctx) => ctx.$$(".scenario").length === 5 && ctx.$$(".scenario.solved").length === 5,
      ch2: (ctx) => ctx.$$("#helpMeter .on").length === 4 && words(ctx.val("#helpRequest")) >= 30,
      ch3: (ctx) => ["#logLearned", "#logConfused", "#logNext"].every((s) => words(ctx.val(s)) >= 4),
    },
    quiz: [
      { q: "What is rubber-duck debugging?", options: ["Testing code in the bath", "Explaining your code out loud, line by line, until you spot the mistake", "A debugging app", "Asking a duck"], answer: 1, why: "Correct — explaining forces you to read what the code really says." },
      { q: "Which help request is most likely to get a useful answer?", options: ["\"It doesn't work\"", "\"Help!!!\"", "\"I'm trying to X; I get error Y on line 4; I already tried Z; here's the code\"", "\"Fix my project\""], answer: 2, why: "Right — goal, what happens, what you tried, details." },
      { q: "Why does testing yourself work better than re-reading?", options: ["It's faster", "Struggling to recall something is what makes the memory stronger", "Reading is bad", "It doesn't"], answer: 1, why: "Yes — retrieval practice builds memory." },
      { q: "Four 25-minute sessions vs. one 100-minute session. Which usually sticks better?", options: ["The single long session", "The four short sessions, spread over days", "They're identical", "Neither"], answer: 1, why: "Correct — spacing practice out is one of the best-proven learning tricks." },
      { q: "You've been stuck for 40 minutes and you're frustrated. A smart move is…", options: ["Push on for hours", "Take a real 10-minute break away from the screen", "Delete everything", "Copy random code"], answer: 1, why: "Right — fresh eyes find what tired eyes miss." },
    ],
  });
})();
