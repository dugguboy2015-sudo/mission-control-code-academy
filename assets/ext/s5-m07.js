/* Mission 5.7 — Capstone: Full-Stack CRUD: quiz bank (the challenge is a real deployed app, so items are self-checked) */
MCCA.ext("s5-m07", {
  objectives: {},
  quiz: [
    { q: "What does onAuthStateChange do?", options: ["Changes the password", "Runs your callback whenever the user signs in or out", "Deletes the session", "Refreshes the page"], answer: 1, why: "Correct — it's how the UI stays in sync with the session." },
    { q: "Why must .env be listed in .gitignore BEFORE your first commit?", options: ["Git is faster", "Once a secret is committed it lives in history even if you delete the file later", "GitHub requires it", "It isn't needed"], answer: 1, why: "Right — removing it later doesn't erase it from history." },
    { q: "Where do your Supabase keys go for the deployed site on Cloudflare Pages?", options: ["In the README", "In the project's Environment Variables settings", "In a public JS file", "Emailed to yourself"], answer: 1, why: "Yes — the platform injects them at build time." },
    { q: "What protects one user's rows from another user in Supabase?", options: ["Hiding the dashboard", "Row Level Security policies on the database", "A long URL", "HTTPS alone"], answer: 1, why: "Correct — RLS is enforced by the database itself." },
    { q: "Ladder Level for this capstone: a live URL with real accounts. What makes it \"full-stack\"?", options: ["It has CSS", "It has a front end AND a real backend (auth + database) working together", "It's long", "It uses React"], answer: 1, why: "Right — both halves, live." },
  ],
});
