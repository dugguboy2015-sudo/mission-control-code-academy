/* Mission 1.4 — Flexbox: playground auto-checks + quiz bank */
MCCA.ext("s1-m04", {
  trigger: "interaction",
  objectives: {
    ch3: (ctx) => /justify-content:\s*space-between/.test(ctx.text("#cssOutput")),
    ch4: (ctx) => /align-items:\s*center/.test(ctx.text("#cssOutput")),
    // Wrapping only shows when there are enough items to overflow.
    ch6: (ctx) => /flex-wrap:\s*wrap;/.test(ctx.text("#cssOutput")) && ctx.$$("#flexStage .flex-box").length === 8,
  },
  quiz: [
    { q: "In a default flex row, which property spreads items along the row (left ↔ right)?", options: ["align-items", "justify-content", "flex-wrap", "gap"], answer: 1, why: "Correct — justify-content works on the main axis, which is horizontal in a row." },
    { q: "What does gap: 16px do in a flex container?", options: ["Adds 16px padding around the container", "Puts 16px of space between items", "Makes each item 16px wide", "Adds a 16px margin to the page"], answer: 1, why: "Right — gap adds space only BETWEEN items, never on the outer edges." },
    { q: "Items overflow off a narrow screen. Which property lets them move onto a new line?", options: ["flex-wrap: wrap", "flex-direction: row", "align-items: center", "justify-content: center"], answer: 0, why: "Yes — by default flex items squeeze onto one line; wrap lets them flow to the next." },
    { q: "Which pair centers ONE child both horizontally and vertically in a flex parent?", options: ["text-align: center", "justify-content: center + align-items: center", "margin: center", "vertical-align: middle"], answer: 1, why: "Correct — the classic flexbox centering pair." },
    { q: "Flexbox is designed mainly for layout in…", options: ["One dimension — a row OR a column", "Two dimensions at once", "Three dimensions", "Only text"], answer: 0, why: "Right — flexbox is one-dimensional; grid is the two-dimensional tool." },
  ],
});
