/* Proves every side quest in side-quests.html is solvable: a reference
   solution for each must pass that quest's own hidden tests, and the
   starter stub must fail them. Run: node tests/side-quests.test.mjs */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "side-quests.html"), "utf8");
const src = html.match(/const QUESTS = (\[[\s\S]*?\n  \]);/)[1];
const QUESTS = new Function("return " + src)();

const SOLUTIONS = {
  shout: (t) => t.toUpperCase() + "!",
  vowels: (t) => (t.match(/[aeiou]/gi) || []).length,
  palindrome: (t) => { const s = t.toLowerCase().replace(/\s/g, ""); return s === [...s].reverse().join(""); },
  fizzbuzz: (n) => Array.from({ length: n }, (_, i) => { const k = i + 1; return k % 15 === 0 ? "FizzBuzz" : k % 3 === 0 ? "Fizz" : k % 5 === 0 ? "Buzz" : k; }),
  biggest: (nums) => { if (!nums.length) return null; let b = nums[0]; for (const n of nums) if (n > b) b = n; return b; },
  titlecase: (t) => t.split(" ").map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" "),
  dedupe: (a) => a.filter((x, i) => a.indexOf(x) === i),
  caesar: (t, s) => t.replace(/[a-z]/gi, (c) => { const base = c <= "Z" ? 65 : 97; return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base); }),
  digits: (n) => String(n).split("").reduce((a, d) => a + Number(d), 0),
  missing: (nums) => { const n = nums.length + 1; return (n * (n + 1)) / 2 - nums.reduce((a, b) => a + b, 0); },
  anagram: (a, b) => { const norm = (s) => s.toLowerCase().replace(/\s/g, "").split("").sort().join(""); return norm(a) === norm(b); },
  fuel: (ms) => ({ total: ms.reduce((a, m) => a + m.fuel, 0), hungriest: ms.reduce((b, m) => (m.fuel > b.fuel ? m : b)).name }),
};

let failures = 0;
if (QUESTS.length !== 12) { console.log("FAIL expected 12 quests (SIDE_QUEST_TOTAL), found " + QUESTS.length); failures++; }
for (const q of QUESTS) {
  const sol = SOLUTIONS[q.id];
  const run = (fn) => q.tests.every(([args, exp]) => { try { return JSON.stringify(fn(...structuredClone(args))) === JSON.stringify(exp); } catch (e) { return false; } });
  const stub = new Function("function " + q.fn + "(" + q.params + ") {\n  // your code here\n}\n;return " + q.fn)();
  const problems = [];
  if (!sol) problems.push("no reference solution");
  else if (!run(sol)) problems.push("reference solution fails its tests");
  if (run(stub)) problems.push("starter stub passes");
  console.log((problems.length ? "FAIL " : "ok   ") + q.id + (problems.length ? "  " + problems.join("; ") : ""));
  if (problems.length) failures++;
}
const total = fs.readFileSync(path.join(root, "assets/engagement.js"), "utf8").match(/SIDE_QUEST_TOTAL = (\d+)/)[1];
if (Number(total) !== QUESTS.length) { console.log("FAIL SIDE_QUEST_TOTAL is " + total); failures++; }
console.log(failures ? `\n${failures} problem(s)` : "\nALL SIDE QUESTS SOLVABLE");
process.exit(failures ? 1 : 0);
