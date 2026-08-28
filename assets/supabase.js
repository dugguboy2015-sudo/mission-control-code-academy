/* ============================================================
   MISSION CONTROL CODE ACADEMY — Academy data layer (Phase 2)
   Wraps Supabase auth + Postgres behind a small API (`window.Academy`).

   Load order on any page that needs it:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="assets/config.js"></script>
     <script src="assets/supabase.js"></script>
     <script src="assets/academy.js"></script>   (delegates to Academy.progress/theme)

   Design: only PARENTS authenticate (Supabase auth user). Children are
   rows the parent owns, picked on a "who's learning?" screen. If
   MCCA_CONFIG isn't filled in, or no child is active, everything
   gracefully falls back to localStorage — the site keeps working with
   zero accounts, and signing in "upgrades" it.
   ============================================================ */
(function () {
  "use strict";

  const ACTIVE_CHILD_KEY = "mcca_active_child";
  const cfg = window.MCCA_CONFIG || {};
  const configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  let client = null;
  if (configured && window.supabase && window.supabase.createClient) {
    client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }

  function requireClient() {
    if (!client) throw new Error("Supabase is not configured — fill in assets/config.js");
    return client;
  }

  /* ---------------- auth (parent) ---------------- */
  const auth = {
    isConfigured: () => configured,

    async signUp(email, password) {
      const { data, error } = await requireClient().auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    async signIn(email, password) {
      const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signOut() {
      clearActiveChild();
      if (!client) return;
      await client.auth.signOut();
    },
    async getSession() {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data.session || null;
    },
    onChange(callback) {
      if (!client) return () => {};
      const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
      return () => data.subscription.unsubscribe();
    },
  };

  /* ---------------- family (children under the signed-in parent) ---------------- */
  const family = {
    async listChildren() {
      const { data, error } = await requireClient()
        .from("children")
        .select("id, name, avatar, theme, created_at, pin_hash")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Never expose the hash itself to callers — just whether a PIN exists.
      return (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        theme: c.theme,
        hasPin: !!c.pin_hash,
      }));
    },

    async createChild({ name, avatar, pin }) {
      const session = await auth.getSession();
      if (!session) throw new Error("Must be signed in to create a child profile");
      const { data, error } = await requireClient()
        .from("children")
        .insert({ name, avatar: avatar || "🚀", parent_id: session.user.id })
        .select()
        .single();
      if (error) throw error;
      if (pin) await family.setPin(data.id, pin);
      return data;
    },

    async updateChild(childId, patch) {
      const allowed = {};
      if (patch.name !== undefined) allowed.name = patch.name;
      if (patch.avatar !== undefined) allowed.avatar = patch.avatar;
      if (patch.theme !== undefined) allowed.theme = patch.theme;
      const { error } = await requireClient().from("children").update(allowed).eq("id", childId);
      if (error) throw error;
    },

    async deleteChild(childId) {
      const { error } = await requireClient().from("children").delete().eq("id", childId);
      if (error) throw error;
      if (getActiveChild() === childId) clearActiveChild();
    },

    async setPin(childId, pin) {
      const { error } = await requireClient().rpc("set_child_pin", { p_child_id: childId, p_pin: pin || null });
      if (error) throw error;
    },

    async verifyPin(childId, pin) {
      const { data, error } = await requireClient().rpc("verify_child_pin", { p_child_id: childId, p_pin: pin });
      if (error) throw error;
      return !!data;
    },
  };

  /* ---------------- session (which child is active on this device right now) ---------------- */
  function getActiveChild() {
    try { return localStorage.getItem(ACTIVE_CHILD_KEY) || null; } catch (e) { return null; }
  }
  function setActiveChild(childId) {
    try { localStorage.setItem(ACTIVE_CHILD_KEY, childId); } catch (e) {}
  }
  function clearActiveChild() {
    try { localStorage.removeItem(ACTIVE_CHILD_KEY); } catch (e) {}
  }
  const session = { getActiveChild, setActiveChild, clearActiveChild };

  /* ---------------- progress (keyed to the active child; localStorage fallback) ---------------- */
  const LOCAL_PROGRESS_KEY = "mcca_progress";
  const LOCAL_THEME_KEY = "mcca_theme";

  function localProgress() {
    try { return JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveLocalProgress(p) {
    try { localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(p)); } catch (e) {}
  }

  const progress = {
    // True once we know whether server data is actually reachable for the active child.
    isRemote: () => configured && !!client && !!getActiveChild(),

    async all() {
      const childId = getActiveChild();
      if (!progress.isRemote()) return localProgress();
      const { data, error } = await client.from("progress").select("mission_id").eq("child_id", childId);
      if (error) throw error;
      const map = {};
      (data || []).forEach((row) => { map[row.mission_id] = true; });
      return map;
    },

    async isComplete(missionId) {
      const all = await progress.all();
      return !!all[missionId];
    },

    async markComplete(missionId, complete) {
      if (!progress.isRemote()) {
        const p = localProgress();
        if (complete) p[missionId] = true; else delete p[missionId];
        saveLocalProgress(p);
        return;
      }
      const childId = getActiveChild();
      if (complete) {
        const { error } = await client.from("progress").upsert(
          { child_id: childId, mission_id: missionId },
          { onConflict: "child_id,mission_id" }
        );
        if (error) throw error;
      } else {
        const { error } = await client.from("progress").delete().eq("child_id", childId).eq("mission_id", missionId);
        if (error) throw error;
      }
    },

    /** One-time helper: push everything currently in localStorage up to the active child. */
    async importFromLocalStorage() {
      if (!progress.isRemote()) return 0;
      const local = localProgress();
      const ids = Object.keys(local).filter((k) => local[k]);
      if (!ids.length) return 0;
      const childId = getActiveChild();
      const rows = ids.map((mission_id) => ({ child_id: childId, mission_id }));
      const { error } = await client.from("progress").upsert(rows, { onConflict: "child_id,mission_id" });
      if (error) throw error;
      return ids.length;
    },

    async getTheme() {
      if (!progress.isRemote()) {
        try { return localStorage.getItem(LOCAL_THEME_KEY) || "dark"; } catch (e) { return "dark"; }
      }
      const childId = getActiveChild();
      const { data, error } = await client.from("children").select("theme").eq("id", childId).single();
      if (error) throw error;
      return (data && data.theme) || "dark";
    },

    async setTheme(theme) {
      if (!progress.isRemote()) {
        try { localStorage.setItem(LOCAL_THEME_KEY, theme); } catch (e) {}
        return;
      }
      const childId = getActiveChild();
      const { error } = await client.from("children").update({ theme }).eq("id", childId);
      if (error) throw error;
    },
  };

  /* ---------------- checklist state (per child, per mission) ---------------- */
  const checklist = {
    async get(missionId) {
      if (!progress.isRemote()) {
        try { return JSON.parse(localStorage.getItem("mcca_checklist_" + missionId)) || {}; } catch (e) { return {}; }
      }
      const childId = getActiveChild();
      const { data, error } = await client
        .from("checklist_state")
        .select("item_id, checked")
        .eq("child_id", childId)
        .eq("mission_id", missionId);
      if (error) throw error;
      const map = {};
      (data || []).forEach((row) => { map[row.item_id] = row.checked; });
      return map;
    },

    async set(missionId, itemId, checked) {
      if (!progress.isRemote()) {
        const key = "mcca_checklist_" + missionId;
        let state = {};
        try { state = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) {}
        state[itemId] = checked;
        try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
        return;
      }
      const childId = getActiveChild();
      const { error } = await client.from("checklist_state").upsert(
        { child_id: childId, mission_id: missionId, item_id: itemId, checked },
        { onConflict: "child_id,mission_id,item_id" }
      );
      if (error) throw error;
    },
  };

  window.Academy = { auth, family, session, progress, checklist };
})();
