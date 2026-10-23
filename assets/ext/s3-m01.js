/* Mission 3.1 — Git Fundamentals: git-simulator auto-checks + quiz bank
   (Items 1–2 happen in a real terminal; 3–6 can be proven in the simulator.) */
(function () {
  // [{branch, cmd, out: [..], err}] from the simulated console's transcript.
  function transcript(ctx) {
    const rows = [];
    ctx.$$("#termBody .terminal-line").forEach((el) => {
      if (el.classList.contains("echo")) {
        const m = el.textContent.match(/^(\S+) \$ (.*)$/);
        if (m) rows.push({ branch: m[1], cmd: m[2].trim(), out: [], err: false });
      } else if (rows.length) {
        rows[rows.length - 1].out.push(el.textContent);
        if (el.classList.contains("err")) rows[rows.length - 1].err = true;
      }
    });
    // Only what happened since the last `reset`.
    const r = rows.map((x) => x.cmd).lastIndexOf("reset");
    return r === -1 ? rows : rows.slice(r + 1);
  }
  const ok = (t, test) => t.findIndex((x) => !x.err && test(x));
  MCCA.ext("s3-m01", {
    trigger: "interaction",
    objectives: {
      ch3: (ctx) => ok(transcript(ctx), (x) => x.cmd === "git checkout -b experiment") !== -1,
      ch4: (ctx) => ok(transcript(ctx), (x) => x.branch === "experiment" && /^git commit -m ['"].{3,}['"]$/.test(x.cmd)) !== -1,
      ch5: (ctx) => {
        const t = transcript(ctx);
        const c = ok(t, (x) => x.branch === "experiment" && /^git commit -m/.test(x.cmd));
        return c !== -1 && t.slice(c + 1).some((x) => !x.err && x.cmd === "git checkout main");
      },
      ch6: (ctx) => ok(transcript(ctx), (x) => x.branch === "main" && x.cmd === "git merge experiment" && x.out.some((o) => /Merge made|Fast-forward|incorporated/.test(o))) !== -1,
    },
    quiz: [
      { q: "What does git commit actually save?", options: ["Only the file you last edited", "A snapshot of everything you staged, with a message", "Your whole computer", "It uploads to GitHub"], answer: 1, why: "Correct — a commit is a labelled snapshot of the staged changes." },
      { q: "What does git add do?", options: ["Creates a new file", "Stages changes so the next commit includes them", "Adds a collaborator", "Pushes to GitHub"], answer: 1, why: "Right — add picks WHAT goes into the next snapshot." },
      { q: "Which commit message is best?", options: ["update", "stuff", "Add launch countdown to the home page", "asdf"], answer: 2, why: "Yes — future-you should know what changed without opening the diff." },
      { q: "You switch to a branch and your new sentence vanishes from log.txt. Why?", options: ["Git deleted it", "That change lives on the other branch — switching swaps the files to this branch's snapshot", "The file is corrupted", "You need to save again"], answer: 1, why: "Correct — that isolation is the whole point of branches." },
      { q: "Does git init upload anything to GitHub?", options: ["Yes, immediately", "No — it just starts tracking history in this folder, on your machine", "Only the README", "Only if you're logged in"], answer: 1, why: "Right — Git is local first. GitHub only gets involved when you push." },
    ],
  });
})();
