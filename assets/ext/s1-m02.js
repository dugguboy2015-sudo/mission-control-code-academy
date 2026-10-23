/* Mission 1.2 — Forms & Media: auto-checks + quiz bank */
(function () {
  const CONTROLS = "input:not([type=submit]):not([type=button]):not([type=hidden]), textarea, select";
  function labeled(doc, el) {
    if (el.closest("label")) return true;
    return !!(el.id && doc.querySelector('label[for="' + el.id + '"]'));
  }
  MCCA.ext("s1-m02", {
    objectives: {
      // Everything (including whatever you added) lives inside ONE form.
      ch1: (ctx) => {
        const d = ctx.frameDoc; if (!d) return false;
        const all = d.querySelectorAll(CONTROLS);
        return d.querySelectorAll("form").length === 1 && all.length >= 4 && Array.from(all).every((c) => c.closest("form"));
      },
      ch4: (ctx) => {
        const d = ctx.frameDoc; if (!d) return false;
        const sel = Array.from(d.querySelectorAll("form select")).some((s) => labeled(d, s) && s.options.length >= 2);
        const box = Array.from(d.querySelectorAll("form input[type=checkbox]")).some((c) => labeled(d, c) && c.name);
        const groups = {};
        d.querySelectorAll("form input[type=radio]").forEach((r) => { if (r.name && labeled(d, r)) groups[r.name] = (groups[r.name] || 0) + 1; });
        return sel || box || Object.values(groups).some((n) => n >= 2);
      },
    },
    quiz: [
      { q: "What does the name attribute on an input do?", options: ["Sets the text shown inside the box", "Gives the value a key when the form is submitted", "Makes the field required", "Links it to a label"], answer: 1, why: "Correct — name is the key the data is sent under (fullname=Nova)." },
      { q: "How does <label for=\"email\"> know which input it belongs to?", options: ["It's the next element", "It matches the input whose id is \"email\"", "It matches the input whose name is \"email\"", "It guesses"], answer: 1, why: "Right — for points at an id. Clicking the label then focuses that input." },
      { q: "What happens when you submit a form with an empty required field?", options: ["It submits anyway", "The browser blocks it and points at the empty field", "The page crashes", "The field fills itself"], answer: 1, why: "Yes — built-in validation, for free, no JavaScript needed." },
      { q: "Which input type gives phones an email-friendly keyboard and checks for an @?", options: ["type=\"text\"", "type=\"email\"", "type=\"mail\"", "type=\"at\""], answer: 1, why: "Correct — the right type gets you validation and a better keyboard." },
      { q: "Which control is best for picking ONE option from a list of 30 countries?", options: ["30 checkboxes", "A <select> dropdown", "A textarea", "30 separate forms"], answer: 1, why: "Right — a select keeps a long single-choice list compact." },
    ],
  });
})();
