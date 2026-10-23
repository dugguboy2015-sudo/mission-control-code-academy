/* Mission 4.1 — Modules: quiz bank (the challenge is a real local project, so items are self-checked) */
MCCA.ext("s4-m01", {
  objectives: {},
  quiz: [
    { q: "Which line correctly imports a named export add from math.js in the same folder?", options: ["import add from math", "import { add } from \"./math.js\"", "require(math.add)", "import { add } from \"math\""], answer: 1, why: "Correct — curly braces for named exports, plus ./ and the .js extension." },
    { q: "What does export do?", options: ["Downloads the file", "Makes a function or value available to other modules", "Prints it", "Deletes it from this file"], answer: 1, why: "Right — nothing leaves a module unless you export it." },
    { q: "Which script tag lets a browser load ES modules?", options: ["<script src=\"main.js\">", "<script type=\"module\" src=\"main.js\">", "<module src=\"main.js\">", "<script import=\"main.js\">"], answer: 1, why: "Yes — type=\"module\" switches on import/export." },
    { q: "Why split code into modules at all?", options: ["Smaller files are required", "Each file has one job, so code is easier to find, reuse and test", "It makes code run faster", "Browsers can't read big files"], answer: 1, why: "Correct — organization is the real win." },
    { q: "What's the difference between a named and a default export?", options: ["None", "A file can have many named exports but only one default", "Default exports are faster", "Named exports can't be functions"], answer: 1, why: "Right — and named exports are imported with { }." },
  ],
});
