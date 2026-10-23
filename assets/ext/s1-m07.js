/* Mission 1.7 — Transitions & Animation: motion-lab auto-checks + quiz bank */
(function () {
  let replays = 0;
  document.addEventListener("click", (e) => { if (e.target && e.target.id === "motionReplay") replays++; }, true);
  MCCA.ext("s1-m07", {
    trigger: "interaction",
    objectives: {
      // A deliberate choice of BOTH duration and easing (not the defaults).
      ch4: (ctx) => { const m = ctx.text("#motionCssOutput").match(/transition:\s*\S+\s+(\S+)\s+([^;]+);/); return !!m && m[1] !== "500ms" && m[2].trim() !== "ease"; },
      ch6: () => replays >= 3,
    },
    quiz: [
      { q: "Where should the transition property go?", options: ["On the :hover rule only", "On the base rule, so it animates both in AND out", "In a @keyframes block", "In the HTML"], answer: 1, why: "Correct — on the base rule it applies in both directions." },
      { q: "What's the difference between a transition and a @keyframes animation?", options: ["None", "A transition animates between two states when something changes; keyframes can run on their own, loop, and have many steps", "Keyframes are only for colors", "Transitions can loop forever"], answer: 1, why: "Right — transitions react to a change; animations play a scripted sequence." },
      { q: "Which makes an animation repeat forever?", options: ["animation-duration: forever", "animation-iteration-count: infinite", "loop: true", "repeat: always"], answer: 1, why: "Yes — the shorthand is animation: spin 1s linear infinite." },
      { q: "Which easing starts slow, speeds up, then slows to a stop?", options: ["linear", "ease-in-out", "step-end", "ease-in"], answer: 1, why: "Correct — ease-in-out feels natural for things that start AND stop." },
      { q: "Why respect prefers-reduced-motion?", options: ["It saves battery", "Some people get dizzy or sick from motion, and their device asks sites to calm down", "It's required for CSS to load", "Search engines rank it"], answer: 1, why: "Right — it's an accessibility setting; honor it by reducing or removing motion." },
    ],
  });
})();
