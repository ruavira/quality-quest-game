import { h } from "./dom.js";
import { localizeValue } from "../terminology.js";
import { ROLES, SETTINGS } from "./onboarding.js";

const BADGE_LIBRARY = {
  signal_spotter:          { title: "Signal Spotter",         desc: "Correctly called three signals and rejected two noise patterns." },
  operational_definition:  { title: "Operational Definition", desc: "Demonstrated operational definitions in construction and free-writing tasks." },
  family_of_measures:      { title: "Family of Measures",     desc: "Demonstrated classification and applied family-of-measures decisions." },
  board_ready:             { title: "Board-Ready",            desc: "Completed two distinct board-facing data judgements." },
  equity_lens:             { title: "Equity Lens",            desc: "Demonstrated equity interpretation in two scenarios." },
  reflective_practitioner: { title: "Reflective Practitioner",desc: "Wrote 3 reflections after scenarios." },
  curriculum_connoisseur:  { title: "Curriculum Connoisseur", desc: "Solved at least one scenario in all eight modules." },
};

export function renderCaseFile({ profile, library, completedIds, answers, history = [], badges, onBack, onExport, onPrint }) {
  const attemptHistory = history.length ? history : legacyHistory(answers);
  const recentIds = [...attemptHistory].reverse().map(item => item.scenarioId)
    .filter((id, index, all) => all.indexOf(id) === index).slice(0, 3);
  const lastThree = recentIds.map(id => library.find(s => s.id === id)).filter(Boolean)
    .map(s => localizeValue(s, profile));
  const totalAttempts = Object.values(answers).reduce((a, b) => a + (b.attempts || 0), 0);
  const attemptedIds = Object.keys(answers);
  const demonstrated = competencyEvidence(library, completedIds);
  const practised = new Set(attemptedIds.flatMap(id => library.find(s => s.id === id)?.competency_tags || []));
  const developing = [...practised].filter(tag => !demonstrated.has(tag));

  const root = h("section", { class: "card" });
  root.append(h("p", { class: "eyebrow" }, "Quality Quest — Case File"));
  root.append(h("h2", {}, "Your learning artefact"));
  root.append(h("p", {}, `Generated ${new Date().toLocaleDateString()}. This is a one-page personal learning record. It is not a clinical document and not a credential. Print or download it for your CPD log.`));

  root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Profile"));
  root.append(h("p", {},
    "Roles: ", (profile?.roles || []).map(id => labelFor(ROLES, id)).join(", ") || "—", "  ·  ",
    "Setting: ", profile?.setting ? labelFor(SETTINGS, profile.setting) : "—"));

  root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Practice summary"));
  root.append(h("p", {},
    `${totalAttempts} practice attempt${totalAttempts === 1 ? "" : "s"} across ${attemptedIds.length} scenario${attemptedIds.length === 1 ? "" : "s"}. ` +
    `${demonstrated.size} competenc${demonstrated.size === 1 ? "y is" : "ies are"} demonstrated; ${developing.length} still developing. ` +
    `${badges.length} evidence badge${badges.length === 1 ? "" : "s"} earned.`));

  if (practised.size) {
    root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Competency evidence"));
    const evidence = h("ul", { class: "evidence-list" });
    for (const tag of [...practised].sort()) {
      evidence.append(h("li", {}, h("strong", {}, humanize(tag)), " — ",
        demonstrated.has(tag) ? "demonstrated across question types" : "developing through practice"));
    }
    root.append(evidence);
  }

  if (lastThree.length) {
    root.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, "Your three most recent scenarios"));
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

function competencyEvidence(library, completedIds) {
  const typesByTag = new Map();
  for (const id of completedIds) {
    const scenario = library.find(s => s.id === id);
    if (!scenario) continue;
    for (const tag of scenario.competency_tags || []) {
      if (!typesByTag.has(tag)) typesByTag.set(tag, new Set());
      typesByTag.get(tag).add(scenario.itemType);
    }
  }
  return new Set([...typesByTag].filter(([, types]) => types.size >= 2).map(([tag]) => tag));
}

function legacyHistory(answers) {
  return Object.entries(answers).sort((a, b) => a[1].lastAt - b[1].lastAt)
    .map(([scenarioId, answer]) => ({ scenarioId, correct: answer.correct, at: answer.lastAt }));
}

function humanize(tag) {
  return tag.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function labelFor(options, id) {
  return options.find(option => option.id === id)?.label ?? humanize(id);
}
