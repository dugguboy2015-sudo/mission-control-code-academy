/* Mission 0.2 — How the Web Works: quiz bank (the challenge happens in real DevTools, so items are self-checked) */
MCCA.ext("s0-m02", {
  objectives: {},
  quiz: [
    { q: "What does HTTP status code 404 mean?", options: ["The server crashed", "The page loaded successfully", "The thing you asked for wasn't found", "You need to log in"], answer: 2, why: "Correct — 404 means the server is fine but that resource doesn't exist at that address." },
    { q: "After the browser receives the HTML, why does it fire off MORE requests?", options: ["To double-check the HTML", "To fetch everything the HTML references — CSS, images, scripts", "To tell the server it arrived", "It doesn't — one request loads the whole page"], answer: 1, why: "Right — the HTML is a recipe that names other files, and the browser fetches each of them." },
    { q: "Which part of https://academy.example.com/missions is the domain?", options: ["https", "academy.example.com", "/missions", "The whole thing"], answer: 1, why: "Yes — the domain is the human-readable name DNS turns into an IP address." },
    { q: "What does status 200 tell you?", options: ["The request succeeded", "The request was redirected", "The server is overloaded", "The browser used a cached copy"], answer: 0, why: "Correct — 200 OK means the server found it and sent it back." },
    { q: "Where can you watch every request a page makes?", options: ["The page's source code", "The Network tab in browser DevTools", "The address bar", "Your computer's file explorer"], answer: 1, why: "Right — DevTools ▸ Network lists every request, its status, size and timing." },
  ],
});
