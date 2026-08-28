/* ============================================================
   MISSION CONTROL CODE ACADEMY — REUSABLE COMMAND CONSOLE RUNNERS
   Three standardized interactive practice components:
     initJsSandbox()      — live JavaScript, console.log() + a "display" element
     initPythonSandbox()  — real Python in the browser via Skulpt
     initHtmlCssPreview() — live HTML/CSS via <iframe srcdoc>
   Each takes a config object of element IDs + starter/example code,
   so any new mission can wire one up without re-writing the runner.
   ============================================================ */

/* ---------------- JS Sandbox ---------------- */
function initJsSandbox(cfg) {
  const editor = document.getElementById(cfg.editorId);
  const display = document.getElementById(cfg.displayId);
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
    let freshDisplay = display;
    if (display) {
      const fresh = document.createElement("div");
      fresh.id = cfg.displayId;
      fresh.className = display.className;
      fresh.textContent = cfg.displayResetText || "STATUS: STANDBY";
      display.replaceWith(fresh);
      freshDisplay = fresh;
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
    try {
      const runner = new Function("console", "document", editor.value);
      runner(fakeConsole, scopedDocument);
    } catch (err) {
      log(err.message, true);
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
      },
      function (err) {
        const line = document.createElement("div");
        line.className = "out-error";
        line.textContent = err.toString();
        output.appendChild(line);
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
  }

  editor.addEventListener("input", render);
  editor.value = cfg.starter || "";
  render();
  return { render };
}
