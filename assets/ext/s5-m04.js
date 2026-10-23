/* Mission 5.4 — Firebase: quiz bank (the challenge is a real Firebase project, so items are self-checked) */
MCCA.ext("s5-m04", {
  objectives: {},
  quiz: [
    { q: "Firestore stores data as…", options: ["Tables and rows", "Collections of documents", "One big text file", "Spreadsheets"], answer: 1, why: "Correct — a collection (tasks) holds documents (each task)." },
    { q: "What does onSnapshot give you?", options: ["A screenshot", "A live listener that fires every time the data changes", "A backup", "A one-time read"], answer: 1, why: "Right — that's how the second tab updates without a refresh." },
    { q: "Is the Firebase web config (apiKey etc.) a secret?", options: ["Yes, never ship it", "No — it identifies your project; Security Rules are what protect the data", "Only the apiKey", "Only in production"], answer: 1, why: "Yes — just like the Supabase anon key. Rules do the protecting." },
    { q: "addDoc(collection(db, \"tasks\"), { text: \"Fuel up\" }) does what?", options: ["Deletes tasks", "Adds a new document with an auto-generated id to tasks", "Creates a table", "Reads all tasks"], answer: 1, why: "Correct." },
    { q: "Firestore is a good fit when…", options: ["You need complex JOIN reports", "You want realtime sync of flexible, document-shaped data", "You must use SQL", "Your data never changes"], answer: 1, why: "Right — realtime and flexible shapes are its sweet spot." },
  ],
});
