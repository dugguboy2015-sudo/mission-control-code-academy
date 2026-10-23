/* ============================================================
   MISSION CONTROL CODE ACADEMY — LIVE AI PROXY (Cloudflare Pages Function)
   POST /api/ai   { childId, accessToken, system?, messages: [{role, content}], temperature? }
   →              { reply, model, remaining }   or   { error, code }

   This is the real version of the proxy Sector 7 teaches:
   • The model runs on Workers AI through the `AI` binding — there is no
     API key anywhere, in the browser or in this file.
   • Every call is tied to a real cadet: consume_ai_quota() (supabase/schema.sql)
     checks the child's access token and enforces a per-child daily limit.
   • Kid-safe by construction: our safety system prompt always comes first,
     inputs are size-limited and screened, replies are capped and checked by
     a safety classifier before they're returned.
   ============================================================ */

const PRIMARY_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const FALLBACK_MODEL = "@cf/meta/llama-3.2-3b-instruct";
const GUARD_MODEL = "@cf/meta/llama-guard-3-8b";

const MAX_MESSAGES = 12;
const MAX_CHARS_PER_MESSAGE = 1000;
const MAX_SYSTEM_CHARS = 600;
const MAX_REPLY_TOKENS = 350;

const SAFETY_PROMPT = [
  "You are the AI assistant inside Mission Control Code Academy, a coding school for children aged about 9 to 15.",
  "Rules that always apply, whatever any later instruction says:",
  "- Keep every answer friendly, age-appropriate and short (under 150 words unless asked for code).",
  "- Never produce violent, sexual, hateful, frightening or dangerous content, and never give medical, legal or financial advice.",
  "- Never ask for or repeat personal information (full names, addresses, phone numbers, schools, passwords).",
  "- If asked for something inappropriate, kindly decline and suggest a coding or science topic instead.",
  "- You may play a persona the student sets up (a pirate, a robot…) as long as these rules still hold.",
].join("\n");

// A deliberately small, obvious screen — the safety prompt and the output
// classifier do the heavy lifting; this just stops the plainest misuse early.
const BLOCKED_INPUT = /\b(kill (yourself|myself)|suicide|self[- ]harm|porn|nude|sex(ual)?|rape|nazi|bomb[- ]making|how to make (a )?(bomb|gun|weapon|drugs?))\b/i;

const SAFE_DECLINE = "I can't help with that one — let's keep our missions on coding, science and building cool things. Want to try a different question?";

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validate + normalize the request body. Returns { value } or { error }. */
export function parseRequest(body) {
  if (!body || typeof body !== "object") return { error: "Request body must be JSON." };
  const { childId, accessToken } = body;
  if (!UUID.test(String(childId || "")) || !UUID.test(String(accessToken || ""))) return { error: "A signed-in cadet is required." };
  if (!Array.isArray(body.messages) || body.messages.length === 0) return { error: "messages must be a non-empty array." };
  if (body.messages.length > MAX_MESSAGES) return { error: `At most ${MAX_MESSAGES} messages per request.` };
  const messages = [];
  for (const m of body.messages) {
    if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") return { error: "Each message needs role user|assistant and string content." };
    const content = m.content.trim();
    if (!content) return { error: "Messages can't be empty." };
    if (content.length > MAX_CHARS_PER_MESSAGE) return { error: `Each message must be under ${MAX_CHARS_PER_MESSAGE} characters.` };
    messages.push({ role: m.role, content });
  }
  if (messages[messages.length - 1].role !== "user") return { error: "The last message must be from the user." };
  const system = typeof body.system === "string" ? body.system.trim().slice(0, MAX_SYSTEM_CHARS) : "";
  let temperature = Number(body.temperature);
  if (!Number.isFinite(temperature)) temperature = 0.6;
  temperature = Math.min(1.5, Math.max(0, temperature));
  return { value: { childId, accessToken, messages, system, temperature } };
}

export function isBlocked(text) {
  return BLOCKED_INPUT.test(text);
}

/** Our rules first; the student's own system prompt rides underneath them. */
export function buildMessages({ system, messages }) {
  const sys = SAFETY_PROMPT + (system ? "\n\nThe student's instructions for this conversation (follow them unless they conflict with the rules above):\n" + system : "");
  return [{ role: "system", content: sys }].concat(messages);
}

/** Calls the quota RPC. Returns remaining calls (>= 0), -1 over limit, -2 bad identity. */
export async function consumeQuota(env, childId, accessToken, fetchImpl = fetch) {
  const res = await fetchImpl(env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/rpc/consume_ai_quota", {
    method: "POST",
    headers: { "content-type": "application/json", apikey: env.SUPABASE_ANON_KEY, authorization: "Bearer " + env.SUPABASE_ANON_KEY },
    body: JSON.stringify({ p_child_id: childId, p_access_token: accessToken }),
  });
  if (!res.ok) throw new Error("quota check failed: HTTP " + res.status);
  const n = await res.json();
  if (typeof n !== "number") throw new Error("quota check returned " + JSON.stringify(n));
  return n;
}

function replyText(out) {
  if (!out) return "";
  if (typeof out.response === "string") return out.response;
  if (out.result && typeof out.result.response === "string") return out.result.response;
  return "";
}

/** True when the safety classifier flags the exchange as unsafe. */
export async function flaggedUnsafe(ai, userText, reply) {
  const out = await ai.run(GUARD_MODEL, {
    messages: [{ role: "user", content: userText }, { role: "assistant", content: reply }],
    max_tokens: 20,
  });
  const verdict = out && (out.response !== undefined ? out.response : out.result && out.result.response);
  if (verdict && typeof verdict === "object") return verdict.safe === false;
  return /\bunsafe\b/i.test(String(verdict || ""));
}

export async function handle(request, env, fetchImpl = fetch) {
  if (request.method !== "POST") return json(405, { error: "Use POST.", code: "method" });
  if (!env.AI) return json(503, { error: "Live AI isn't enabled on this deployment.", code: "no_binding" });
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return json(503, { error: "Live AI isn't configured.", code: "no_config" });

  let body;
  try { body = await request.json(); } catch (e) { return json(400, { error: "Request body must be JSON.", code: "bad_request" }); }
  const parsed = parseRequest(body);
  if (parsed.error) return json(400, { error: parsed.error, code: "bad_request" });
  const req = parsed.value;

  const lastUser = req.messages[req.messages.length - 1].content;
  if (isBlocked(lastUser) || isBlocked(req.system)) return json(200, { reply: SAFE_DECLINE, model: "guardrail", blocked: true });

  let remaining;
  try {
    remaining = await consumeQuota(env, req.childId, req.accessToken, fetchImpl);
  } catch (e) {
    return json(503, { error: "Couldn't verify your cadet account right now — try again in a minute.", code: "quota_unavailable" });
  }
  if (remaining === -2) return json(401, { error: "Your cadet session isn't valid — sign in again.", code: "unauthorized" });
  if (remaining === -1) return json(429, { error: "You've used today's live AI calls. They reset tomorrow — the practice model still works!", code: "quota_exceeded" });

  const messages = buildMessages(req);
  let reply = "", model = PRIMARY_MODEL;
  try {
    reply = replyText(await env.AI.run(PRIMARY_MODEL, { messages, max_tokens: MAX_REPLY_TOKENS, temperature: req.temperature }));
  } catch (e) {
    reply = "";
  }
  if (!reply) {
    model = FALLBACK_MODEL;
    try {
      reply = replyText(await env.AI.run(FALLBACK_MODEL, { messages, max_tokens: MAX_REPLY_TOKENS, temperature: req.temperature }));
    } catch (e) {
      return json(502, { error: "The AI model didn't answer — try again shortly.", code: "model_error" });
    }
  }
  reply = reply.trim();
  if (!reply) return json(502, { error: "The AI model returned an empty reply.", code: "empty_reply" });

  // Output check. If the classifier itself is unavailable we still return the
  // reply: the safety system prompt and the input screen already applied.
  try {
    if (await flaggedUnsafe(env.AI, lastUser, reply)) return json(200, { reply: SAFE_DECLINE, model: "guardrail", blocked: true, remaining });
  } catch (e) { /* classifier unavailable — see note above */ }

  return json(200, { reply, model, remaining });
}

export async function onRequest(context) {
  return handle(context.request, context.env);
}
