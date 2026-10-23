/* Mission 1.9 — Capstone: Personal Site: auto-checks against the live preview + quiz bank */
(function () {
  const EXAMPLE_CSS = /\.example-(btn|row|card)[^{]*\{[^}]*\}/g;
  function labeled(doc, el) { return !!el.closest("label") || !!(el.id && doc.querySelector('label[for="' + el.id + '"]')); }
  MCCA.ext("s1-m09", {
    objectives: {
      ch1: (ctx) => {
        const d = ctx.frameDoc; if (!d) return false;
        const h = d.querySelector("header h1"), p = d.querySelector("header p");
        return !!h && !!p && !/^your name$/i.test(h.textContent.trim()) && h.textContent.trim().length > 1
          && !/^One line:/.test(p.textContent.trim()) && ctx.words(p.textContent) >= 3;
      },
      ch2: (ctx) => {
        const s = ctx.frameDoc && ctx.frameDoc.getElementById("about"); if (!s) return false;
        return s.querySelectorAll("li").length >= 3 || ctx.words(s.textContent) >= 20;
      },
      ch3: (ctx) => {
        const d = ctx.frameDoc, s = d && d.getElementById("projects"); if (!s) return false;
        const win = d.defaultView;
        return [s].concat(Array.from(s.querySelectorAll("*"))).some((el) =>
          /^(inline-)?(flex|grid)$/.test(win.getComputedStyle(el).display) && el.children.length >= 2 && !el.classList.contains("example-row"));
      },
      ch4: (ctx) => {
        const d = ctx.frameDoc, f = d && d.querySelector("#contact form"); if (!f) return false;
        const ctrls = Array.from(f.querySelectorAll("input:not([type=submit]):not([type=button]), textarea, select"));
        return ctrls.length >= 2 && ctrls.every((c) => labeled(d, c) && c.name) && ctrls.some((c) => c.required);
      },
      ch5: (ctx) => /@media[^{]*\([^)]*width[^)]*\)\s*\{/.test(ctx.src),
      ch7: (ctx) => { const css = ctx.src.replace(EXAMPLE_CSS, ""); return /\btransition\s*:\s*[a-z]/.test(css) || /@keyframes\s+[\w-]+\s*\{/.test(css); },
    },
    quiz: [
      { q: "Which element should wrap the page's main, unique content?", options: ["<div id=\"main\">", "<main>", "<section>", "<body>"], answer: 1, why: "Correct — one <main> per page tells browsers and screen readers where the real content is." },
      { q: "Why lay out the projects section with flexbox or grid instead of stacked divs?", options: ["Divs are deprecated", "So the cards sit side by side and adapt to the screen width", "Grid loads faster", "It's required for GitHub Pages"], answer: 1, why: "Right — a layout tool turns a pile of blocks into a real, responsive layout." },
      { q: "Your contact form has no backend. What happens when someone submits it on GitHub Pages?", options: ["You get an email", "Nothing is stored — Pages only serves static files", "GitHub saves it", "It errors and takes the site down"], answer: 1, why: "Correct — static hosting can't receive data. (You'll fix that with a backend in Sector 5.)" },
      { q: "What does Ladder Level L1 mean for this capstone?", options: ["It runs on your laptop", "It's deployed to a public URL and works on a phone", "It has a database", "It has 100 users"], answer: 1, why: "Yes — L1 = real, public, and works on mobile." },
      { q: "Which is the best alt text for a photo of you at a robotics fair?", options: ["image.jpg", "photo", "Me presenting my line-following robot at the school robotics fair", "(leave it empty)"], answer: 2, why: "Right — describe what matters about the image, in a sentence." },
    ],
  });
})();
