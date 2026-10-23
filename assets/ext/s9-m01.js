/* Mission 9.1 — Testing Basics: auto-checks (they read the real test results) + quiz bank */
(function () {
  const results = () => window.__testResults || [];
  // A test() block that calls calculateTip with these exact arguments.
  const tested = (ctx, args) => new RegExp("test\\([\\s\\S]*?calculateTip\\(\\s*" + args.replace(/,\s*/, "\\s*,\\s*") + "\\s*\\)").test(ctx.src);
  MCCA.ext("s9-m01", {
    objectives: {
      ch1: (ctx) => !ctx.error && tested(ctx, "50, 0"),
      ch2: (ctx) => !ctx.error && tested(ctx, "0, 20"),
      ch3: (ctx) => !ctx.error && tested(ctx, "-10, 20"),
      // Fixed the bug itself (not the tests), and every test is green.
      ch4: (ctx) => {
        if (ctx.error || !/(calculateTip\s*=\s*(function|\()|function\s+calculateTip\s*\()/.test(ctx.src)) return false;
        const r = results();
        if (r.length < 4 || !r.every((x) => x.ok)) return false;
        try { return window.calculateTip(50, 0) === 0 && window.calculateTip(50, 20) === 10; } catch (e) { return false; }
      },
    },
    quiz: [
      { q: "What does a unit test check?", options: ["How fast the whole app loads", "That one small piece of code gives the right output for a given input", "The CSS", "That the server is up"], answer: 1, why: "Correct — small, fast, specific." },
      { q: "Why test edge cases like 0 or negative numbers?", options: ["For fun", "Bugs hide at the boundaries — the happy path usually works already", "They're required", "To make tests longer"], answer: 1, why: "Right — calculateTip passed the normal test and still had a bug." },
      { q: "A test fails after you change code. That usually means…", options: ["The test is broken, delete it", "Your change broke something — the test just saved you from shipping it", "JavaScript is flaky", "Nothing"], answer: 1, why: "Yes — that's the whole point." },
      { q: "if (!percent) return bill * 0.15 — why is that a bug when percent is 0?", options: ["It isn't", "0 is falsy, so a real 0% tip gets treated as \"missing\" and becomes 15%", "0 can't be a number", "The math is wrong for 15"], answer: 1, why: "Correct — check for undefined explicitly instead." },
      { q: "When should tests run?", options: ["Once a year", "Every time code changes — ideally automatically in CI", "Only before holidays", "Never in production code"], answer: 1, why: "Right — Mission 9.7 automates exactly that." },
    ],
  });
})();
