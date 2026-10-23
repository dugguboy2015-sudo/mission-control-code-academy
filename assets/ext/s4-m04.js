/* Mission 4.4 — State & Storage: auto-checks + quiz bank
   (The starter already demonstrates items 1–3; item 5 needs a real page reload.) */
MCCA.ext("s4-m04", {
  objectives: {
    ch4: (ctx) => !ctx.error && /setItem\([^;]*JSON\.stringify\(/.test(ctx.src) && /JSON\.parse\([^;]*getItem\(|JSON\.parse\(\s*\w+\s*\)/.test(ctx.src),
    ch6: (ctx) => !ctx.error && /localStorage\.removeItem\(/.test(ctx.src) && /\bnull\b/.test(ctx.output),
  },
  quiz: [
    { q: "What can localStorage store directly?", options: ["Any JavaScript value", "Only strings", "Only numbers", "Only objects"], answer: 1, why: "Correct — everything else must be converted with JSON.stringify first." },
    { q: "localStorage.getItem(\"nope\") for a key that was never saved returns…", options: ["\"\"", "undefined", "null", "an error"], answer: 2, why: "Right — so always handle the null case with a default." },
    { q: "How long does localStorage keep data?", options: ["Until the tab closes", "Until it's cleared — it survives reloads and restarts", "Exactly 24 hours", "Until the next deploy"], answer: 1, why: "Yes — sessionStorage is the one that ends with the tab." },
    { q: "Is localStorage shared between different websites?", options: ["Yes, all sites share it", "No — each site (origin) has its own", "Only on the same Wi-Fi", "Only for logged-in users"], answer: 1, why: "Correct — one origin can't read another's storage." },
    { q: "Should you store a password in localStorage?", options: ["Yes, it's encrypted", "No — any script on the page can read it", "Only short ones", "Only on mobile"], answer: 1, why: "Right — never put secrets in localStorage." },
  ],
});
