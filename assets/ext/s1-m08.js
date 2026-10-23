/* Mission 1.8 — Design Fundamentals: contrast-checker auto-check + quiz bank */
(function () {
  const initial = { fg: "#E8ECFB", bg: "#1B2540" };
  MCCA.ext("s1-m08", {
    trigger: "interaction",
    objectives: {
      // Tried your own colour pair and landed on one that passes AA for body text.
      ch1: (ctx) => {
        const fg = ctx.val("#fgHex").toUpperCase(), bg = ctx.val("#bgHex").toUpperCase();
        const presets = ctx.$$(".preset-btn").map((b) => (b.getAttribute("data-fg") + "|" + b.getAttribute("data-bg")).toUpperCase());
        if ((fg === initial.fg && bg === initial.bg) || presets.includes(fg + "|" + bg)) return false;
        return parseFloat(ctx.text("#ratioOut")) >= 4.5;
      },
    },
    quiz: [
      { q: "Large text (about 24px, or 19px bold) needs a contrast ratio of at least…", options: ["1.5:1", "3:1", "4.5:1", "10:1"], answer: 1, why: "Correct — large text is easier to read, so AA allows 3:1." },
      { q: "What is \"visual hierarchy\"?", options: ["The order of files in a folder", "Making the most important thing look most important at a glance", "Using as many colors as possible", "Putting everything in bold"], answer: 1, why: "Right — size, weight, color and space tell the eye where to go first." },
      { q: "Why use a spacing scale like 4 / 8 / 16 / 24 / 32px?", options: ["Browsers require it", "Consistent spacing makes a layout feel calm and intentional", "It loads faster", "It's only for mobile"], answer: 1, why: "Yes — a few repeated values beat dozens of random ones." },
      { q: "A card has three buttons that all look identical. What's the problem?", options: ["Nothing", "No clear primary action — the user can't tell which one matters", "Too much contrast", "The card is too wide"], answer: 1, why: "Correct — one action should clearly be \"the important one\"." },
      { q: "Light gray text on a white background usually…", options: ["Looks modern and passes contrast", "Fails contrast and is hard to read", "Is required by WCAG", "Improves hierarchy"], answer: 1, why: "Right — gray-on-light is the most common contrast failure." },
    ],
  });
})();
