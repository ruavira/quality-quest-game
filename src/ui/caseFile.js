import { h } from "./dom.js";

const BADGE_LIBRARY = {
  signal_spotter:          { title: "Signal Spotter",         desc: "5 correct calls + 5 correct non-calls on run-chart signals." },
  operational_definition:  { title: "Operational Definition", desc: "Built 3 well-formed operational definitions." },
  family_of_measures:      { title: "Family of Measures",     desc: "Balanced outcome / process / balancing picks." },
  board_ready:             { title: "Board-Ready",            desc: "Spotted the 'target on a control chart' category error." },
  equity_lens:             { title: "Equity Lens",            desc: "Stratified data when it changed the story." },
  reflective_practitioner: { title: "Reflective Practitioner",desc: "Wrote 3 reflections after scenarios." },
  curriculum_connoisseur:  { title: "Curriculum Connoisseur", desc: "Solved at least one scenario in every MVP module." },
};

export function renderCaseFile({ profile, library, completedIds, answers, badges, onBack, onExport, onPrint }) {
  const lastThree = completedIds.slice(-3).map(id => library.find(s => s.id === id)).filter(Boolean);
  const totalAttempts = Object.values(answers).reduce((a, b) => a + (b.attempts || 0), 0);
  const correctCount = Object.values(answers).filter(a => a.correct).length;

  const root = h("section", { class: "card" });
  root.append(h("p", { class: "eyebrow" }, "Quality Quest — Case File"));
  root.append(h("h2", {}, "Your learning artefact"));
  root.append(h("p", {}, `Generated ${new Date().toLocaleDateString()}. This is a one-page personal learning record. It is not a clinical document and not a credential. Print or download it for your CPD log.`));

  root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Profile"));
  root.append(h("p", {},
    "Roles: ", (profile?.roles || []).join(", ") || "—", "  ·  ",
    "Setting: ", profile?.setting || "—"));

  root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Performance summary"));
  root.append(h("p", {},
    `Scenarios completed: ${completedIds.length}  ·  Items answered correctly: ${correctCount} / ${totalAttempts}  ·  Badges earned: ${badges.length}`));

  if (lastThree.length) {
    root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Your last three scenarios"));
    const list = h("ol", { style: { paddingLeft: "18px", margin: 0 } });
    for (const s of lastThree) {
      const a = answers[s.id] || {};
      const reflItem = a.reflection ? h("p", { style: { margin: "4px 0 0", color: "var(--ink-500)" } }, "Reflection: ", h("em", {}, a.reflection)) : null;
      list.append(h("li", { style: { marginBottom: "10px" } },
        h("strong", {}, s.title),
        h("span", { style: { color: "var(--ink-500)" } }, ` — Module ${s.module}, ${s.tier === 1 ? "Apprentice" : s.tier === 2 ? "Practitioner" : "Architect"}`),
        h("p", { style: { margin: "4px 0 0" } }, summarise(s)),
        reflItem,
      ));
    }
    root.append(list);
  }

  if (badges.length) {
    root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Badges"));
    const grid = h("div", { class: "badge-list" });
    for (const b of badges) {
      const def = BADGE_LIBRARY[b] || { title: b, desc: "" };
      grid.append(h("div", { class: "badge is-earned" },
        h("div", { class: "badge-title" }, def.title),
        h("div", { class: "badge-desc" }, def.desc),
      ));
    }
    root.append(grid);
  }

  root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Disclaimer"));
  root.append(h("p", { style: { fontSize: "0.875rem", color: "var(--ink-500)" } },
    "Quality Quest is a learning tool. This Case File is for your personal portfolio and CPD record. ",
    "It is not equivalent to CPHQ, CPPS, ISQua, COHSASA, SafeCare, or any other credential."));

  root.append(h("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" } },
    h("button", { class: "btn btn-primary", onclick: onPrint }, "Print this page (for PDF)"),
    h("button", { class: "btn btn-secondary", onclick: onExport }, "Download transcript (JSON)"),
    h("button", { class: "btn btn-ghost", onclick: onBack }, "Back"),
  ));

  return root;
}

function summarise(s) {
  return s.brief?.split(/\n+/)[0]?.slice(0, 180) + (s.brief?.length > 180 ? "…" : "");
}
