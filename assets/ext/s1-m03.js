/* Mission 1.3 — CSS Fundamentals: box-model inspector auto-checks + quiz bank */
MCCA.ext("s1-m03", {
  trigger: "interaction",
  objectives: {
    // Three distinct, non-default values so every layer is visible.
    ch2: (ctx) => {
      const p = +ctx.val("#bmiPadding"), b = +ctx.val("#bmiBorder"), m = +ctx.val("#bmiMargin");
      return !(p === 16 && b === 4 && m === 16) && p > 0 && b > 0 && m > 0 && new Set([p, b, m]).size === 3;
    },
    // border-box on, padding changed, and the outer size held at the declared 240×120.
    ch3: (ctx) => !!ctx.$("#bmiBorderBoxBtn.active") && +ctx.val("#bmiPadding") !== 16 && ctx.text("#bmiDimBorder").trim() === "240×120",
  },
  quiz: [
    { q: "From the inside out, what are the four layers of the box model?", options: ["Margin, border, padding, content", "Content, padding, border, margin", "Content, border, padding, margin", "Padding, content, margin, border"], answer: 1, why: "Correct — content, then padding, then border, then margin on the outside." },
    { q: "Which layer is transparent space OUTSIDE the border that pushes other elements away?", options: ["Padding", "Content", "Margin", "Outline"], answer: 2, why: "Right — margin is outside the border; padding is inside it." },
    { q: "Which selector is MORE specific?", options: [".card", "#hero", "p", "div p"], answer: 1, why: "Yes — an id beats a class, which beats an element selector." },
    { q: "What does .status-card p select?", options: ["Every p on the page", "Only p elements inside an element with class status-card", "An element with class \"status-card p\"", "The first p after the card"], answer: 1, why: "Correct — a descendant selector: p elements that live somewhere inside .status-card." },
    { q: "Two rules with equal specificity set different colors on the same element. Which wins?", options: ["The first one", "The one written LATER in the CSS", "Neither — the colors blend", "The browser picks randomly"], answer: 1, why: "Right — on a tie, the later rule in the cascade wins." },
  ],
});
