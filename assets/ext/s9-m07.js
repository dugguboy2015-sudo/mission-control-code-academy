/* Mission 9.7 — CI/CD: auto-checks + quiz bank (the starter already demonstrates item 1; item 4 is a real file) */
(function () {
  const testThrows = (ctx) => /name\s*:\s*["']test["']\s*,\s*run\s*:[\s\S]*?throw\s+new\s+Error\(/.test(ctx.src);
  MCCA.ext("s9-m07", {
    objectives: {
      ch2: (ctx) => !ctx.error && testThrows(ctx) && /Pipeline stopped at: test/.test(ctx.display)
        && !/Deployed to production/.test(ctx.output) && !/NEVER print/.test(ctx.output),
      // The report names the failing step AND the reason you threw.
      ch3: (ctx) => {
        if (ctx.error || !testThrows(ctx)) return false;
        const m = ctx.src.match(/name\s*:\s*["']test["'][\s\S]*?throw\s+new\s+Error\(\s*(["'`])([\s\S]*?)\1/);
        return !!m && (ctx.output + ctx.display).includes(m[2]) && /stoppedAt|test/.test(ctx.output);
      },
    },
    quiz: [
      { q: "What does CI (continuous integration) do?", options: ["Writes code for you", "Automatically runs checks like lint and tests on every push", "Hosts your site", "Merges every PR"], answer: 1, why: "Correct — every change gets checked the same way." },
      { q: "Why does the pipeline STOP at a failing test?", options: ["To save electricity", "So broken code never reaches build or deploy", "It's a bug", "Tests are slow"], answer: 1, why: "Right — fail fast, ship nothing broken." },
      { q: "CD (continuous deployment) means…", options: ["Burning a CD", "Code that passes every check is deployed automatically", "Deploying once a year", "Manual uploads"], answer: 1, why: "Yes — small, frequent, safe releases." },
      { q: "Where do GitHub Actions workflows live?", options: ["In the README", "In .github/workflows/*.yml in the repo", "In package.json", "On your desktop"], answer: 1, why: "Correct — they're versioned with your code." },
      { q: "A good pipeline failure message says…", options: ["\"Something went wrong\"", "Which step failed and exactly why", "Nothing", "\"Try again\""], answer: 1, why: "Right — you should know what to fix without digging." },
    ],
  });
})();
