/* ============================================================
   Objectives harness. For every mission with an assets/ext/<id>.js:
     1. the untouched starter (plus a harmless comment, so it counts as
        "authored") must pass NONE of the auto-checks,
     2. the fixture solution must pass ALL of them,
     3. the quiz must render its full set of questions,
     4. no unexpected console errors.
   Usage:
     npx serve -l 5173 .            (in another terminal)
     node tests/objectives.test.mjs [missionPrefix] [--browser=<path>]
   Needs puppeteer-core (npm i -D puppeteer-core) and a local Chrome/Edge.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const puppeteer = require(process.env.PUPPETEER_PATH || "puppeteer-core");
const fixtures = require("./objectives.fixtures.js");
const args = process.argv.slice(2);
const prefix = args.find((a) => !a.startsWith("--")) || "";
const browserArg = (args.find((a) => a.startsWith("--browser=")) || "").slice(10);
const BASE = process.env.BASE_URL || "http://127.0.0.1:5173";
const executablePath = browserArg || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => fs.existsSync(p));

const manifest = JSON.parse(fs.readFileSync(path.join(root, "missions.json"), "utf8"));
const missions = manifest.sectors.flatMap((s) => s.missions)
  .filter((m) => m.id.startsWith(prefix) && fs.existsSync(path.join(root, "assets/ext", m.id + ".js")));

// Supabase is unreachable on purpose (see request interception below), so the
// app's own "remote sync failed, using local data" logs are expected noise.
const IGNORE = [/Failed to load resource/, /^\[Academy\]/, /^\[engage\]/, /invalid child session/, /Failed to fetch|ERR_FAILED/];
const COMMENT = { js: "\n// harness", python: "\n# harness", html: "\n<!-- harness -->", sql: "\n-- harness" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
let failures = 0;

for (const m of missions) {
  const page = await browser.newPage();
  // Keep the run hermetic: no real Supabase traffic (the fake child session
  // would otherwise read back empty remote state over the local one).
  await page.setRequestInterception(true);
  page.on("request", (req) => (/\.supabase\.co\//.test(req.url()) ? req.abort() : req.continue()));
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error" && !IGNORE.some((r) => r.test(msg.text()))) errors.push(msg.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.evaluateOnNewDocument(() => {
    if (!sessionStorage.getItem("__harness")) {
      localStorage.clear();
      sessionStorage.setItem("__harness", "1");
    }
    localStorage.setItem("mcca_child_link_session", JSON.stringify({ childId: "00000000-0000-0000-0000-0000000000aa", accessToken: "00000000-0000-0000-0000-0000000000bb", name: "Harness" }));
  });
  const problems = [];
  let autoCount = 0;
  try {
    await page.goto(BASE + "/" + m.file, { waitUntil: "load" });
    await page.waitForFunction(() => window.MCCA && window.MCCA.objectivesDebug, { timeout: 15000 });
    // Python missions: wait for Skulpt's first run to finish.
    await page.waitForFunction(() => {
      const s = document.querySelector(".out-status");
      return !s || !/loading|try again/i.test(s.textContent);
    }, { timeout: 20000 }).catch(() => {});
    await sleep(500);
    const ids = await page.evaluate(() => window.MCCA.objectivesDebug.ids);
    autoCount = ids.length;
    const fx = fixtures[m.id];

    // ---- 1. starter (+ a comment, so it counts as authored) must pass nothing ----
    if (fx && fx.ed) {
      await page.evaluate((fx, comment) => {
        const ed = document.getElementById(fx.ed);
        const kind = fx.kind || (fx.run === "input" ? "html" : (window.Sk ? "python" : "js"));
        ed.value = ed.value + comment[kind];
        if (fx.run === "input") ed.dispatchEvent(new Event("input"));
        else document.getElementById(fx.run).click();
      }, fx, COMMENT);
    }
    await sleep(1800);
    await page.evaluate(() => window.MCCA.objectivesDebug.evaluate());
    const starterPassed = await page.evaluate((ids) => ids.filter((id) => document.getElementById(id).checked), ids);
    if (starterPassed.length) problems.push("starter passes " + starterPassed.join(","));

    // ---- 2. fixture must pass everything ----
    if (ids.length && !fx) problems.push("no fixture for " + ids.length + " auto objectives");
    if (fx) {
      if (fx.setup) {
        await page.evaluate((c) => { window.__fixtureCode = c; }, fx.code || "");
        await page.evaluate("(" + fx.setup.toString() + ")()");
      }
      else await page.evaluate((fx) => {
        const ed = document.getElementById(fx.ed);
        ed.value = fx.code;
        if (fx.run === "input") ed.dispatchEvent(new Event("input"));
        else document.getElementById(fx.run).click();
      }, fx);
      await sleep(fx.wait || 2500);
      await page.evaluate(() => window.MCCA.objectivesDebug.evaluate());
      // Some objectives need a real page reload (e.g. "it survives a refresh").
      if (fx.afterReload) {
        await sleep(800); // let the checklist writes land
        await page.reload({ waitUntil: "load" });
        await page.waitForFunction(() => window.MCCA && window.MCCA.objectivesDebug, { timeout: 15000 });
        await sleep(500);
        await page.evaluate("(" + fx.afterReload.toString() + ")()");
        await sleep(fx.wait || 2500);
        await page.evaluate(() => window.MCCA.objectivesDebug.evaluate());
      }
      const failed = await page.evaluate((ids) => ids.filter((id) => !document.getElementById(id).checked), ids);
      if (failed.length) problems.push("fixture fails " + failed.join(","));
    }

    // ---- 3. quiz ----
    const rendered = await page.evaluate(() => document.querySelectorAll(".mcca-quiz-q").length);
    if (rendered < 4) problems.push("quiz rendered " + rendered + " questions");
  } catch (e) {
    problems.push("harness error: " + e.message);
  }
  if (errors.length) problems.push("console: " + errors.slice(0, 3).join(" | "));
  console.log((problems.length ? "FAIL " : "ok   ") + m.id.padEnd(8) + " auto=" + autoCount + (problems.length ? "  " + problems.join("; ") : ""));
  if (problems.length) failures++;
  await page.close();
}
await browser.close();
console.log(failures ? `\n${failures} mission(s) failed` : `\nALL ${missions.length} MISSIONS PASSED`);
process.exit(failures ? 1 : 0);
