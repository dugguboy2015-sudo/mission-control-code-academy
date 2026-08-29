/* ============================================================
   MISSION CONTROL CODE ACADEMY — Academy data layer (Phase 2)
   Wraps Supabase auth + Postgres behind a small API (`window.Academy`).

   Load order on any page that needs it:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="assets/config.js"></script>
     <script src="assets/supabase.js"></script>
     <script src="assets/academy.js"></script>   (delegates to Academy.progress/theme)

   TWO independent ways to be "signed in" on a given device — the site is
   hard-gated (see assets/auth-guard.js), so every page must resolve to
   one of these or bounce to the landing page:

     1. PARENT session — real Supabase Auth (email+password). RLS on the
        underlying tables keys everything off auth.uid(). Full account:
        can manage children, see the family dashboard, etc.

     2. CHILD-LINK session — no Supabase Auth at all. A child gets a
        unique bookmarkable URL (child.html?c=<id>&t=<access_token>).
        That token IS the real security boundary (122 bits of randomness,
        the same "secret share-link" pattern as a calendar feed) — the
        optional PIN on top is a soft convenience lock, not real security.
        Because there's no auth.uid() to check, all child data access goes
        through SECURITY DEFINER Postgres RPCs (child_get_progress, etc.)
        that manually verify (child_id, access_token) themselves — see
        supabase/schema.sql.

   Reads/writes below branch on whichever session is present. If Supabase
   isn't configured at all, calls throw — there is no silent guest mode
   anymore; assets/auth-guard.js is what actually keeps unauthenticated
   visitors off real content, this file just refuses to fabricate data
   for a session that doesn't exist.
   ============================================================ */
(function () {
  "use strict";

  const ACTIVE_CHILD_KEY = "mcca_active_child";     // parent-session mode: which child is picked
  const CHILD_LINK_KEY = "mcca_child_link_session";  // child-link mode: {childId, accessToken}

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
  function slugifyUsername(name) {
    const base = (name || "cadet").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16) || "cadet";
    return base + Math.floor(100 + Math.random() * 900); // e.g. "nova482"
  }

  function buildAccessUrl(childId, accessToken) {
    const origin = window.location.origin;
    const base = origin.includes("localhost") || origin.includes("127.0.0.1") ? origin : origin;
    return base + "/child.html?c=" + childId + "&t=" + accessToken;
  }

  const family = {
    async listChildren() {
      const { data, error } = await requireClient()
        .from("children")
        .select("id, name, avatar, theme, username, access_token, created_at, pin_hash")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Never expose the hash itself to callers — just whether a PIN exists.
      return (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        theme: c.theme,
        username: c.username,
        hasPin: !!c.pin_hash,
        accessUrl: buildAccessUrl(c.id, c.access_token),
      }));
    },

    async createChild({ name, avatar, pin, username }) {
      const session = await auth.getSession();
      if (!session) throw new Error("Must be signed in to create a child profile");

      let attempt = username && username.trim() ? username.trim() : slugifyUsername(name);
      for (let tries = 0; tries < 3; tries++) {
        const { data, error } = await requireClient()
          .from("children")
          .insert({ name, avatar: avatar || "🚀", parent_id: session.user.id, username: attempt })
          .select("id, name, avatar, theme, username, access_token")
          .single();
        if (!error) {
          if (pin) await family.setPin(data.id, pin);
          return { ...data, accessUrl: buildAccessUrl(data.id, data.access_token) };
        }
        // Unique-violation on username — try a fresh random one, otherwise bubble up.
        if (error.code === "23505" && tries < 2) {
          attempt = slugifyUsername(name);
          continue;
        }
        throw error;
      }
    },

    async updateChild(childId, patch) {
      const allowed = {};
      if (patch.name !== undefined) allowed.name = patch.name;
      if (patch.avatar !== undefined) allowed.avatar = patch.avatar;
      if (patch.theme !== undefined) allowed.theme = patch.theme;
      if (patch.username !== undefined) allowed.username = patch.username;
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

  /* ---------------- session: which mode is this device in right now? ---------------- */
  function getActiveChild() {
    try { return localStorage.getItem(ACTIVE_CHILD_KEY) || null; } catch (e) { return null; }
  }
  function setActiveChild(childId) {
    try { localStorage.setItem(ACTIVE_CHILD_KEY, childId); } catch (e) {}
  }
  function clearActiveChild() {
    try { localStorage.removeItem(ACTIVE_CHILD_KEY); } catch (e) {}
  }

  function getChildLinkSession() {
    try { return JSON.parse(localStorage.getItem(CHILD_LINK_KEY)); } catch (e) { return null; }
  }
  function setChildLinkSession(childId, accessToken) {
    try { localStorage.setItem(CHILD_LINK_KEY, JSON.stringify({ childId, accessToken })); } catch (e) {}
  }
  function clearChildLinkSession() {
    try { localStorage.removeItem(CHILD_LINK_KEY); } catch (e) {}
  }

  const session = { getActiveChild, setActiveChild, clearActiveChild };

  /* ---------------- childLink (the URL/username+PIN entry path) ---------------- */
  const childLink = {
    getSession: getChildLinkSession,
    clearSession: clearChildLinkSession,
    buildAccessUrl,

    /** Look up (name/avatar/hasPin) for the greeting screen — before the PIN is known. */
    async publicInfo(childId, accessToken) {
      const { data, error } = await requireClient().rpc("child_public_info", {
        p_child_id: childId,
        p_access_token: accessToken,
      });
      if (error) throw error;
      return (data && data[0]) || null;
    },

    /** Confirm the PIN for a (childId, accessToken) pair already known from the URL, then store the session. */
    async loginWithLink(childId, accessToken, pin) {
      const { data, error } = await requireClient().rpc("child_link_verify_pin", {
        p_child_id: childId,
        p_access_token: accessToken,
        p_pin: pin || "",
      });
      if (error) throw error;
      if (!data) return false;
      setChildLinkSession(childId, accessToken);
      return true;
    },

    /** Fallback login from a device without the bookmark: username + PIN only. */
    async loginByUsername(username, pin) {
      const { data, error } = await requireClient().rpc("child_login_by_username", {
        p_username: username,
        p_pin: pin || "",
      });
      if (error) throw error;
      const row = data && data[0];
      if (!row) return null;
      setChildLinkSession(row.child_id, row.access_token);
      return row;
    },
  };

  /* ---------------- progress (branches on session mode; no silent guest fallback) ---------------- */
  const progress = {
    mode() {
      if (!configured || !client) return null;
      if (getActiveChild()) return "parent";
      const link = getChildLinkSession();
      if (link) return "child";
      return null;
    },
    isRemote() { return progress.mode() !== null; },

    async all() {
      const mode = progress.mode();
      if (mode === "parent") {
        const { data, error } = await client.from("progress").select("mission_id").eq("child_id", getActiveChild());
        if (error) throw error;
        const map = {};
        (data || []).forEach((row) => { map[row.mission_id] = true; });
        return map;
      }
      if (mode === "child") {
        const link = getChildLinkSession();
        const { data, error } = await client.rpc("child_get_progress", { p_child_id: link.childId, p_access_token: link.accessToken });
        if (error) throw error;
        const map = {};
        (data || []).forEach((row) => { map[row.mission_id] = true; });
        return map;
      }
      throw new Error("No active session — this should be unreachable behind the auth guard");
    },

    async isComplete(missionId) {
      const all = await progress.all();
      return !!all[missionId];
    },

    async markComplete(missionId, complete) {
      const mode = progress.mode();
      if (mode === "parent") {
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
        return;
      }
      if (mode === "child") {
        const link = getChildLinkSession();
        const { error } = await client.rpc("child_mark_progress", {
          p_child_id: link.childId, p_access_token: link.accessToken, p_mission_id: missionId, p_complete: complete,
        });
        if (error) throw error;
        return;
      }
      throw new Error("No active session — this should be unreachable behind the auth guard");
    },

    async getTheme() {
      const mode = progress.mode();
      if (mode === "parent") {
        const { data, error } = await client.from("children").select("theme").eq("id", getActiveChild()).single();
        if (error) throw error;
        return (data && data.theme) || "dark";
      }
      if (mode === "child") {
        const link = getChildLinkSession();
        const { data, error } = await client.rpc("child_get_theme", { p_child_id: link.childId, p_access_token: link.accessToken });
        if (error) throw error;
        return data || "dark";
      }
      return "dark";
    },

    async setTheme(theme) {
      const mode = progress.mode();
      if (mode === "parent") {
        const { error } = await client.from("children").update({ theme }).eq("id", getActiveChild());
        if (error) throw error;
        return;
      }
      if (mode === "child") {
        const link = getChildLinkSession();
        const { error } = await client.rpc("child_set_theme", { p_child_id: link.childId, p_access_token: link.accessToken, p_theme: theme });
        if (error) throw error;
      }
    },
  };

  /* ---------------- checklist state (per child, per mission) ---------------- */
  const checklist = {
    async get(missionId) {
      const mode = progress.mode();
      if (mode === "parent") {
        const { data, error } = await client
          .from("checklist_state")
          .select("item_id, checked")
          .eq("child_id", getActiveChild())
          .eq("mission_id", missionId);
        if (error) throw error;
        const map = {};
        (data || []).forEach((row) => { map[row.item_id] = row.checked; });
        return map;
      }
      if (mode === "child") {
        const link = getChildLinkSession();
        const { data, error } = await client.rpc("child_get_checklist", {
          p_child_id: link.childId, p_access_token: link.accessToken, p_mission_id: missionId,
        });
        if (error) throw error;
        const map = {};
        (data || []).forEach((row) => { map[row.item_id] = row.checked; });
        return map;
      }
      return {};
    },

    async set(missionId, itemId, checked) {
      const mode = progress.mode();
      if (mode === "parent") {
        const { error } = await client.from("checklist_state").upsert(
          { child_id: getActiveChild(), mission_id: missionId, item_id: itemId, checked },
          { onConflict: "child_id,mission_id,item_id" }
        );
        if (error) throw error;
        return;
      }
      if (mode === "child") {
        const link = getChildLinkSession();
        const { error } = await client.rpc("child_set_checklist", {
          p_child_id: link.childId, p_access_token: link.accessToken, p_mission_id: missionId, p_item_id: itemId, p_checked: checked,
        });
        if (error) throw error;
      }
    },
  };

  window.Academy = { auth, family, session, childLink, progress, checklist };
})();
