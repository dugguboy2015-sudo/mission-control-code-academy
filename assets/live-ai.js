/* ============================================================
   MISSION CONTROL CODE ACADEMY — LIVE AI CLIENT
   A real model, reached the safe way Sector 7 teaches: the browser
   calls OUR proxy (/api/ai, a Cloudflare Pages Function), which holds
   no key at all — it uses a Workers AI binding — and enforces a daily
   quota plus kid-safe guardrails per cadet.

     const reply = await LiveAI.chat(systemPrompt, userMessage, { temperature: 0.7 });
     await LiveAI.stream(systemPrompt, userMessage, (chunk) => { ... });

   When the live model isn't reachable (local dev server, offline, the
   day's quota used up) it falls back to the mission's own practice model,
   so every mission keeps working. LiveAI.last tells you which one answered.
   ============================================================ */
(function () {
  "use strict";

  let fallback = null;
  const ENDPOINT = "/api/ai";

  async function identity() {
    try { return window.Academy ? await window.Academy.identity() : null; } catch (e) { return null; }
  }

  // Say so in the mission's visible console — NOT inside the reply text,
  // which code may be about to JSON.parse.
  function notice(text) {
    const out = document.getElementById("consoleOutput");
    if (!out) return;
    const line = document.createElement("div");
    line.className = "log-line live-notice";
    line.textContent = "ℹ " + text;
    out.appendChild(line);
  }

  function practiceReply(system, user, why) {
    LiveAI.last = { live: false, model: "practice", reason: why };
    notice("Practice model answered (" + why + ").");
    let text;
    try { text = fallback ? fallback(system, user) : null; } catch (e) { text = null; }
    if (text && typeof text === "object") text = text.reply || JSON.stringify(text);
    return text || "The live model isn't available here, so there's no reply to show.";
  }

  async function chat(system, user, opts) {
    opts = opts || {};
    const messages = Array.isArray(user) ? user : [{ role: "user", content: String(user || "") }];
    const lastUser = messages.length ? messages[messages.length - 1].content : "";
    const who = await identity();
    if (!who || !who.childId || !who.accessToken) return practiceReply(system, lastUser, "sign in as a cadet to use the live model");

    let res, body;
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ childId: who.childId, accessToken: who.accessToken, system: system || "", messages, temperature: opts.temperature }),
      });
      body = await res.json();
    } catch (e) {
      return practiceReply(system, lastUser, "live model unreachable from here");
    }
    if (!res.ok || !body || typeof body.reply !== "string") {
      return practiceReply(system, lastUser, (body && body.error) || "live model unavailable");
    }
    LiveAI.last = { live: body.model !== "guardrail", model: body.model, remaining: body.remaining, blocked: !!body.blocked };
    const mission = document.body.getAttribute("data-mission-id") || "live";
    const engage = window.MCCA && window.MCCA.engage;
    if (engage && LiveAI.last.live) engage.log("ai", mission, { xp: 0, quiet: true });
    return body.reply;
  }

  // Workers AI replies arrive whole; reveal them word by word so the UI
  // still demonstrates streaming (the text itself is the real reply).
  async function stream(system, user, onToken, opts) {
    const reply = await chat(system, user, opts);
    const parts = reply.match(/\S+\s*/g) || [];
    for (const p of parts) {
      try { onToken(p); } catch (e) { break; }
      await new Promise((r) => setTimeout(r, 35));
    }
    return reply;
  }

  const LiveAI = {
    chat, stream,
    last: null,
    /** Missions register their practice model: fn(system, user) → text. */
    setFallback(fn) { fallback = fn; },
  };
  window.LiveAI = LiveAI;
})();
