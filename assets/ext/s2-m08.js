/* Mission 2.8 — Events in Depth: auto-checks + quiz bank */
(function () {
  // A container in the ship display with 3+ item children, plus an add button.
  function built(ctx) {
    if (ctx.error || !ctx.displayEl) return false;
    const els = [ctx.displayEl].concat(Array.from(ctx.displayEl.querySelectorAll("*")));
    const container = els.some((el) => Array.from(el.children).filter((c) => !/^(BUTTON|INPUT|FORM)$/.test(c.tagName)).length >= 3);
    return container && !!ctx.displayEl.querySelector("button");
  }
  MCCA.ext("s2-m08", {
    objectives: {
      ch1: (ctx) => built(ctx),
      ch2: (ctx) => built(ctx) && /addEventListener\(\s*["']click["']\s*,[\s\S]*?\b(e|ev|evt|event)\.target\b/.test(ctx.src),
      ch3: (ctx) => built(ctx) && /\.target\.(matches|closest)\(/.test(ctx.src),
      ch5: (ctx) => !ctx.error && /addEventListener\(\s*["']submit["'][\s\S]*?\.preventDefault\(\s*\)/.test(ctx.src),
      ch6: (ctx) => !ctx.error && /addEventListener\(\s*["']input["'][\s\S]*?\.target\.value/.test(ctx.src),
    },
    quiz: [
      { q: "What is event bubbling?", options: ["Events firing twice by mistake", "An event travels up from the clicked element through each of its ancestors", "Animating bubbles on click", "Events that cancel themselves"], answer: 1, why: "Correct — that's exactly why a parent can hear a child's click." },
      { q: "Why does event delegation handle items added LATER?", options: ["It re-scans the page every second", "The one listener lives on the parent, and new children's clicks still bubble up to it", "New items copy old listeners", "It doesn't"], answer: 1, why: "Right — no new listener needed for new children." },
      { q: "What does event.preventDefault() do in a submit handler?", options: ["Deletes the form", "Stops the browser's default page reload", "Clears the inputs", "Stops bubbling"], answer: 1, why: "Yes — you handle the data in JavaScript instead of reloading." },
      { q: "Which event fires on every keystroke in a text field?", options: ["change", "input", "submit", "load"], answer: 1, why: "Correct — input fires live; change fires when the field loses focus." },
      { q: "event.target.closest(\".crew-item\") returns…", options: ["The nearest .crew-item at or above the clicked element (or null)", "The first .crew-item on the page", "All .crew-item elements", "The parent of the page"], answer: 0, why: "Right — closest walks UP from the target, so clicks on inner bits still find their item." },
    ],
  });
})();
