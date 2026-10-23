/* Mission 2.6 — Objects: auto-checks (they inspect your real station object) + quiz bank */
(function () {
  function station(ctx) {
    if (ctx.error) return null;
    const s = ctx.grab("station").station;
    return s && typeof s === "object" && !Array.isArray(s) ? s : null;
  }
  const nested = (o) => Object.values(o).some((v) => v && typeof v === "object" && !Array.isArray(v));
  MCCA.ext("s2-m06", {
    objectives: {
      ch1: (ctx) => { const s = station(ctx); return !!s && typeof s.name === "string" && nested(s); },
      ch2: (ctx) => { const s = station(ctx); return !!s && Array.isArray(s.modules) && s.modules.filter((m) => m && typeof m.name === "string").length >= 2; },
      ch3: (ctx) => !!station(ctx) && /\bstation(\.\w+)*\[\s*[A-Za-z_$][\w$]*\s*\]/.test(ctx.src),
      ch4: (ctx) => {
        const s = station(ctx); if (!s) return false;
        const objs = [s].concat(Object.values(s).filter((v) => v && typeof v === "object" && !Array.isArray(v)));
        return objs.some((o) => Object.keys(o).some((k) => {
          if (typeof o[k] !== "function" || !/\bthis\.\w+/.test(String(o[k]))) return false;
          try { return typeof o[k].call(o) === "string"; } catch (e) { return false; }
        }));
      },
      ch5: (ctx) => !!station(ctx) && /Object\.(keys|entries)\(\s*station\b/.test(ctx.src) && ctx.output.split("\n").filter(Boolean).length >= 2,
      ch6: (ctx) => {
        if (!station(ctx)) return false;
        const m = ctx.src.match(/\.textContent\s*=\s*([^;\n]+)/g) || [];
        return m.some((line) => (line.match(/\bstation\b/g) || []).length >= 2) && !/STATUS: STANDBY/.test(ctx.display);
      },
    },
    quiz: [
      { q: "When MUST you use bracket notation instead of dot notation?", options: ["Never", "When the key is stored in a variable (or has spaces)", "For numbers only", "For nested objects"], answer: 1, why: "Correct — ship[field] reads the key whose name is IN field." },
      { q: "Inside a method, what does this usually refer to?", options: ["The whole page", "The object the method was called on", "The function itself", "The previous line"], answer: 1, why: "Right — ship.status() runs with this = ship." },
      { q: "What does Object.keys({ a: 1, b: 2 }) return?", options: ["[1, 2]", "[\"a\", \"b\"]", "2", "{ a, b }"], answer: 1, why: "Yes — keys gives the property names; values gives [1, 2]." },
      { q: "station.power.level — how many objects deep is level?", options: ["One — directly on station", "Two — inside power, which is inside station", "Zero", "It's an array"], answer: 1, why: "Correct — each dot walks one level deeper." },
      { q: "What happens when you read a property that doesn't exist, like ship.wings?", options: ["Error", "undefined", "null", "false"], answer: 1, why: "Right — missing properties read as undefined (reading a property OF undefined is what throws)." },
    ],
  });
})();
