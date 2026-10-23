/* ============================================================
   MISSION CONTROL CODE ACADEMY — REUSABLE COMMAND CONSOLE RUNNERS
   Three standardized interactive practice components:
     initJsSandbox()      — live JavaScript, console.log() + a "display" element
     initPythonSandbox()  — real Python in the browser via Skulpt
     initHtmlCssPreview() — live HTML/CSS via <iframe srcdoc>
   Each takes a config object of element IDs + starter/example code,
   so any new mission can wire one up without re-writing the runner.
   ============================================================ */

/* ---------------- Run reporting (feeds auto-checked objectives) ----------------
   Every runner announces each run as an `mcca:run` event. engagement.js
   listens and re-checks the mission's objectives against what happened.

   `authored` is the anti-freebie rule: a run only counts toward objectives
   when the code differs from the starter AND from every example button's
   code — otherwise the automatic first run on page load (or clicking a
   "try:" example) would complete objectives the cadet never touched. */
function mccaNormalizeCode(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}
function mccaIsAuthored(code, cfg) {
  const norm = mccaNormalizeCode(code);
  if (!norm) return false;
  const known = [cfg.starter].concat((cfg.examples || []).map((e) => e.code));
  return !known.some((k) => mccaNormalizeCode(k) === norm);
}
function mccaReportRun(detail, cfg) {
  if (cfg) detail.known = [cfg.starter].concat((cfg.examples || []).map((e) => e.code));
  try {
    document.dispatchEvent(new CustomEvent("mcca:run", { detail }));
  } catch (e) { /* never let reporting break a run */ }
}

/* ---------------- JS Sandbox ---------------- */
function initJsSandbox(cfg) {
  const editor = document.getElementById(cfg.editorId);
  let display = document.getElementById(cfg.displayId);
  const output = document.getElementById(cfg.outputId);
  const runBtn = document.getElementById(cfg.runBtnId);
  if (!editor || !runBtn) return;

  function log(text, isError) {
    const line = document.createElement("div");
    line.className = "log-line" + (isError ? " log-error" : "");
    line.textContent = (isError ? "⚠ " : "> ") + text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }
  function formatArg(a) {
    if (typeof a === "object") {
      try { return JSON.stringify(a); } catch (e) { return String(a); }
    }
    return String(a);
  }

  function run() {
    output.innerHTML = "";
    if (display) {
      const fresh = document.createElement("div");
      fresh.id = cfg.displayId;
      fresh.className = display.className;
      // Use ?? not || — an intentionally empty string ("start with a blank
      // container") is falsy and would otherwise be silently overridden by
      // the default text.
      fresh.textContent = cfg.displayResetText ?? "STATUS: STANDBY";
      display.replaceWith(fresh);
      // Track the live element so the NEXT run() resets the node actually in
      // the DOM, not the detached one this call just replaced — without this,
      // only the first run ever clears the display; every run after it calls
      // replaceWith() on a disconnected node, which is a silent no-op, so
      // content built up by appendChild (e.g. a growing list) keeps
      // accumulating across repeated clicks instead of resetting each time.
      display = fresh;
    }
    const fakeConsole = {
      log: (...args) => log(args.map(formatArg).join(" "), false),
      error: (...args) => log(args.map(formatArg).join(" "), true),
    };
    const scopedDocument = {
      querySelector: (sel) => {
        if (cfg.displayId && sel === "#" + cfg.displayId) return document.getElementById(cfg.displayId);
        return document.querySelector(sel);
      },
      getElementById: (id) => document.getElementById(id),
      createElement: (tag) => document.createElement(tag),
    };
    let threw = false;
    try {
      const runner = new Function("console", "document", editor.value);
      runner(fakeConsole, scopedDocument);
    } catch (err) {
      threw = true;
      log(err.message, true);
    }
    mccaReportRun({
      kind: "js",
      code: editor.value,
      error: threw,
      authored: mccaIsAuthored(editor.value, cfg),
      outputEl: output,
      displayId: cfg.displayId || null,
    }, cfg);
  }

  runBtn.addEventListener("click", run);
  const resetBtn = cfg.resetBtnId && document.getElementById(cfg.resetBtnId);
  if (resetBtn) resetBtn.addEventListener("click", () => { editor.value = cfg.starter; run(); });

  (cfg.examples || []).forEach((ex) => {
    const btn = document.getElementById(ex.btnId);
    if (btn) btn.addEventListener("click", () => { editor.value = ex.code; run(); });
  });

  editor.value = cfg.starter || "";
  run();
  return { run };
}

/* ---------------- Python Sandbox (Skulpt) ---------------- */
function initPythonSandbox(cfg) {
  const editor = document.getElementById(cfg.editorId);
  const output = document.getElementById(cfg.outputId);
  const runBtn = document.getElementById(cfg.runBtnId);
  if (!editor || !runBtn) return;

  let skulptReady = false;

  function outf(text) {
    const line = document.createElement("div");
    line.className = "out-line";
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }
  function builtinRead(x) {
    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined) {
      throw "File not found: '" + x + "'";
    }
    return window.Sk.builtinFiles["files"][x];
  }
  function run() {
    if (!skulptReady) {
      output.innerHTML = '<div class="out-status">Interpreter still loading, try again in a moment…</div>';
      return;
    }
    output.innerHTML = "";
    const Sk = window.Sk;
    Sk.pre = cfg.outputId;
    Sk.configure({ output: outf, read: builtinRead, __future__: Sk.python3 });
    Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody("<stdin>", false, editor.value, true);
    }).then(
      function () {
        if (output.children.length === 0) {
          output.innerHTML = '<div class="out-status">Ran with no output — try adding a print() statement.</div>';
        }
        mccaReportRun({ kind: "python", code: editor.value, error: false, authored: mccaIsAuthored(editor.value, cfg), outputEl: output }, cfg);
      },
      function (err) {
        const line = document.createElement("div");
        line.className = "out-error";
        line.textContent = err.toString();
        output.appendChild(line);
        mccaReportRun({ kind: "python", code: editor.value, error: true, authored: mccaIsAuthored(editor.value, cfg), outputEl: output }, cfg);
      }
    );
  }

  function checkSkulpt() {
    if (window.Sk) {
      skulptReady = true;
      output.innerHTML = '<div class="out-status">Interpreter ready. Hit RUN.</div>';
      run();
    } else {
      setTimeout(checkSkulpt, 200);
    }
  }

  runBtn.addEventListener("click", run);
  const resetBtn = cfg.resetBtnId && document.getElementById(cfg.resetBtnId);
  if (resetBtn) resetBtn.addEventListener("click", () => { editor.value = cfg.starter; run(); });

  (cfg.examples || []).forEach((ex) => {
    const btn = document.getElementById(ex.btnId);
    if (btn) btn.addEventListener("click", () => { editor.value = ex.code; run(); });
  });

  editor.value = cfg.starter || "";
  checkSkulpt();
  return { run };
}

/* ---------------- HTML/CSS Live Preview ---------------- */
function initHtmlCssPreview(cfg) {
  const editor = document.getElementById(cfg.editorId);
  const frame = document.getElementById(cfg.frameId);
  const charCount = cfg.charCountId ? document.getElementById(cfg.charCountId) : null;
  if (!editor || !frame) return;

  function render() {
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${cfg.previewCss || "body{font-family:-apple-system,sans-serif;padding:16px;color:#1a1a2e;} img{max-width:100%;}"}</style></head><body>${editor.value}</body></html>`
    );
    doc.close();
    if (charCount) charCount.textContent = editor.value.length + " chars";
    mccaReportRun({ kind: "html", code: editor.value, error: false, authored: mccaIsAuthored(editor.value, cfg), frame }, cfg);
  }

  editor.addEventListener("input", render);
  editor.value = cfg.starter || "";
  render();
  return { render };
}
