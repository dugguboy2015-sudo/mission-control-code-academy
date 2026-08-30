/* ============================================================
   MISSION CONTROL CODE ACADEMY — hard auth gate
   Include on every page that requires a session (all mission pages,
   dashboard.html, family.html). Pairs with a `<style>html{visibility:hidden}</style>`
   placed in <head> BEFORE this script runs — this script is the ONLY
   thing that removes that hiding, and only after confirming a valid
   parent or child-link session. That ordering means an unauthenticated
   visitor never sees a flash of real content before the redirect to the
   landing page fires.

   Load order: config.js, supabase.js, THEN this file — BEFORE academy.js.
   ============================================================ */
(function () {
  "use strict";

  function reveal() {
    // The hiding rule is `html{visibility:hidden}` in a <style> block in
    // <head> — a real stylesheet rule, not an inline style. Setting the
    // inline style to "" clears any inline OVERRIDE but does nothing to
    // beat that stylesheet rule, so the page stayed invisible forever
    // regardless of whether the rest of the page's JS succeeded. Setting
    // it to an actual value ("visible") is what wins the cascade.
    document.documentElement.style.visibility = "visible";
  }
  function bounce() {
    window.location.replace("/index.html");
  }
  function showStuckError(message) {
    // Never leave the page invisible with zero feedback — that's
    // indistinguishable from "stuck loading forever" to a real visitor.
    document.documentElement.style.visibility = "visible";
    document.body.innerHTML =
      '<div style="max-width:480px;margin:80px auto;padding:24px;text-align:center;font-family:sans-serif;color:#e8ecfb;">'
      + '<p>' + message + '</p>'
      + '<button onclick="location.reload()" style="margin-top:16px;padding:10px 20px;cursor:pointer;">Retry</button>'
      + ' <a href="/index.html" style="margin-left:10px;color:#4ee1ff;">Back to start</a>'
      + '</div>';
  }

  // Cloudflare Pages serves clean URLs — "/dashboard" and "/dashboard.html"
  // return identical content, and window.location.pathname reflects
  // whichever one the visitor actually landed on. Matching only the
  // ".html" form here misclassifies the extension-less URL as a mission
  // page and sends it on an extra (harmless but pointless) redirect hop.
  const path = window.location.pathname;
  const onDashboard = /\/dashboard(\.html)?\/?$/.test(path);
  const onFamily = /\/family(\.html)?\/?$/.test(path);

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timed out after " + ms + "ms")), ms)),
    ]);
  }

  (async function guard() {
    if (!window.Academy || !window.Academy.auth.isConfigured()) {
      bounce();
      return;
    }

    try {
      const parentSession = await withTimeout(window.Academy.auth.getSession(), 8000);
      if (parentSession) {
        if (onDashboard || onFamily) {
          reveal();
          return;
        }
        if (window.Academy.session.getActiveChild()) {
          reveal();
          return;
        }
        window.location.replace("/dashboard.html");
        return;
      }

      const link = window.Academy.childLink.getSession();
      if (link && link.childId && link.accessToken) {
        if (onFamily) {
          bounce();
          return;
        }
        reveal();
        return;
      }

      bounce();
    } catch (e) {
      console.error("[auth-guard] session check failed:", e);
      // A real error (or our own timeout) — show something actionable
      // instead of leaving the page invisible with no explanation.
      showStuckError("Couldn't verify your session (" + (e && e.message ? e.message : "unknown error") + "). This is usually temporary.");
    }
  })();
})();
