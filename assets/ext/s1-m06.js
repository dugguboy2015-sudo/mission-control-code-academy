/* Mission 1.6 — Responsive Design: widget auto-checks + quiz bank */
MCCA.ext("s1-m06", {
  trigger: "interaction",
  objectives: {
    // Looked at the layout on the far side of a breakpoint.
    ch2: (ctx) => parseInt(ctx.text("#rpCurrentWidth"), 10) >= 900,
    ch4: (ctx) => { const f = ctx.$("#posFloater"); return !!f && /^(relative|absolute|sticky|fixed)$/.test(f.style.position); },
  },
  quiz: [
    { q: "What does \"mobile-first\" CSS mean?", options: ["Only phones can view it", "Base styles target small screens; media queries ADD changes for bigger ones", "You build the app before the website", "Phones load CSS first"], answer: 1, why: "Correct — start simple and narrow, then enhance upward with min-width queries." },
    { q: "@media (min-width: 768px) { ... } applies when the screen is…", options: ["Narrower than 768px", "768px wide or wider", "Exactly 768px", "Rotated sideways"], answer: 1, why: "Right — min-width means \"at least this wide\"." },
    { q: "Which unit scales with the user's font-size setting?", options: ["px", "rem", "pt", "cm"], answer: 1, why: "Yes — rem is relative to the root font size, so it respects user preferences." },
    { q: "Which position value scrolls normally, then sticks once it reaches the top of its parent?", options: ["static", "absolute", "sticky", "relative"], answer: 2, why: "Correct — sticky scrolls normally, then sticks." },
    { q: "Why add <meta name=\"viewport\" content=\"width=device-width\">?", options: ["It makes images load faster", "It stops phones pretending to be a wide desktop screen", "It's needed for CSS to work", "It hides the scrollbar"], answer: 1, why: "Right — without it, phones zoom out and your media queries never kick in." },
  ],
});
