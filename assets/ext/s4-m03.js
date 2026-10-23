/* Mission 4.3 — Fetch & APIs: auto-checks + quiz bank */
(function () {
  // Fetched (and rendered) something other than the starter's pikachu.
  const otherPokemon = (ctx) => /pokeapi\.co\/api\/v2\/pokemon\//.test(ctx.src)
    && (/pokeapi\.co\/api\/v2\/pokemon\/(?!pikachu\b)[a-z][a-z0-9-]*/.test(ctx.src) || (ctx.display.trim() !== "" && !/pikachu/i.test(ctx.display)));
  const asyncVersion = (ctx) => /async\s+(function\b|\()[\s\S]*?await\s+fetch\(/.test(ctx.src) && !/\.then\(/.test(ctx.src);
  MCCA.ext("s4-m03", {
    objectives: {
      ch1: (ctx) => !ctx.error && otherPokemon(ctx) && !/Loading|ERROR/i.test(ctx.display) && ctx.display.trim() !== "",
      ch2: (ctx) => {
        if (ctx.error || !otherPokemon(ctx)) return false;
        const fields = new Set((ctx.src.match(/\bdata\.(\w+)/g) || []).map((f) => f.split(".")[1]).filter((f) => f !== "sprites"));
        return fields.size >= 3 && !/Loading|ERROR/i.test(ctx.display);
      },
      ch3: (ctx) => !ctx.error && /response\.ok|res\.ok|\.ok\b/.test(ctx.src) && /(error|not found|no pok|couldn'?t|could not)/i.test(ctx.display),
      ch4: (ctx) => !ctx.error && asyncVersion(ctx),
      ch5: (ctx) => !ctx.error && asyncVersion(ctx) && !!(ctx.displayEl && ctx.displayEl.querySelector("img[src*='sprites']")),
      ch6: (ctx) => !ctx.error && (ctx.src.match(/console\.log\(/g) || []).length >= 3 && ctx.output.split("\n").filter(Boolean).length >= 3,
    },
    quiz: [
      { q: "What is an API, in plain words?", options: ["A programming language", "A way for one program to ask another for data or actions", "A type of database", "A web browser"], answer: 1, why: "Correct — you send a request in an agreed format, you get a response back." },
      { q: "Why do you need response.json() after fetch?", options: ["To send data", "The body arrives as raw text — json() parses it into a JavaScript object", "To check for errors", "It's optional"], answer: 1, why: "Right — and it returns a Promise too, so you await it." },
      { q: "What does status 404 from an API mean?", options: ["Server crashed", "The thing you asked for doesn't exist", "Success", "You're offline"], answer: 1, why: "Yes — and fetch does NOT reject on a 404, so check response.ok." },
      { q: "What does JSON stand for?", options: ["Java Source Object Notation", "JavaScript Object Notation", "Just Some Ordered Numbers", "JSON Server Online Network"], answer: 1, why: "Correct — text formatted like JS objects and arrays." },
      { q: "Where's the best place to show the user that a request failed?", options: ["Only in console.error", "On the page, in plain words, with what they can do next", "Nowhere", "In an alert every second"], answer: 1, why: "Right — users never see the console." },
    ],
  });
})();
