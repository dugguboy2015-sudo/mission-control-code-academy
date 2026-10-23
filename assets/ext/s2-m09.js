/* Mission 2.9 — Debugging with DevTools: quiz bank (the challenge happens in real DevTools, so items are self-checked) */
MCCA.ext("s2-m09", {
  objectives: {},
  quiz: [
    { q: "TypeError: Cannot read properties of undefined (reading 'join') — what went wrong?", options: ["join is misspelled", "Something you called .join on is undefined", "The array is empty", "The browser doesn't support join"], answer: 1, why: "Correct — the thing BEFORE .join was undefined (often a typo in a property name)." },
    { q: "ReferenceError: reserveFual is not defined — most likely cause?", options: ["A typo in a variable name", "A missing semicolon", "A CSS error", "The server is down"], answer: 0, why: "Right — JavaScript has never heard of that exact name." },
    { q: "A logic bug is the trickiest kind because…", options: ["It crashes the browser", "No error appears — the code runs but gives the wrong answer", "It only happens on phones", "It deletes your code"], answer: 1, why: "Yes — you only catch it by checking results against what you expected." },
    { q: "What does a breakpoint do?", options: ["Deletes a line", "Pauses the code at that line so you can inspect values", "Speeds the code up", "Marks a line as an error"], answer: 1, why: "Correct — then Step Over runs one line at a time." },
    { q: "console.table(crew) is great for…", options: ["Sorting crew", "Viewing an array of objects as a readable grid", "Saving crew to a file", "Making an HTML table on the page"], answer: 1, why: "Right — rows and columns beat a squashed one-line log." },
  ],
});
