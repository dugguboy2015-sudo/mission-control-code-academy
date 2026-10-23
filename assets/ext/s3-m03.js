/* Mission 3.3 — GitHub & Pull Requests: quiz bank (the challenge happens on real GitHub, so items are self-checked) */
MCCA.ext("s3-m03", {
  objectives: {},
  quiz: [
    { q: "What is a Pull Request?", options: ["A way to download a repo", "A request to merge one branch into another, with a place to review and discuss it", "A git command", "A GitHub bug report"], answer: 1, why: "Correct — a PR is where changes get read and approved before they land." },
    { q: "What does git push -u origin feature/x do?", options: ["Merges feature/x into main", "Uploads the branch to GitHub and remembers it as the upstream", "Deletes the branch", "Opens a PR automatically"], answer: 1, why: "Right — after -u, plain git push knows where to go." },
    { q: "Which belongs in .gitignore?", options: ["index.html", "node_modules/ and .env", "README.md", "Your CSS"], answer: 1, why: "Yes — generated folders and secrets should never be committed." },
    { q: "Why read your own diff before merging?", options: ["GitHub requires it", "To catch changes you didn't mean to make — debug logs, stray edits, secrets", "It speeds up the merge", "It isn't useful"], answer: 1, why: "Correct — the diff is the truth about what's about to land." },
    { q: "You merged the PR on GitHub. Is your laptop's main updated?", options: ["Yes, automatically", "No — you have to git pull to bring it down", "Only if you restart", "Only the README"], answer: 1, why: "Right — GitHub changed; your local copy doesn't know until you pull." },
  ],
});
