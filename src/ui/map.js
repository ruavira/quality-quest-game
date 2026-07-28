// Quality Quest — Module Map view (4 × 2 grid, replaces linear path summary)

import { h } from "./dom.js";

const MODULE_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H"];

const MODULE_META = {
  A: { name: "Reading the Data",           desc: "Run charts · Data types · Numerator & denominator" },
  B: { name: "Using the Data",             desc: "PDSA cycles · Measure families · Driver diagrams" },
  C: { name: "Reading Safety Data",        desc: "Harm severity · Safety culture · RCA2 · FMEA · Just Culture · Human factors" },
  D: { name: "Quality Review",             desc: "Chart audit · Abstraction · M&M · Peer review" },
  E: { name: "Regulatory & Accreditation", desc: "SQHN · COHSASA · SafeCare · NHIA · JCI · CQC · ACHS" },
  F: { name: "Leading with Data",          desc: "Dashboard design · Board-ready charts" },
  G: { name: "Population & Equity",        desc: "Stratification · Equity data interpretation" },
  H: { name: "Communicating Data",         desc: "Chart choice by audience · Data storytelling" },
};

export function renderMap({
  library, answers, completedIds, badges,
  onPlayNext, onFocusModule, onCaseFile, onReset,
}) {
  const totalDone  = completedIds.length;
  const totalCount = library.length;
  const pct        = totalCount > 0 ? Math.round(totalDone / totalCount * 100) : 0;

  const root = h("div", {});

  // ── Header card ──────────────────────────────────────────
  const header = h("section", { class: "card" },
    h("p", { class: "eyebrow" }, "Your progress"),
    h("h2", {}, "Quality Quest Map"),
    h("div", { class: "map-header-row" },
      h("div", { class: "mastery-ring", style: { "--pct": pct } },
        h("span", {}, `${pct}%`)),
      h("div", {},
        h("p", { style: { margin: 0, fontWeight: 600 } },
          `${totalDone} of ${totalCount} scenarios complete`),
        h("p", { style: { margin: 0, color: "var(--ink-500)", fontSize: "var(--fs-sm)" } },
          `${badges.length} badge${badges.length !== 1 ? "s" : ""} earned`),
      ),
    ),
    h("div", { class: "map-header-actions" },
      h("button", { class: "btn btn-primary", onclick: onPlayNext },
        totalDone === 0 ? "Start — recommended path" : "Continue recommended path"),
      totalDone > 0
        ? h("button", { class: "btn btn-secondary", onclick: onCaseFile }, "Case File")
        : null,
      h("button", { class: "btn btn-ghost", onclick: onReset }, "Reset"),
    ),
  );
  root.append(header);

  // ── Module grid ───────────────────────────────────────────
  root.append(h("p", {
    class: "eyebrow",
    style: { marginTop: "var(--sp-5)", marginBottom: "var(--sp-3)" },
  }, "Module map — focus on any area"));

  const grid = h("div", { class: "module-grid", role: "list" });

  for (const modId of MODULE_ORDER) {
    const meta        = MODULE_META[modId];
    const modScens    = library.filter(s => s.module === modId);
    const modDone     = modScens.filter(s => completedIds.includes(s.id)).length;
    const modTotal    = modScens.length;
    const modPct      = modTotal > 0 ? Math.round(modDone / modTotal * 100) : 0;
    const isComplete  = modTotal > 0 && modDone === modTotal;
    const hasFailed   = modScens.some(s => {
      const a = answers[s.id];
      return a && a.attempts > 0 && !completedIds.includes(s.id);
    });
    const hasStarted  = modDone > 0 || hasFailed;

    const cardClass = "module-card"
      + (isComplete ? " is-complete" : "")
      + (hasFailed  ? " has-failed"  : "");

    const card = h("div", { class: cardClass, role: "listitem" });

    // Module letter badge
    card.append(h("div", {
      class: "module-letter",
      "aria-hidden": "true",
    }, modId));

    // Body
    const body = h("div", { class: "module-card-body" });
    body.append(h("div", { class: "module-card-name" }, meta.name));
    body.append(h("div", { class: "module-card-desc" }, meta.desc));

    // Progress bar + count
    if (modTotal > 0) {
      const pRow = h("div", { class: "module-progress" });
      pRow.append(
        h("div", { class: "module-progress-track",
          role: "progressbar",
          "aria-valuenow": modDone,
          "aria-valuemin": 0,
          "aria-valuemax": modTotal,
          "aria-label": `${meta.name} progress`,
        },
          h("div", { class: "module-progress-fill", style: { width: `${modPct}%` } })
        ),
        h("span", { class: "module-progress-label" }, `${modDone}/${modTotal}`),
      );
      body.append(pRow);
    }

    // "Needs review" chip — shows when there are failed but not-yet-completed scenarios
    if (hasFailed && !isComplete) {
      body.append(h("span", { class: "module-retry-badge", "aria-label": "Has scenarios to retry" },
        "↩ Needs review"));
    }

    card.append(body);

    // Focus button (spans both columns on small screen)
    if (modTotal > 0) {
      const btnLabel = isComplete ? "Revisit" : hasStarted ? "Continue" : "Start";
      card.append(h("button", {
        class: "btn btn-secondary module-focus-btn",
        onclick: () => onFocusModule(modId),
        "aria-label": `${btnLabel} Module ${modId}: ${meta.name}`,
      }, btnLabel));
    } else {
      card.append(h("span", { class: "module-coming-soon" }, "Coming soon"));
    }

    grid.append(card);
  }

  root.append(grid);
  return root;
}
