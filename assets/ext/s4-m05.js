/* Mission 4.5 — Deployment: quiz bank (the challenge is a real deploy, so items are self-checked) */
MCCA.ext("s4-m05", {
  objectives: {},
  quiz: [
    { q: "What does \"deploying\" a site mean?", options: ["Deleting the old version", "Putting it on a server so anyone with the URL can use it", "Running it on your laptop", "Writing the README"], answer: 1, why: "Correct — deployed means it no longer depends on your computer." },
    { q: "Your CSS works locally but not after deploy. A likely cause?", options: ["The server hates CSS", "A wrong path — like a capital letter mismatch or an absolute C:\\ path", "CSS isn't allowed on GitHub Pages", "Too many colors"], answer: 1, why: "Right — live servers are case-sensitive and can't see your hard drive." },
    { q: "What is a static site?", options: ["A site that never changes", "Plain files (HTML, CSS, JS) served as-is, with no server code running", "A site with a database", "A site with no JavaScript"], answer: 1, why: "Yes — perfect for GitHub Pages and Cloudflare Pages." },
    { q: "Why test the live URL on a different device?", options: ["To check the font", "It proves the site works for real visitors, not just your cached laptop", "Phones are faster", "It's required by GitHub"], answer: 1, why: "Correct — the real test is someone else's device." },
    { q: "After you push a new commit, what happens to a GitHub Pages site?", options: ["Nothing until you redeploy by hand", "It rebuilds and updates automatically in a minute or two", "It goes offline", "It creates a new URL"], answer: 1, why: "Right — push to the branch and the live site follows." },
  ],
});
