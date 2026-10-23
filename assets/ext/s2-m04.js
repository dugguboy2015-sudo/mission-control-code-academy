/* Mission 2.4 — Functions in Depth: auto-check + quiz bank
   (The starter already demonstrates items 1–4 and 6; the check proves
   item 5 — that two closures from one maker really are independent.) */
MCCA.ext("s2-m04", {
  objectives: {
    ch5: (ctx) => {
      if (ctx.error) return false;
      const makers = Array.from(ctx.src.matchAll(/function\s+(make\w+)\s*\(/g)).map((m) => m[1]);
      return makers.some((name) => {
        const instances = (ctx.src.match(new RegExp("(?:const|let|var)\\s+\\w+\\s*=\\s*" + name + "\\s*\\(", "g")) || []).length;
        if (instances < 2) return false;
        const make = ctx.grab(name)[name];
        if (typeof make !== "function") return false;
        try {
          const a = make(100), b = make(100);
          if (typeof a !== "function" || typeof b !== "function") return false;
          const a1 = a(10), a2 = a(10), b1 = b(10);
          return a1 !== a2 && JSON.stringify(b1) === JSON.stringify(a1);
        } catch (e) { return false; }
      });
    },
  },
  quiz: [
    { q: "function greet(name = \"cadet\") — what does greet() return-use for name?", options: ["undefined", "\"cadet\"", "null", "An error"], answer: 1, why: "Correct — a default parameter fills in when no argument is passed." },
    { q: "What is a guard clause?", options: ["A comment at the top of a function", "An early return that handles a special case first", "A try/catch block", "A security feature"], answer: 1, why: "Right — guard clauses exit early and keep the main path un-nested." },
    { q: "What is a closure?", options: ["A function that closes the browser", "An inner function that remembers variables from where it was created", "The last line of a function", "A function with no parameters"], answer: 1, why: "Yes — the inner function keeps access to its outer variables, even later." },
    { q: "A function has no return statement. What does calling it give back?", options: ["0", "null", "undefined", "The last line's value"], answer: 2, why: "Correct — no return means undefined." },
    { q: "Why is a function with ONE job easier to work with?", options: ["It runs faster", "It's easier to name, test, reuse and fix", "JavaScript requires it", "It uses less memory"], answer: 1, why: "Right — small, focused functions are the backbone of readable code." },
  ],
});
