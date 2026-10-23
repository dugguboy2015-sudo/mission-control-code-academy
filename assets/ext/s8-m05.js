/* Mission 8.5 — MCP: auto-checks + quiz bank */
(function () {
  // A function (nested ones included) that finds/filters tools by description
  // WITHOUT naming either server inside it.
  function searchFn(src) {
    const re = /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*\{|(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{/g;
    let m;
    while ((m = re.exec(src))) {
      let depth = 1, i = re.lastIndex;
      for (; i < src.length && depth; i++) { if (src[i] === "{") depth++; else if (src[i] === "}") depth--; }
      const body = src.slice(re.lastIndex, i);
      if (/\.(find|filter|some)\(/.test(body) && /description/.test(body) && !/notesServer|calculatorServer/.test(body)) return body;
    }
    return null;
  }
  MCCA.ext("s8-m05", {
    objectives: {
      ch1: (ctx) => !ctx.error && /notesServer\.listTools\(/.test(ctx.src) && /calculatorServer\.listTools\(/.test(ctx.src)
        && /(\.\.\.\s*\w+|\.concat\(|\.flat\()/.test(ctx.src) && ctx.output.trim().length > 0,
      ch2: (ctx) => !ctx.error && !!searchFn(ctx.src),
      ch3: (ctx) => !ctx.error && !!searchFn(ctx.src) && /\.callTool\(/.test(ctx.src) && ctx.output.split("\n").filter(Boolean).length >= 2,
      ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /(third|another|new|extra|more)\s+server/i.test(c)),
    },
    quiz: [
      { q: "What problem does MCP (Model Context Protocol) solve?", options: ["Making models faster", "A standard way for AI apps to discover and call tools from any compatible server", "Encrypting prompts", "Hosting websites"], answer: 1, why: "Correct — like a universal plug for tools." },
      { q: "listTools() on an MCP server returns…", options: ["The server's password", "The tools it offers, with names, descriptions and parameters", "Random words", "Its source code"], answer: 1, why: "Right — discovery first, then call." },
      { q: "Why discover tools at runtime instead of hard-coding which server has which tool?", options: ["Hard-coding is faster", "New servers and tools can be added without rewriting the client", "MCP forbids hard-coding", "No reason"], answer: 1, why: "Yes — the client adapts to whatever is connected." },
      { q: "Is it safe to connect your agent to ANY MCP server you find online?", options: ["Yes", "No — a server's tools and descriptions are untrusted and could be malicious", "Only on Fridays", "Only if it's popular"], answer: 1, why: "Correct — vet servers like you'd vet any dependency." },
      { q: "callTool(\"add\", {a: 2, b: 3}) runs where?", options: ["Inside the model", "On the MCP server that offers the add tool", "In the browser's address bar", "Nowhere"], answer: 1, why: "Right — the server executes; the client relays the result." },
    ],
  });
})();
