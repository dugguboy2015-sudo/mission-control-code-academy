/* Mission 1.5 — CSS Grid: playground auto-checks + quiz bank */
MCCA.ext("s1-m05", {
  trigger: "interaction",
  objectives: {
    ch3: (ctx) => /grid-template-columns:\s*repeat\(\d+,\s*1fr\)/.test(ctx.text("#cssOutput")),
    ch5: (ctx) => ctx.$$("#gridStage .grid-box.spanned").length === 1 && /grid-column:\s*span 2/.test(ctx.text("#cssOutput")),
  },
  quiz: [
    { q: "What does 1fr mean in grid-template-columns?", options: ["One pixel", "One fraction of the leftover space", "One full row", "First row"], answer: 1, why: "Correct — fr shares out the free space; 1fr 1fr 1fr = three equal columns." },
    { q: "repeat(4, 1fr) is shorthand for…", options: ["4fr", "1fr 1fr 1fr 1fr", "4 rows", "1fr repeated forever"], answer: 1, why: "Right — repeat saves typing the same track over and over." },
    { q: "Which property makes an item stretch across two columns?", options: ["grid-column: span 2", "column-count: 2", "width: 200%", "flex: 2"], answer: 0, why: "Yes — span 2 says \"take up two column tracks\"." },
    { q: "With 3 columns and 7 items, where does item 7 go?", options: ["It's hidden", "Onto a new row automatically", "It squeezes into column 3", "The grid errors"], answer: 1, why: "Correct — grid auto-places extra items onto new rows." },
    { q: "grid-template-columns: 200px 1fr gives you…", options: ["Two equal columns", "A fixed 200px column plus one that takes the rest", "200 columns", "One column 200px wide"], answer: 1, why: "Right — a classic sidebar + main content layout." },
  ],
});
