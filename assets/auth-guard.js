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
    document.documentElement.style.visibility = "";
  }
  function bounce() {
    window.location.replace("/index.html");
  }

  (async function guard() {
    if (!window.Academy || !window.Academy.auth.isConfigured()) {
      // Supabase isn't configured at all — nothing works without it now.
      bounce();
      return;
    }

    const path = window.location.pathname;
    const onDashboard = path.endsWith("dashboard.html");
    const onFamily = path.endsWith("family.html");

    try {
      const parentSession = await window.Academy.auth.getSession();
      if (parentSession) {
        // Dashboard/family pages are fine for any signed-in parent, even
        // before a child is picked (dashboard.html shows the picker itself).
        if (onDashboard || onFamily) {
          reveal();
          return;
        }
        // Every other gated page (mission pages) needs a child actually
        // picked, since progress is always child-scoped.
        if (window.Academy.session.getActiveChild()) {
          reveal();
          return;
        }
        window.location.replace("/dashboard.html");
        return;
      }

      const link = window.Academy.childLink.getSession();
      if (link && link.childId && link.accessToken) {
        // Family settings are parent-only regardless of a stored child-link session.
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
      bounce();
    }
  })();
})();
