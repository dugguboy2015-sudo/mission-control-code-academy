/* Mission 6.4 — Python Meets the Internet: auto-checks + quiz bank (item 5 happens on your own computer) */
(function () {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const keepsData = (ctx) => /WEATHER\s*=\s*\{/.test(ctx.src) && /"Kepler City"/.test(ctx.src);
  MCCA.ext("s6-m05", {
    objectives: {
      ch1: (ctx) => !ctx.error && keepsData(ctx) && /WEATHER\s*\[\s*["']current["']\s*\]\s*\[\s*["']temp_c["']\s*\]/.test(ctx.src)
        && /Kepler City/.test(ctx.output) && /-12\b/.test(ctx.output),
      ch2: (ctx) => !ctx.error && keepsData(ctx) && /for\s+\w+\s+in\s+WEATHER\s*\[\s*["']forecast["']\s*\]/.test(ctx.src)
        && DAYS.every((d) => ctx.output.includes(d)) && /-30\b/.test(ctx.output) && /-35\b/.test(ctx.output),
      // Thursday (high 1) is the warmest.
      ch3: (ctx) => !ctx.error && keepsData(ctx) && /max\([\s\S]*?key\s*=/.test(ctx.src)
        && ctx.output.split("\n").some((l) => /Thu/.test(l) && /\b1\b/.test(l)),
      ch4: (ctx) => !ctx.error && keepsData(ctx) && /\.get\(\s*["']alert["']/.test(ctx.src)
        && /Dust storm warning/.test(ctx.output) && /High winds/.test(ctx.output) && /none/i.test(ctx.output),
    },
    quiz: [
      { q: "What does JSON's null become in Python?", options: ["0", "None", "\"null\"", "False"], answer: 1, why: "Correct — and true/false become True/False." },
      { q: "WEATHER[\"forecast\"] is a list. How do you get Monday's high?", options: ["WEATHER[\"forecast\"][\"high\"]", "WEATHER[\"forecast\"][0][\"high\"]", "WEATHER.forecast.high", "WEATHER[\"high\"]"], answer: 1, why: "Right — pick the item by index, then the key." },
      { q: "Why pass timeout=10 to requests.get()?", options: ["To make it faster", "So a slow or dead server can't freeze your program forever", "It's required", "To retry 10 times"], answer: 1, why: "Yes — always set a timeout on network calls." },
      { q: "day.get(\"alert\", \"none\") on a day with no alert returns…", options: ["A KeyError", "None", "\"none\"", "\"alert\""], answer: 2, why: "Correct — the default you supplied." },
      { q: "What does params={\"city\": \"Paris\"} do in requests.get(url, params=...)?", options: ["Sends a password", "Builds ?city=Paris onto the URL safely for you", "Changes the HTTP method", "Nothing"], answer: 1, why: "Right — no manual string gluing or escaping." },
    ],
  });
})();
