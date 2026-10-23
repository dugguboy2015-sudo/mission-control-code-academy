/* Mission 2.7 — The DOM in Depth: auto-checks against the real #crewList + quiz bank
   (The starter already demonstrates items 1–2.) */
MCCA.ext("s2-m07", {
  objectives: {
    ch3: (ctx) => !ctx.error && /querySelectorAll\(\s*["']li["']\s*\)/.test(ctx.src) && /classList\.add\(/.test(ctx.src)
      && ctx.$$("#crewList li.highlight").length >= 2,
    ch4: (ctx) => !ctx.error && /\.remove\(\s*\)/.test(ctx.src),
    ch5: (ctx) => !ctx.error && /setAttribute\(\s*["']data-rank["']/.test(ctx.src) && /getAttribute\(\s*["']data-rank["']/.test(ctx.src)
      && !!ctx.$("#crewList li[data-rank]") && ctx.output.includes(ctx.$("#crewList li[data-rank]").getAttribute("data-rank")),
    ch6: (ctx) => !ctx.error && /\.(prepend|insertBefore)\(/.test(ctx.src) && ctx.$$("#crewList li").length >= 3,
  },
  quiz: [
    { q: "What does document.createElement(\"li\") do on its own?", options: ["Adds an li to the page", "Makes a new li that exists only in memory until you insert it", "Finds the first li", "Deletes all li elements"], answer: 1, why: "Correct — it's invisible until you appendChild/prepend it somewhere." },
    { q: "list.appendChild(item) puts item…", options: ["At the start of list", "At the end of list", "Replacing list", "In the head"], answer: 1, why: "Right — append adds at the end; prepend adds at the start." },
    { q: "What's a NodeList?", options: ["A JavaScript error", "The list-like collection querySelectorAll returns", "An HTML tag", "A CSS selector"], answer: 1, why: "Yes — you can loop it with forEach, but it isn't a full array." },
    { q: "Which is safer for putting a user's typed name on the page?", options: ["innerHTML", "textContent", "outerHTML", "document.write"], answer: 1, why: "Correct — textContent never runs HTML, so it can't be used to inject code." },
    { q: "item.classList.add(\"highlight\") does what?", options: ["Replaces all classes with highlight", "Adds highlight alongside any existing classes", "Toggles the element's visibility", "Creates a CSS rule"], answer: 1, why: "Right — classList.add keeps the other classes intact." },
  ],
});
