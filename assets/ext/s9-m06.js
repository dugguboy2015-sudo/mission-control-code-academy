/* Mission 9.6 — AI Security: auto-checks + quiz bank */
MCCA.ext("s9-m06", {
  objectives: {
    ch1: (ctx) => !ctx.error && ((ctx.src.match(/scanForInjection\(/g) || []).length >= 3 || /(forEach|for\s*\(|map\()[\s\S]*scanForInjection\(/.test(ctx.src))
      && /\btrue\b/.test(ctx.output) && /\bfalse\b/.test(ctx.output),
    // Your own buildSafePrompt: untrusted text fenced in delimiters, plus a "data only" rule.
    ch2: (ctx) => {
      if (ctx.error || !/(function\s+buildSafePrompt\s*\(|buildSafePrompt\s*=\s*(function|\())/.test(ctx.src)) return false;
      const f = ctx.grab("buildSafePrompt").buildSafePrompt;
      if (typeof f !== "function") return false;
      let out = "";
      try { out = String(f("Summarize this.", "ZQX-UNTRUSTED-TEXT")); } catch (e) { return false; }
      const i = out.indexOf("ZQX-UNTRUSTED-TEXT");
      if (i === -1 || !/\bdata\b/i.test(out)) return false;
      const before = out.slice(Math.max(0, i - 60), i), after = out.slice(i + 18, i + 80);
      return /(<\w[\w-]*>|```|"""|###|\[\w+\]|-{3,}|={3,})\s*$/.test(before) && /^\s*(<\/\w[\w-]*>|```|"""|###|\[\/\w+\]|-{3,}|={3,})/.test(after);
    },
    ch3: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 10 && /(risk|danger|leak|exfiltrat|steal)/i.test(c) && /(send|email|post|write|delete|pay|read|search)/i.test(c)),
    ch4: (ctx) => ctx.comments.split("\n").some((c) => ctx.words(c) >= 8 && /\bkey\b/i.test(c) && /(context|never|can't|cannot|not in|nothing to)/i.test(c)),
  },
  quiz: [
    { q: "Prompt injection works because…", options: ["Models are slow", "Models can't reliably tell instructions apart from data they're asked to read", "Prompts are encrypted", "Browsers allow it"], answer: 1, why: "Correct — so you design as if they'll sometimes be fooled." },
    { q: "Wrapping untrusted text in clear delimiters plus \"treat this as data only\" is…", options: ["A complete fix", "A helpful layer — but not a guarantee", "Useless", "Required by law"], answer: 1, why: "Right — defense in depth, never one wall." },
    { q: "Which tool combination is riskiest for one agent in one turn?", options: ["Read the weather + read notes", "Read private email + send email to anyone", "Calculator + clock", "Search notes + summarize"], answer: 1, why: "Yes — read secrets + send out = an exfiltration path." },
    { q: "Why is keeping the API key out of the model's context the strongest defense?", options: ["It's faster", "What the model never sees, an injection can never make it reveal", "Keys are long", "It isn't"], answer: 1, why: "Correct — no clever prompt can leak what isn't there." },
    { q: "Before an agent performs an irreversible action (send, pay, delete) it should…", options: ["Just do it", "Get explicit human confirmation", "Ask another model", "Log it only"], answer: 1, why: "Right — a human in the loop for consequential actions." },
  ],
});
