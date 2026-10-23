/* Mission 1.1 — HTML Structure: auto-checks against the live preview + quiz bank */
MCCA.ext("s1-m01", {
  objectives: {
    ch1: (ctx) => /<!doctype html>/i.test(ctx.src) && /<html[\s>]/i.test(ctx.src) && /<head[\s>]/i.test(ctx.src)
      && /<title>\s*\S[\s\S]*?<\/title>/i.test(ctx.src) && /<body[\s>]/i.test(ctx.src),
    ch2: (ctx) => { const h = ctx.frameDoc && ctx.frameDoc.querySelector("h1"); return !!h && h.textContent.trim().length > 1 && !/^cadet log$/i.test(h.textContent.trim()); },
    ch3: (ctx) => !!ctx.frameDoc && Array.from(ctx.frameDoc.querySelectorAll("p")).some((p) => ctx.words(p.textContent) >= 6 && !/^Status:/.test(p.textContent.trim())),
    ch4: (ctx) => !!ctx.frameDoc && Array.from(ctx.frameDoc.querySelectorAll("ul")).some((ul) => ul.querySelectorAll(":scope > li").length >= 3),
    ch5: (ctx) => !!ctx.frameDoc && Array.from(ctx.frameDoc.querySelectorAll("img")).some((i) => i.getAttribute("src") && ctx.words(i.getAttribute("alt")) >= 2),
    ch6: (ctx) => !!ctx.frameDoc && Array.from(ctx.frameDoc.querySelectorAll("a[href]")).some((a) => /^https?:\/\//.test(a.getAttribute("href")) && !/nasa\.gov/.test(a.getAttribute("href")) && a.getAttribute("target") === "_blank"),
  },
  quiz: [
    { q: "Which tag holds the content people actually SEE on the page?", options: ["<head>", "<body>", "<title>", "<meta>"], answer: 1, why: "Correct — <head> is information ABOUT the page; <body> is the page itself." },
    { q: "Where does the text inside <title> show up?", options: ["As the biggest heading on the page", "In the browser tab", "At the bottom of the page", "Nowhere — it's a comment"], answer: 1, why: "Right — <title> names the tab (and bookmarks and search results)." },
    { q: "Which list makes numbered items automatically?", options: ["<ul>", "<ol>", "<li>", "<list>"], answer: 1, why: "Yes — ol = ordered list (numbered). ul = unordered (bullets)." },
    { q: "What does target=\"_blank\" do on a link?", options: ["Makes the link invisible", "Opens the link in a new tab", "Removes the underline", "Downloads the page"], answer: 1, why: "Correct — it tells the browser to open the destination in a new tab." },
    { q: "Why should an image's alt text describe the image?", options: ["Search engines ignore it otherwise", "Screen readers read it aloud, and it shows if the image fails to load", "It makes the image load faster", "It's required for the image to appear"], answer: 1, why: "Right — alt text is how people who can't see the image still get its meaning." },
  ],
});
