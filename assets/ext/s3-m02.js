/* Mission 3.2 — Branching & Merging: conflict-simulator auto-checks + quiz bank */
(function () {
  function transcript(ctx) {
    const rows = [];
    ctx.$$("#termBody .terminal-line").forEach((el) => {
      if (el.classList.contains("echo")) {
        const m = el.textContent.match(/^(\S+) \$ (.*)$/);
        if (m) rows.push({ branch: m[1], cmd: m[2].trim(), out: [], err: false });
      } else if (rows.length) {
        rows[rows.length - 1].out.push(el.textContent);
        if (el.classList.contains("err") && !/CONFLICT|Automatic merge failed/.test(el.textContent)) rows[rows.length - 1].err = true;
      }
    });
    const r = rows.map((x) => x.cmd).lastIndexOf("reset");
    return r === -1 ? rows : rows.slice(r + 1);
  }
  const has = (t, test) => t.some(test);
  MCCA.ext("s3-m02", {
    trigger: "interaction",
    objectives: {
      ch1: (ctx) => transcript(ctx).filter((x) => x.branch === "main" && !x.err && /^git (checkout -b|branch) \S+$/.test(x.cmd)).length >= 2,
      ch2: (ctx) => {
        const t = transcript(ctx);
        const committedOn = new Set(t.filter((x) => !x.err && x.branch !== "main" && /^git commit -m/.test(x.cmd) && x.out.some((o) => /^\[/.test(o))).map((x) => x.branch));
        return committedOn.size >= 2;
      },
      ch3: (ctx) => has(transcript(ctx), (x) => /^git merge /.test(x.cmd) && x.out.some((o) => /Fast-forward/.test(o))),
      ch4: (ctx) => has(transcript(ctx), (x) => /^git merge /.test(x.cmd) && x.out.some((o) => /CONFLICT/.test(o))),
      ch5: (ctx) => has(transcript(ctx), (x) => /^resolve /.test(x.cmd) && x.out.some((o) => /resolved/.test(o))),
      ch6: (ctx) => has(transcript(ctx), (x) => /^git commit/.test(x.cmd) && x.out.some((o) => /Merge conflict resolved and committed/.test(o))),
    },
    quiz: [
      { q: "When does Git do a \"fast-forward\" merge?", options: ["Always", "When main hasn't moved since you branched, so Git just slides main forward", "When there's a conflict", "When you use --fast"], answer: 1, why: "Correct — no new commits on main means no real merging is needed." },
      { q: "When does a merge conflict happen?", options: ["Whenever two branches exist", "When both branches changed the SAME lines differently", "When files have different names", "When you commit too often"], answer: 1, why: "Right — Git can't guess which version of that line you want." },
      { q: "In a conflict, what's between ======= and >>>>>>> branch-name?", options: ["Your current branch's version", "The incoming branch's version", "The original version", "Git's suggestion"], answer: 1, why: "Yes — HEAD's version is on top; the merged-in branch's version is below." },
      { q: "After resolving the file, what finishes the merge?", options: ["Delete the branch", "git add the file, then git commit", "git push", "Restart Git"], answer: 1, why: "Correct — staging marks it resolved; the commit completes the merge." },
      { q: "Panic button: how do you back out of a messy merge entirely?", options: ["Delete the repo", "git merge --abort", "git reset --everything", "Close the terminal"], answer: 1, why: "Right — abort puts things back exactly as they were before the merge." },
    ],
  });
})();
