/* Mission 9.5 — Security Basics: auto-checks + quiz bank */
(function () {
  const calls = (ctx) => Array.from(ctx.src.matchAll(/renderComment\(\s*([\w$]+|(["'`])[\s\S]*?\2)\s*,\s*(true|false)\s*\)/g)).map((m) => ({ arg: m[1], unsafe: m[3] === "true" }));
  // The literal value of a payload argument (inline string or a const it names).
  function payload(ctx, arg) {
    if (/^["'`]/.test(arg)) return arg.slice(1, -1);
    const m = ctx.src.match(new RegExp("(?:const|let|var)\\s+" + arg + "\\s*=\\s*(['\"`])([\\s\\S]*?)\\1\\s*;"));
    return m ? m[2] : "";
  }
  MCCA.ext("s9-m05", {
    objectives: {
      ch1: (ctx) => !ctx.error && calls(ctx).some((c) => c.unsafe && /onerror/i.test(payload(ctx, c.arg))) && window.__xssFired === true,
      ch2: (ctx) => {
        if (ctx.error) return false;
        const c = calls(ctx);
        return c.some((x) => x.unsafe && /onerror/i.test(payload(ctx, x.arg))) && c.some((x) => !x.unsafe && /onerror/i.test(payload(ctx, x.arg)));
      },
      ch3: (ctx) => {
        if (ctx.error) return false;
        const own = calls(ctx).filter((c) => /<(?!img\b)[a-z]+[\s>]/i.test(payload(ctx, c.arg)));
        return own.some((c) => c.unsafe) && own.some((c) => !c.unsafe);
      },
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /innerHTML/i.test(c)),
    },
    quiz: [
      { q: "What is XSS (cross-site scripting)?", options: ["A CSS framework", "Getting a page to run an attacker's script by injecting it as content", "A fast server", "A login method"], answer: 1, why: "Correct — usually via user-supplied text inserted as HTML." },
      { q: "Which is safe for displaying a user's comment?", options: ["el.innerHTML = comment", "el.textContent = comment", "document.write(comment)", "eval(comment)"], answer: 1, why: "Right — textContent shows tags as plain text." },
      { q: "Where should passwords and API keys live?", options: ["In the front-end JS", "Server-side, in environment variables/secrets", "In the README", "In localStorage"], answer: 1, why: "Yes — never ship secrets to the browser." },
      { q: "Is input validation in the browser enough?", options: ["Yes", "No — anyone can bypass the browser; the server must validate too", "Only for numbers", "Only with HTTPS"], answer: 1, why: "Correct — the browser is under the user's control." },
      { q: "HTTPS protects…", options: ["Your code from bugs", "Data in transit between the browser and server from being read or changed", "Your database", "Against XSS"], answer: 1, why: "Right — it doesn't fix bugs in your own page." },
    ],
  });
})();
