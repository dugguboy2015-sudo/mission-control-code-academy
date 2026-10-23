/* Mission 2.1 — JS Foundations: auto-checks + quiz bank */
MCCA.ext("s2-m01", {
  objectives: {
    ch2: (ctx) => !ctx.error && /\blet\s+clicks\s*=\s*0\b/.test(ctx.src),
    ch3: (ctx) => !ctx.error && /addEventListener\(\s*["']click["'][\s\S]*\bclicks\s*(\+\+|\+=\s*1\b|=\s*clicks\s*\+\s*1\b)/.test(ctx.src),
    ch4: (ctx) => !ctx.error && /addEventListener\(\s*["']click["'][\s\S]*\.textContent\s*=[^;\n]*\bclicks\b/.test(ctx.src),
    ch5: (ctx) => !ctx.error && /if\s*\(\s*clicks\s*(>=|===|==|>)\s*\d+\s*\)[\s\S]*?\.style\.color\s*=/.test(ctx.src),
  },
  quiz: [
    { q: "What's the difference between let and const?", options: ["const is faster", "A let variable can be reassigned; a const one can't", "let is only for numbers", "There is none"], answer: 1, why: "Correct — use const by default, let when the value must change." },
    { q: "What does clicks++ do?", options: ["Adds 2 to clicks", "Adds 1 to clicks", "Checks if clicks is positive", "Creates a variable called clicks++"], answer: 1, why: "Right — it's shorthand for clicks = clicks + 1." },
    { q: "What does element.textContent = \"HELLO\" do?", options: ["Logs HELLO to the console", "Replaces the element's text with HELLO", "Adds a CSS class", "Creates a new element"], answer: 1, why: "Yes — it sets the visible text inside that element." },
    { q: "Where does console.log output appear?", options: ["On the page for visitors", "In the console — a developer's tool", "In a pop-up", "In the address bar"], answer: 1, why: "Correct — console.log is for you, the developer, not your users." },
    { q: "In display.addEventListener(\"click\", fn), when does fn run?", options: ["Immediately, once", "Every time someone clicks that element", "When the page loads", "Never — it needs a return"], answer: 1, why: "Right — the listener waits and runs fn on every click." },
  ],
});
