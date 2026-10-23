/* Mission 7.7 — AI in the UI: auto-checks + quiz bank */
(function () {
  const ORIG_BANNED = (window.BANNED_WORDS || []).slice();
  MCCA.ext("s7-m07", {
    objectives: {
      // Log the GROWING text from inside the onToken callback, not just at the end.
      ch1: (ctx) => !ctx.error && /(FakeStreamingLLM\.streamChat|LiveAI\.stream)\(\s*[^,]+,\s*(\(?\s*\w+\s*\)?\s*=>|function\s*\(\s*\w+\s*\))\s*\{[^}]*\+=[^}]*console\.log\([^}]*\}/.test(ctx.src),
      ch2: (ctx) => !ctx.error && /checkInputGuardrail\(\s*(["'`])\1\s*\)/.test(ctx.src)
        && (/\.repeat\(\s*(50[1-9]|5[1-9]\d|[6-9]\d\d|\d{4,})\s*\)/.test(ctx.src) || /length\s*>\s*500/.test(ctx.src)) && /false/.test(ctx.output),
      ch3: (ctx) => !ctx.error && /checkOutputGuardrail\(\s*(["'`])\1\s*\)/.test(ctx.src) && /false/.test(ctx.output),
      ch4: (ctx) => {
        if (ctx.error) return false;
        const added = (window.BANNED_WORDS || []).filter((w) => !ORIG_BANNED.includes(w));
        return added.some((w) => new RegExp("checkInputGuardrail\\([^)]*" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(ctx.src)) && /false/.test(ctx.output);
      },
    },
    quiz: [
      { q: "Why stream an AI reply token by token?", options: ["It's cheaper", "Users see progress immediately instead of staring at nothing for seconds", "It's more accurate", "Browsers require it"], answer: 1, why: "Correct — perceived speed matters." },
      { q: "An input guardrail runs…", options: ["After the reply is shown", "BEFORE the message is sent to the model", "Only at night", "Inside the model"], answer: 1, why: "Right — reject bad input before spending money or risking bad output." },
      { q: "Why check the model's OUTPUT too?", options: ["Models are always perfect", "Replies can be empty, too long, or inappropriate — check before showing them", "To slow things down", "It's not needed"], answer: 1, why: "Yes — guard both doors." },
      { q: "A friendly error message for a failed AI call should…", options: ["Show the raw stack trace", "Say what happened in plain words and offer a retry", "Be blank", "Blame the user"], answer: 1, why: "Correct." },
      { q: "Why cap message length (e.g. 500 characters)?", options: ["Style", "Long inputs cost more tokens and can be abuse or prompt-injection attempts", "Keyboards are small", "Models can't read long text"], answer: 1, why: "Right — limits protect cost and safety." },
    ],
  });
})();
