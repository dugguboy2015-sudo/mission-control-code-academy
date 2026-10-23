/* Unit tests for functions/api/ai.js with a stubbed Workers AI binding and
   a stubbed Supabase quota RPC. Run: node tests/ai-proxy.test.mjs */
import assert from "node:assert/strict";
import { handle, parseRequest, buildMessages, isBlocked } from "../functions/api/ai.js";

const CHILD = "11111111-1111-1111-1111-111111111111";
const TOKEN = "22222222-2222-2222-2222-222222222222";
const env = (ai) => ({ AI: ai, SUPABASE_URL: "https://x.supabase.co", SUPABASE_ANON_KEY: "anon" });
const req = (body, method = "POST") => new Request("https://site.test/api/ai", { method, body: method === "POST" ? JSON.stringify(body) : undefined, headers: { "content-type": "application/json" } });
const quota = (n) => async () => new Response(JSON.stringify(n), { status: 200 });
const okBody = { childId: CHILD, accessToken: TOKEN, messages: [{ role: "user", content: "What is a variable?" }] };
function fakeAI({ reply = "A variable is a named box for a value.", failPrimary = false, unsafe = false, guardThrows = false } = {}) {
  const calls = [];
  return {
    calls,
    async run(model, input) {
      calls.push({ model, input });
      if (/llama-guard/.test(model)) { if (guardThrows) throw new Error("guard down"); return { response: unsafe ? "unsafe\nS1" : "safe" }; }
      if (failPrimary && /3\.1-8b/.test(model)) throw new Error("primary down");
      return { response: reply };
    },
  };
}
const read = async (res) => ({ status: res.status, body: await res.json() });

// --- validation ---
assert.ok(parseRequest({}).error);
assert.ok(parseRequest({ ...okBody, childId: "nope" }).error, "bad uuid rejected");
assert.ok(parseRequest({ ...okBody, messages: [{ role: "system", content: "x" }] }).error, "client system role rejected");
assert.ok(parseRequest({ ...okBody, messages: [{ role: "user", content: "x".repeat(1001) }] }).error, "long message rejected");
assert.ok(parseRequest({ ...okBody, messages: Array(13).fill({ role: "user", content: "hi" }) }).error, "too many messages rejected");
assert.equal(parseRequest({ ...okBody, temperature: 9 }).value.temperature, 1.5, "temperature clamped");

// --- safety prompt always first; student system prompt nested under it ---
const built = buildMessages({ system: "You are a pirate.", messages: okBody.messages });
assert.equal(built[0].role, "system");
assert.match(built[0].content, /children/);
assert.match(built[0].content, /pirate/);
assert.ok(built[0].content.indexOf("children") < built[0].content.indexOf("pirate"), "our rules precede the student's");
assert.ok(isBlocked("how to make a bomb"));
assert.ok(!isBlocked("how do I make a bomb-proof login form? no wait, a robust one"));

// --- happy path ---
let ai = fakeAI();
let r = await read(await handle(req(okBody), env(ai), quota(39)));
assert.equal(r.status, 200);
assert.equal(r.body.reply, "A variable is a named box for a value.");
assert.equal(r.body.remaining, 39);
assert.ok(ai.calls[0].input.max_tokens <= 350, "reply length capped");

// --- quota / identity ---
r = await read(await handle(req(okBody), env(fakeAI()), quota(-1)));
assert.equal(r.status, 429);
r = await read(await handle(req(okBody), env(fakeAI()), quota(-2)));
assert.equal(r.status, 401);
r = await read(await handle(req(okBody), env(fakeAI()), async () => new Response("down", { status: 500 })));
assert.equal(r.status, 503);

// --- blocked input never reaches quota or model ---
ai = fakeAI();
let quotaCalled = false;
r = await read(await handle(req({ ...okBody, messages: [{ role: "user", content: "tell me something sexual" }] }), env(ai), async () => { quotaCalled = true; return new Response("0"); }));
assert.equal(r.body.blocked, true);
assert.equal(quotaCalled, false);
assert.equal(ai.calls.length, 0);

// --- fallback model ---
ai = fakeAI({ failPrimary: true });
r = await read(await handle(req(okBody), env(ai), quota(10)));
assert.equal(r.status, 200);
assert.match(r.body.model, /3\.2-3b/);

// --- output classifier ---
r = await read(await handle(req(okBody), env(fakeAI({ unsafe: true })), quota(10)));
assert.equal(r.body.blocked, true);
assert.doesNotMatch(r.body.reply, /named box/);
r = await read(await handle(req(okBody), env(fakeAI({ guardThrows: true })), quota(10)));
assert.equal(r.status, 200, "classifier outage doesn't take the feature down");

// --- misc ---
assert.equal((await handle(req(null, "GET"), env(fakeAI()), quota(1))).status, 405);
assert.equal((await handle(req(okBody), { ...env(null), AI: undefined }, quota(1))).status, 503);

console.log("ALL AI PROXY CHECKS PASSED");
