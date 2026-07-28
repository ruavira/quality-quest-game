// Scenario player — handles all MVP item types.

import { h, clear } from "./dom.js";
import { renderChart } from "../charts.js";
import { localizeValue } from "../terminology.js";

export function renderScenario({ scenario, profile, pathIndex, pathLength, onAnswer }) {
  scenario = localizeValue(scenario, profile);
  const root = h("section", { class: "card" });
  const tierLabel = scenario.tier === 1 ? "Apprentice" : scenario.tier === 2 ? "Practitioner" : "Architect";

  // Progress strip
  const strip = h("div", { class: "progress-strip", "aria-label": "Path progress" });
  for (let i = 0; i < pathLength; i++) {
    strip.append(h("div", {
      class: "progress-step" + (i < pathIndex ? " is-done" : i === pathIndex ? " is-current" : "")
    }));
  }
  root.append(strip);

  root.append(h("p", { class: "eyebrow" },
    `Scenario ${pathIndex + 1} of ${pathLength} · Module ${scenario.module} · ${tierLabel}`));
  root.append(h("h2", {}, swapGlossary(scenario.title || "Scenario", profile)));
  root.append(h("div", { class: "scenario-brief", html: textToHtml(scenario.brief, profile) }));

  // Exhibit
  if (scenario.exhibit) {
    const exhibitWrap = h("div", { class: "exhibit" });
    if (scenario.exhibit.title) {
      exhibitWrap.append(h("div", { class: "exhibit-title" }, scenario.exhibit.title));
    }
    renderChart(exhibitWrap, scenario.exhibit);
    root.append(exhibitWrap);
  }

  // Task UI dispatched by item type
  const taskWrap = h("div", { class: "task" });
  let collectAnswer;
  switch (scenario.itemType) {
    case "MCQ":    collectAnswer = mcq(taskWrap, scenario); break;
    case "HOT":    collectAnswer = hotspot(taskWrap, scenario, root); break;
    case "MATCH":  collectAnswer = matchPairs(taskWrap, scenario); break;
    case "ORDER":  collectAnswer = ordering(taskWrap, scenario); break;
    case "BUILD":  collectAnswer = buildOpDef(taskWrap, scenario); break;
    case "WRITE":  collectAnswer = write(taskWrap, scenario); break;
    case "DEFEND": collectAnswer = defend(taskWrap, scenario); break;
    case "BRANCH": collectAnswer = branching(taskWrap, scenario); break;
    default:       collectAnswer = () => ({ correct: false });
  }
  root.append(taskWrap);

  const submit = h("button", {
    class: "btn btn-primary", style: { marginTop: "12px" },
    onclick: () => {
      const result = collectAnswer();
      if (result === null) return;        // not ready (e.g., no choice made)
      onAnswer(result);
    },
  }, "Submit");
  root.append(submit);
  return root;
}

// ---- MCQ ----

function mcq(wrap, scenario) {
  const stem = scenario.task?.stem || "Pick the best answer.";
  wrap.append(h("p", { style: { fontWeight: 600 } }, stem));
  const list = h("div", { class: "choice-list" });
  let selectedIdx = -1;
  scenario.task.options.forEach((opt, i) => {
    const id = `mcq-${scenario.id}-${i}`;
    const label = h("label", { class: "choice" },
      h("input", {
        type: "radio", name: `mcq-${scenario.id}`, id, value: String(i),
        onchange: () => {
          selectedIdx = i;
          list.querySelectorAll(".choice").forEach((el, k) =>
            el.classList.toggle("is-selected", k === i));
        }
      }),
      h("div", { class: "choice-body" },
        h("div", { class: "choice-title" }, opt.label),
        opt.desc ? h("div", { class: "choice-desc" }, opt.desc) : null),
    );
    list.append(label);
  });
  wrap.append(list);
  return () => {
    if (selectedIdx < 0) return null;
    const correctIdx = scenario.answer?.correctIndex;
    return { correct: selectedIdx === correctIdx, choice: selectedIdx };
  };
}

// ---- HOT (hotspot — pick the signal on a chart) ----

function hotspot(wrap, scenario, root) {
  wrap.append(h("p", { style: { fontWeight: 600 } }, scenario.task?.stem || "Click the point where the signal occurs."));
  // The chart is already rendered in `exhibit`. Wire its onSelect.
  // We need a handle to the chart's return value. We attach an event delegation on document.
  let selectedIndices = [];
  // After chart renders, hook into chart-wrap data-points by event delegation:
  setTimeout(() => {
    const cw = root.querySelector(".exhibit .chart-wrap");
    if (!cw) return;
    cw.addEventListener("click", (e) => {
      const pt = e.target.closest("[data-point]");
      if (!pt) return;
      const idx = Number(pt.getAttribute("data-point"));
      if (selectedIndices.includes(idx)) {
        selectedIndices = selectedIndices.filter(x => x !== idx);
        pt.setAttribute("data-selected", "false");
        pt.setAttribute("fill", "var(--series-1)");
        pt.setAttribute("r", "5");
      } else {
        selectedIndices.push(idx);
        pt.setAttribute("data-selected", "true");
        pt.setAttribute("fill", "var(--brand-600)");
        pt.setAttribute("r", "7");
      }
    });
    cw.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const pt = document.activeElement?.closest("[data-point]");
      if (pt && cw.contains(pt)) {
        e.preventDefault();
        pt.click();
      }
    });
  }, 0);

  return () => {
    const expected = scenario.answer?.indices || [];
    const ok = expected.length === selectedIndices.length &&
               expected.every(i => selectedIndices.includes(i));
    return { correct: ok, indices: selectedIndices };
  };
}

// ---- MATCH ----

function matchPairs(wrap, scenario) {
  wrap.append(h("p", { style: { fontWeight: 600 } }, scenario.task?.stem || "Match each item to a category."));
  const items = scenario.task.items || [];          // [{ id, label }]
  const categories = scenario.task.categories || []; // [{ id, label }]
  const assignments = {};                            // itemId → categoryId

  const list = h("div", { style: { display: "grid", gap: "10px" } });
  for (const it of items) {
    const row = h("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "8px", alignItems: "center" } },
      h("div", {}, it.label),
      h("select", {
        "aria-label": `Category for ${it.label}`,
        onchange: (e) => assignments[it.id] = e.target.value,
        style: { padding: "8px", borderRadius: "6px", border: "1px solid var(--ink-100)", minHeight: "44px" }
      },
        h("option", { value: "" }, "— pick category —"),
        ...categories.map(c => h("option", { value: c.id }, c.label))),
    );
    list.append(row);
  }
  wrap.append(list);
  return () => {
    if (Object.keys(assignments).length < items.length) return null;
    const expected = scenario.answer?.pairs || {};   // itemId → categoryId
    const correct = items.every(it => assignments[it.id] === expected[it.id]);
    return { correct, assignments };
  };
}

// ---- ORDER ----

function ordering(wrap, scenario) {
  wrap.append(h("p", { style: { fontWeight: 600 } }, scenario.task?.stem || "Put these steps in order."));
  const steps = (scenario.task.steps || []).slice();   // [{ id, label }]
  const order = steps.map(s => s.id);                  // current order
  const list = h("ol", { "aria-live": "polite", style: { listStyle: "none", padding: 0, margin: 0 } });

  function rerender() {
    clear(list);
    order.forEach((id, idx) => {
      const step = steps.find(s => s.id === id);
      const li = h("li", {
        style: { display: "flex", gap: "8px", alignItems: "center",
                 background: "var(--paper-0)", border: "1px solid var(--ink-100)",
                 borderRadius: "8px", padding: "10px", marginBottom: "6px" }
      },
        h("span", { style: { fontWeight: 700, color: "var(--brand-600)" } }, String(idx + 1)),
        h("div", { style: { flex: "1 1 auto" } }, step.label),
        h("div", { style: { display: "flex", gap: "4px" } },
          h("button", {
            class: "btn btn-secondary", style: { minHeight: "36px", padding: "4px 10px" },
            disabled: idx === 0,
            "aria-label": `Move ${step.label} up`,
            onclick: () => { [order[idx], order[idx-1]] = [order[idx-1], order[idx]]; rerender(); }
          }, "↑"),
          h("button", {
            class: "btn btn-secondary", style: { minHeight: "36px", padding: "4px 10px" },
            disabled: idx === order.length - 1,
            "aria-label": `Move ${step.label} down`,
            onclick: () => { [order[idx], order[idx+1]] = [order[idx+1], order[idx]]; rerender(); }
          }, "↓"),
        ),
      );
      list.append(li);
    });
  }
  rerender();
  wrap.append(list);
  return () => {
    const expected = scenario.answer?.order || [];
    const correct = expected.length === order.length && expected.every((v, i) => v === order[i]);
    return { correct, order };
  };
}

// ---- BUILD dispatcher ----

function buildOpDef(wrap, scenario) {
  if (scenario.task?.buildType === "chart_abstraction") {
    return buildChartAbstraction(wrap, scenario);
  }
  // Default: operational definition constructor
  wrap.append(h("p", { style: { fontWeight: 600 } }, scenario.task?.stem || "Build an operational definition by filling in each component."));
  const fields = scenario.task.fields || [
    { id: "numerator", label: "Numerator" },
    { id: "denominator", label: "Denominator" },
    { id: "inclusions", label: "Inclusions" },
    { id: "exclusions", label: "Exclusions" },
    { id: "data_source", label: "Data source" },
    { id: "measurement_window", label: "Measurement window" },
  ];
  const values = {};
  for (const f of fields) {
    const row = h("div", { style: { marginBottom: "10px" } });
    row.append(h("label", { for: `bf-${f.id}`, style: { fontWeight: 600, display: "block", marginBottom: "4px" } }, f.label));
    if (f.options) {
      // Constrained: choose from options
      const sel = h("select", {
        id: `bf-${f.id}`,
        onchange: (e) => values[f.id] = e.target.value,
        style: { padding: "10px", borderRadius: "6px", border: "1px solid var(--ink-100)", minHeight: "44px", width: "100%" }
      }, h("option", { value: "" }, "— pick —"),
         ...f.options.map(o => h("option", { value: o.value }, o.label)));
      row.append(sel);
    } else {
      const inp = h("input", {
        id: `bf-${f.id}`, type: "text",
        onchange: (e) => values[f.id] = e.target.value.trim(),
        oninput:  (e) => values[f.id] = e.target.value.trim(),
        placeholder: f.placeholder || "",
        style: { padding: "10px", borderRadius: "6px", border: "1px solid var(--ink-100)", minHeight: "44px", width: "100%" }
      });
      row.append(inp);
    }
    wrap.append(row);
  }
  return () => {
    const expected = scenario.answer?.fields || {};
    // For constructor, compare exact matches on constrained selects + keyword match on free text.
    let correct = true;
    for (const f of fields) {
      const want = expected[f.id];
      const got = values[f.id] || "";
      if (!want) continue;
      if (f.options) {
        if (got !== want) correct = false;
      } else {
        const keywords = (want.keywords || []).map(k => k.toLowerCase());
        const hay = got.toLowerCase();
        if (!keywords.every(k => hay.includes(k))) correct = false;
      }
    }
    if (Object.values(values).filter(v => v).length < fields.length) return null;
    return { correct, values };
  };
}

// ---- BUILD — chart abstraction ----

function buildChartAbstraction(wrap, scenario) {
  const record = scenario.task.record;

  // Patient record display
  if (record) {
    const recCard = h("div", { class: "chart-record" });
    recCard.append(h("div", { class: "chart-record-header" }, record.title || "Patient Record"));
    const sections = record.sections || [];
    for (const sec of sections) {
      if (sec.heading) {
        recCard.append(h("div", { class: "chart-record-section-heading" }, sec.heading));
      }
      const table = h("table", {
        class: "chart-record-table",
        "aria-label": sec.heading || record.title || "Patient record"
      });
      const tbody = h("tbody");
      (sec.rows || []).forEach(row => {
        const isMissing = row.value === "NOT RECORDED" || row.value === "—" || row.value === "Missing";
        tbody.append(h("tr", {},
          h("th", { scope: "row" }, row.label),
          h("td", { class: isMissing ? "chart-record-missing" : "" }, row.value)
        ));
      });
      table.append(tbody);
      recCard.append(table);
    }
    wrap.append(recCard);
  }

  // Abstraction form
  wrap.append(h("p", { class: "chart-abs-instruction" },
    scenario.task?.stem || "Complete the abstraction form using the patient record above."));

  const values = {};
  const fields = scenario.task.fields || [];
  for (const f of fields) {
    const row = h("div", { class: "chart-abs-field" });
    row.append(h("label", { for: `cabs-${f.id}`, class: "chart-abs-label" }, f.label));
    const sel = h("select", {
      id: `cabs-${f.id}`,
      "aria-label": f.label,
      onchange: (e) => { values[f.id] = e.target.value; },
      class: "chart-abs-select"
    },
      h("option", { value: "" }, "— select —"),
      ...(f.options || []).map(o => h("option", { value: o.value }, o.label))
    );
    row.append(sel);
    wrap.append(row);
  }

  return () => {
    if (fields.some(f => !values[f.id])) return null;
    const expected = scenario.answer?.fields || {};
    const correct = fields.every(f => values[f.id] === expected[f.id]);
    return { correct, values };
  };
}

// ---- WRITE (freeform + self-scored rubric, two stages) ----

function write(wrap, scenario) {
  let stage = 1;
  let userText = "";
  const checks = {};

  function render() {
    clear(wrap);
    if (stage === 1) {
      // Context block (measure description, setting)
      if (scenario.task?.context) {
        const ctx = h("div", { class: "write-context" });
        ctx.innerHTML = scenario.task.context
          .split(/\n{1,}/).map(line =>
            `<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`
          ).join("");
        wrap.append(ctx);
      }
      wrap.append(h("p", { class: "write-stem" }, scenario.task?.stem || "Write your operational definition below."));
      const ta = h("textarea", {
        class: "write-textarea",
        "aria-label": "Your operational definition",
        placeholder: scenario.task?.placeholder || "Write your definition here…",
        rows: 10,
        oninput: (e) => { userText = e.target.value; },
      });
      ta.value = userText;
      wrap.append(ta);
      wrap.append(h("p", { class: "write-hint" },
        "When you have finished writing, click below to reveal the scoring rubric."));
      wrap.append(h("button", {
        class: "btn btn-secondary",
        style: { marginTop: "var(--sp-2)" },
        onclick: () => {
          if (userText.trim().length < 10) return;
          stage = 2;
          render();
        },
      }, "Reveal rubric →"));
    } else {
      // Stage 2: show submission + rubric checkboxes
      wrap.append(h("div", { class: "write-submission" },
        h("p", { class: "eyebrow", style: { marginBottom: "var(--sp-2)" } }, "Your definition"),
        h("div", { class: "write-user-text" }, userText),
      ));
      wrap.append(h("p", { class: "write-stem", style: { marginTop: "var(--sp-4)" } },
        "Check each criterion you included:"));
      const rubric = scenario.answer?.rubric || [];
      const passing = scenario.answer?.passingScore ?? Math.ceil(rubric.length * 5 / 6);
      const list = h("div", { class: "write-rubric", role: "group", "aria-label": "Self-scoring rubric" });
      rubric.forEach((crit, i) => {
        const id = `wr-${scenario.id}-${i}`;
        const item = h("div", { class: "write-rubric-item" });
        const cb = h("input", {
          type: "checkbox", id,
          checked: !!checks[i],
          onchange: (e) => { checks[i] = e.target.checked; },
        });
        const lbl = h("label", { for: id },
          h("span", { class: "write-rubric-label" }, crit.label),
          crit.hint ? h("span", { class: "write-rubric-hint" }, crit.hint) : null,
        );
        item.append(cb, lbl);
        list.append(item);
      });
      wrap.append(list);
      wrap.append(h("p", { class: "write-pass-note" },
        `Pass mark: ${passing} of ${rubric.length} criteria. Click Submit to record your score.`));
    }
  }
  render();

  return () => {
    if (stage !== 2) return null;
    const rubric = scenario.answer?.rubric || [];
    const passing = scenario.answer?.passingScore ?? Math.ceil(rubric.length * 5 / 6);
    const score = rubric.reduce((n, _, i) => n + (checks[i] ? 1 : 0), 0);
    return { correct: score >= passing, rubricScore: score, rubricMax: rubric.length, text: userText };
  };
}

// ---- DEFEND (two-stage: answer + reason) ----

function defend(wrap, scenario) {
  wrap.append(h("p", { style: { fontWeight: 600 } }, scenario.task?.stem || "Pick the best answer, then say why."));
  let stage = 1;
  let chosen = -1;
  let reason = -1;

  function render() {
    clear(wrap);
    wrap.append(h("p", { style: { fontWeight: 600 } }, stage === 1 ? scenario.task.stem : scenario.task.reasonStem));
    const opts = stage === 1 ? scenario.task.options : scenario.task.reasons;
    const list = h("div", { class: "choice-list" });
    opts.forEach((opt, i) => {
      list.append(h("label", { class: "choice" },
        h("input", {
          type: "radio", name: `defend-${scenario.id}-${stage}`, value: String(i),
          onchange: () => {
            if (stage === 1) chosen = i; else reason = i;
            list.querySelectorAll(".choice").forEach((el, k) => el.classList.toggle("is-selected", k === i));
          }
        }),
        h("div", { class: "choice-body" }, h("div", { class: "choice-title" }, opt.label))));
    });
    wrap.append(list);
    if (stage === 1) {
      wrap.append(h("button", {
        class: "btn btn-secondary", style: { marginTop: "8px" },
        onclick: () => { if (chosen >= 0) { stage = 2; render(); } }
      }, "Next: why?"));
    }
  }
  render();
  return () => {
    if (stage !== 2 || reason < 0) return null;
    const correctAns = scenario.answer.correctIndex === chosen;
    const correctReason = scenario.answer.correctReasonIndex === reason;
    return { correct: correctAns && correctReason, choice: chosen, reason };
  };
}

// ---- BRANCH (multi-step) ----

function branching(wrap, scenario) {
  const branches = scenario.task.branches || [];   // [{ stem, options:[{label, correct}] }]
  let step = 0;
  let trail = [];

  function render() {
    clear(wrap);
    const b = branches[step];
    wrap.append(h("p", { class: "eyebrow" }, `Branch ${step + 1} of ${branches.length}`));
    wrap.append(h("p", { style: { fontWeight: 600 } }, b.stem));
    const list = h("div", { class: "choice-list" });
    b.options.forEach((opt, i) => {
      list.append(h("button", {
        class: "choice", style: { textAlign: "left", cursor: "pointer", background: "var(--paper-0)" },
        onclick: () => {
          trail.push({ step, choice: i, correct: !!opt.correct });
          if (step < branches.length - 1) { step += 1; render(); } else { render(); }
        }
      }, h("div", { class: "choice-body" }, h("div", { class: "choice-title" }, opt.label))));
    });
    wrap.append(list);
    if (trail.length === branches.length) {
      wrap.append(h("p", { style: { marginTop: "12px", fontWeight: 600 } },
        `You made it through. Submit to see the debrief.`));
    }
  }
  render();
  return () => {
    if (trail.length < branches.length) return null;
    const correct = trail.every(t => t.correct);
    return { correct, trail };
  };
}

// ---- helpers ----

export function textToHtml(text, profile) {
  if (!text) return "";
  const swapped = swapGlossary(text, profile);
  // Lightweight markdown: paragraphs, **bold**, _italic_
  return swapped
    .split(/\n{2,}/).map(p => `<p>${p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/_(.+?)_/g, "<em>$1</em>")}</p>`).join("");
}

function swapGlossary(text, profile) { return localizeValue(text, profile); }
