/* Mission 5.3 — Authentication: auto-checks + quiz bank (the starter already demonstrates item 1) */
(function () {
  const signIns = (ctx) => (ctx.src.match(/FakeAuth\.signInWithPassword\(/g) || []).length;
  MCCA.ext("s5-m03", {
    objectives: {
      ch2: (ctx) => !ctx.error && signIns(ctx) >= 1 && /Invalid login credentials/.test(ctx.output),
      ch3: (ctx) => !ctx.error && signIns(ctx) >= 2 && /Invalid login credentials/.test(ctx.output) && /[\w.+-]+@[\w-]+\.\w+/.test(ctx.output),
      ch4: (ctx) => !ctx.error && signIns(ctx) >= 2 && /renderCockpit\(\s*[\w.]*session\b/.test(ctx.src),
      ch5: (ctx) => !ctx.error && /FakeAuth\.signOut\(\)[\s\S]*renderCockpit\(\s*null\s*\)/.test(ctx.src) && /SIGNED OUT/.test(ctx.display),
    },
    quiz: [
      { q: "What's the difference between authentication and authorization?", options: ["Same thing", "Authentication = who you are; authorization = what you're allowed to do", "Authorization comes first", "Authentication is only for admins"], answer: 1, why: "Correct — log in proves identity; permissions decide access." },
      { q: "Why do good login forms say \"Invalid login credentials\" instead of \"Wrong password\"?", options: ["It's shorter", "So attackers can't learn which emails have accounts", "It's a bug", "Browsers require it"], answer: 1, why: "Right — vague errors don't leak who's registered." },
      { q: "What is a session?", options: ["A password", "Proof — usually a token — that you've already signed in", "A database table", "A cookie recipe"], answer: 1, why: "Yes — the app checks the session instead of asking for your password every time." },
      { q: "Where should you NEVER store a user's plain password?", options: ["Anywhere in your own code or database", "In the auth provider", "In your head", "Nowhere is fine"], answer: 0, why: "Correct — let the auth service hash it; never keep raw passwords." },
      { q: "A page hides the dashboard with CSS when signed out. Is the data safe?", options: ["Yes", "No — hiding isn't security; the server must refuse to send the data", "Only on mobile", "Only with HTTPS"], answer: 1, why: "Right — real protection lives on the server (like Row Level Security)." },
    ],
  });
})();
