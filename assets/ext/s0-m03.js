/* Mission 0.3 — Your Workshop: terminal-simulator auto-checks + quiz bank */
(function () {
  // Read the simulated terminal's transcript as [{cmd, out[]}].
  function transcript(ctx) {
    const lines = ctx.$$("#fsOutput .fsterm-line");
    const cmds = [];
    lines.forEach((el) => {
      const p = el.querySelector(".p");
      if (p) cmds.push({ cmd: el.textContent.slice(p.textContent.length).trim(), out: [], err: false });
      else if (cmds.length) { cmds[cmds.length - 1].out.push(el.textContent); if (el.querySelector(".err")) cmds[cmds.length - 1].err = true; }
    });
    return cmds;
  }
  MCCA.ext("s0-m03", {
    trigger: "interaction",
    objectives: {
      ch1: (ctx) => transcript(ctx).some((c) => c.cmd === "pwd" && !c.err),
      ch2: (ctx) => {
        const t = transcript(ctx);
        const i = t.findIndex((c) => /^cd\s+[^.~\s]/.test(c.cmd) && !c.err);
        return i !== -1 && t.slice(i + 1).some((c) => c.cmd === "ls" && !c.err);
      },
      ch3: (ctx) => transcript(ctx).some((c) => /^mkdir\s+\S+/.test(c.cmd) && !c.err),
    },
    quiz: [
      { q: "What does the command pwd print?", options: ["A list of files", "The folder you're currently in", "Your password", "The previous command"], answer: 1, why: "Correct — pwd = print working directory: where you are right now." },
      { q: "You're in /academy/missions. What does cd .. do?", options: ["Deletes the missions folder", "Moves you up to /academy", "Opens a file called ..", "Nothing"], answer: 1, why: "Right — .. always means \"the parent folder\"." },
      { q: "Which command creates a new folder?", options: ["ls", "cd", "mkdir", "pwd"], answer: 2, why: "Yes — mkdir = make directory." },
      { q: "An AI assistant hands you code. What's the FIRST thing you should do?", options: ["Paste it in and ship it", "Read it and make sure you can explain every line", "Ask it to make the code longer", "Delete your own code"], answer: 1, why: "Correct — if you can't explain it, you can't trust it or fix it." },
      { q: "What is an \"edge case\"?", options: ["Code at the bottom of a file", "An unusual input — empty, huge, or weird — that might break the code", "A CSS border", "A keyboard shortcut"], answer: 1, why: "Right — edge cases are the strange inputs real users will eventually send." },
    ],
  });
})();
