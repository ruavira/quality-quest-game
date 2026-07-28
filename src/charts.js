// Quality Quest — SVG chart renderers with keyboard + screen-reader accessibility.
//
// Every chart exposes:
//   render(container, spec) → { focusable, describe(), onSelect(handler) }
// Visual SVG + linearised <table> are both rendered (table hidden by default,
// togglable with the "Show data table" control on the exhibit).

const NS = "http://www.w3.org/2000/svg";

function el(tag, attrs = {}, ...children) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  for (const c of children) if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return n;
}

function htmlEl(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v != null) n.setAttribute(k, v);
  }
  for (const c of children) if (c != null) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
}

// ---- Public dispatcher ----

export function renderChart(container, spec) {
  const chartType = spec.chartType || spec.kind;
  switch (chartType) {
    case "run":            return renderRunChart(container, spec);
    case "pChart":         return renderPChart(container, spec);
    case "iMR":            return renderIMR(container, spec);
    case "pareto":         return renderPareto(container, spec);
    case "fishbone":       return renderFishbone(container, spec);
    case "driverDiagram":  return renderDriverDiagram(container, spec);
    case "bar":            return renderBar(container, spec);
    case "table":          return renderTableOnly(container, spec);
    default:
      container.append(htmlEl("div", { class: "exhibit-empty" }, `(no exhibit for chartType "${chartType}")`));
      return { focusable: [], describe: () => "No chart.", onSelect: () => {} };
  }
}

// ---- Shared chart frame ----

function frame(container, { title, width = 640, height = 280 }) {
  const wrap = htmlEl("div", { class: "chart-wrap", "data-show-table": "false" });
  const svg = el("svg", {
    viewBox: `0 0 ${width} ${height}`,
    // Sizing handled by CSS (.chart-wrap svg { width:100%; height:auto }); an SVG
    // height="auto" attribute is invalid and logs a console error.
    role: "img",
    "aria-labelledby": "qq-chart-title",
  });
  svg.append(el("title", { id: "qq-chart-title" }, title || ""));
  wrap.append(svg);
  container.append(wrap);
  return { wrap, svg, width, height };
}

function attachControls(wrap, { onDescribe, onToggleTable }) {
  const controls = htmlEl("div", { class: "exhibit-controls" });
  const describeBtn = htmlEl("button", {
    class: "btn btn-ghost", type: "button",
    onclick: () => alert(onDescribe()),
    "aria-label": "Describe this chart",
  }, "Describe (D)");
  const tableBtn = htmlEl("button", {
    class: "btn btn-ghost", type: "button",
    onclick: () => {
      const shown = wrap.getAttribute("data-show-table") === "true";
      wrap.setAttribute("data-show-table", shown ? "false" : "true");
      tableBtn.textContent = shown ? "Show data table (T)" : "Hide data table (T)";
      if (onToggleTable) onToggleTable(!shown);
    },
  }, "Show data table (T)");
  controls.append(describeBtn, tableBtn);
  wrap.append(controls);
  // Keyboard shortcuts
  wrap.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, button")) return;
    if (e.key === "d" || e.key === "D") { e.preventDefault(); alert(onDescribe()); }
    if (e.key === "t" || e.key === "T") { e.preventDefault(); tableBtn.click(); }
  });
}

function makeTable(wrap, columns, rows) {
  const tbl = htmlEl("table", { class: "chart-table" });
  const thead = htmlEl("thead");
  const trh = htmlEl("tr");
  for (const c of columns) trh.append(htmlEl("th", { scope: "col" }, c));
  thead.append(trh);
  const tbody = htmlEl("tbody");
  for (const r of rows) {
    const tr = htmlEl("tr");
    for (let i = 0; i < r.length; i++) {
      const cell = (i === 0) ? htmlEl("th", { scope: "row" }, String(r[i])) : htmlEl("td", {}, String(r[i]));
      tr.append(cell);
    }
    tbody.append(tr);
  }
  tbl.append(thead, tbody);
  wrap.append(tbl);
  return tbl;
}

// ---- Run chart ----

function renderRunChart(container, spec) {
  const data = spec.data || [];          // [{ x, y }]
  const title = spec.title || "Run chart";
  const { wrap, svg, width, height } = frame(container, { title });

  const padL = 56, padR = 16, padT = 32, padB = 40;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const yMin = spec.yMin ?? Math.min(...ys) * 0.95;
  const yMax = spec.yMax ?? Math.max(...ys) * 1.05;
  const median = spec.median ?? quantile(ys, 0.5);
  const px = (i) => padL + (innerW * (data.length === 1 ? 0.5 : i / (data.length - 1)));
  const py = (v) => padT + innerH - (innerH * (v - yMin) / (yMax - yMin));

  // Y axis
  svg.append(el("line", { x1: padL, y1: padT, x2: padL, y2: padT + innerH, stroke: "var(--ink-300)" }));
  // X axis
  svg.append(el("line", { x1: padL, y1: padT + innerH, x2: padL + innerW, y2: padT + innerH, stroke: "var(--ink-300)" }));

  // Y labels (5 ticks)
  for (let t = 0; t <= 4; t++) {
    const v = yMin + (yMax - yMin) * (t / 4);
    const y = py(v);
    svg.append(el("line", { x1: padL - 4, y1: y, x2: padL, y2: y, stroke: "var(--ink-300)" }));
    svg.append(el("text", {
      x: padL - 8, y: y + 4, "text-anchor": "end",
      "font-size": 11, fill: "var(--ink-500)", "font-family": "sans-serif"
    }, fmtNum(v)));
  }

  // X labels
  data.forEach((d, i) => {
    if (i % Math.max(1, Math.floor(data.length / 8)) === 0 || i === data.length - 1) {
      svg.append(el("text", {
        x: px(i), y: padT + innerH + 16, "text-anchor": "middle",
        "font-size": 11, fill: "var(--ink-500)", "font-family": "sans-serif"
      }, String(d.x)));
    }
  });

  // Median line (the defining feature of a run chart — not a control limit)
  svg.append(el("line", {
    x1: padL, y1: py(median), x2: padL + innerW, y2: py(median),
    stroke: "var(--ink-500)", "stroke-dasharray": "4 4",
  }));
  svg.append(el("text", {
    x: padL + innerW + 4, y: py(median) + 4, "text-anchor": "start",
    "font-size": 11, fill: "var(--ink-500)",
  }, `Median ${fmtNum(median)}`));

  // Goal (annotation only, NOT shown as a control limit)
  if (spec.goal != null) {
    svg.append(el("line", {
      x1: padL, y1: py(spec.goal), x2: padL + innerW, y2: py(spec.goal),
      stroke: "var(--brand-600)", "stroke-dasharray": "2 6",
    }));
    svg.append(el("text", {
      x: padL + innerW + 4, y: py(spec.goal) + 4,
      "font-size": 11, fill: "var(--brand-600)",
    }, `Goal ${fmtNum(spec.goal)}`));
  }

  // Line + points
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(d.y)}`).join(" ");
  svg.append(el("path", { d: pathD, fill: "none", stroke: "var(--series-1)", "stroke-width": "2" }));

  const focusable = [];
  data.forEach((d, i) => {
    const point = el("circle", {
      cx: px(i), cy: py(d.y), r: 5,
      fill: "var(--series-1)",
      stroke: "var(--paper-0)", "stroke-width": "1.5",
      "data-point": String(i),
      "data-x": String(d.x), "data-y": String(d.y),
      tabindex: "0",
      role: "button",
      "aria-label": `Point ${i + 1} of ${data.length}: ${d.x}, value ${fmtNum(d.y)}`,
    });
    svg.append(point);
    focusable.push(point);
  });

  // Highlight any pre-flagged signal index range (visual only for non-HOT items)
  if (Array.isArray(spec.highlight)) {
    spec.highlight.forEach(i => {
      focusable[i]?.setAttribute("fill", "var(--warn-700)");
      focusable[i]?.setAttribute("r", "7");
    });
  }

  const describe = () => {
    return `${title}. ${data.length} data points. Median ${fmtNum(median)}. ` +
           `Values from ${fmtNum(Math.min(...ys))} to ${fmtNum(Math.max(...ys))}. ` +
           data.map(d => `${d.x}: ${fmtNum(d.y)}`).join("; ") + ".";
  };

  makeTable(wrap, [spec.xLabel || "Period", spec.yLabel || "Value"], data.map(d => [d.x, d.y]));

  // Keyboard arrow traversal
  let focusedIndex = -1;
  wrap.addEventListener("keydown", (e) => {
    if (!focusable.length) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusedIndex = Math.min(focusable.length - 1, focusedIndex + 1);
      focusable[focusedIndex].focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusedIndex = Math.max(0, focusedIndex - 1);
      focusable[focusedIndex].focus();
    }
  });

  attachControls(wrap, { onDescribe: describe });

  const handlers = [];
  for (const p of focusable) {
    p.addEventListener("click", () => handlers.forEach(h => h({ index: Number(p.getAttribute("data-point")) })));
    p.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handlers.forEach(h => h({ index: Number(p.getAttribute("data-point")) }));
      }
    });
  }

  return {
    focusable,
    describe,
    onSelect: (h) => handlers.push(h),
    markSelection: (indices) => {
      focusable.forEach((p, i) => {
        if (indices.includes(i)) {
          p.setAttribute("data-selected", "true");
          p.setAttribute("fill", "var(--brand-600)");
          p.setAttribute("r", "7");
        } else {
          p.setAttribute("data-selected", "false");
        }
      });
    },
  };
}

// ---- p-Chart (proportion control chart) ----

function renderPChart(container, spec) {
  const data = spec.data || [];      // [{ x, defective, total }]
  const title = spec.title || "p-chart";
  const { wrap, svg, width, height } = frame(container, { title });

  const proportions = data.map(d => d.total > 0 ? d.defective / d.total : 0);
  const totalDef = data.reduce((a, d) => a + d.defective, 0);
  const totalN   = data.reduce((a, d) => a + d.total, 0);
  const pbar = totalN > 0 ? totalDef / totalN : 0;
  // UCL/LCL vary with subgroup size (this is why it's a p-chart, not a generic line)
  const limits = data.map(d => {
    if (!d.total) return { ucl: pbar, lcl: pbar };
    const sd = Math.sqrt(pbar * (1 - pbar) / d.total);
    return {
      ucl: Math.min(1, pbar + 3 * sd),
      lcl: Math.max(0, pbar - 3 * sd),
    };
  });

  const padL = 56, padR = 64, padT = 32, padB = 40;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const yMax = Math.min(1, Math.max(...limits.map(l => l.ucl)) * 1.1, Math.max(...proportions) * 1.5);
  const yMin = 0;
  const px = (i) => padL + (innerW * (data.length === 1 ? 0.5 : i / (data.length - 1)));
  const py = (v) => padT + innerH - (innerH * (v - yMin) / (yMax - yMin));

  // Axes
  svg.append(el("line", { x1: padL, y1: padT, x2: padL, y2: padT + innerH, stroke: "var(--ink-300)" }));
  svg.append(el("line", { x1: padL, y1: padT + innerH, x2: padL + innerW, y2: padT + innerH, stroke: "var(--ink-300)" }));

  // Y ticks
  for (let t = 0; t <= 4; t++) {
    const v = yMin + (yMax - yMin) * (t / 4);
    svg.append(el("text", {
      x: padL - 8, y: py(v) + 4, "text-anchor": "end",
      "font-size": 11, fill: "var(--ink-500)",
    }, (v * 100).toFixed(0) + "%"));
  }

  // X labels
  data.forEach((d, i) => {
    svg.append(el("text", {
      x: px(i), y: padT + innerH + 16, "text-anchor": "middle",
      "font-size": 11, fill: "var(--ink-500)",
    }, String(d.x)));
  });

  // Centre line (p-bar)
  svg.append(el("line", {
    x1: padL, y1: py(pbar), x2: padL + innerW, y2: py(pbar),
    stroke: "var(--ink-500)",
  }));
  svg.append(el("text", { x: padL + innerW + 4, y: py(pbar) + 4, "font-size": 11, fill: "var(--ink-500)" }, `p̄ ${(pbar*100).toFixed(1)}%`));

  // UCL/LCL stepped lines (vary by subgroup size)
  for (let i = 0; i < data.length; i++) {
    const x1 = px(i) - (i > 0 ? (px(i) - px(i-1))/2 : 0);
    const x2 = px(i) + (i < data.length - 1 ? (px(i+1) - px(i))/2 : 0);
    svg.append(el("line", { x1, y1: py(limits[i].ucl), x2, y2: py(limits[i].ucl), stroke: "var(--danger-700)", "stroke-dasharray": "4 2" }));
    if (limits[i].lcl > 0) svg.append(el("line", { x1, y1: py(limits[i].lcl), x2, y2: py(limits[i].lcl), stroke: "var(--danger-700)", "stroke-dasharray": "4 2" }));
  }

  // Points & line
  const pathD = proportions.map((p, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(p)}`).join(" ");
  svg.append(el("path", { d: pathD, fill: "none", stroke: "var(--series-1)", "stroke-width": "2" }));
  const focusable = [];
  data.forEach((d, i) => {
    const isOutOfControl = proportions[i] > limits[i].ucl || proportions[i] < limits[i].lcl;
    const pt = el("circle", {
      cx: px(i), cy: py(proportions[i]), r: isOutOfControl ? 7 : 5,
      fill: isOutOfControl ? "var(--danger-700)" : "var(--series-1)",
      stroke: "var(--paper-0)", "stroke-width": "1.5",
      "data-point": String(i), tabindex: "0", role: "button",
      "aria-label": `Period ${d.x}, ${(proportions[i]*100).toFixed(1)}% (${d.defective}/${d.total})${isOutOfControl ? ", outside control limits" : ""}`,
    });
    svg.append(pt);
    focusable.push(pt);
  });

  const describe = () => `${title}. p-chart of proportions across ${data.length} subgroups. ` +
    `Centre line p̄ = ${(pbar*100).toFixed(2)}%. Subgroup-varying control limits. ` +
    data.map((d, i) => `${d.x}: ${d.defective}/${d.total} = ${(proportions[i]*100).toFixed(1)}%${proportions[i] > limits[i].ucl ? " (above UCL)" : proportions[i] < limits[i].lcl ? " (below LCL)" : ""}`).join("; ") + ".";

  makeTable(wrap, ["Period", "Defective", "Total", "Proportion", "UCL", "LCL"],
    data.map((d, i) => [d.x, d.defective, d.total, (proportions[i]*100).toFixed(1) + "%", (limits[i].ucl*100).toFixed(1) + "%", (limits[i].lcl*100).toFixed(1) + "%"]));

  attachControls(wrap, { onDescribe: describe });
  return { focusable, describe, onSelect: () => {} };
}

// ---- I-MR (Individuals, MR omitted at MVP — single-individual chart) ----

function renderIMR(container, spec) {
  const data = spec.data || [];
  const title = spec.title || "I-chart (individual values)";
  const { wrap, svg, width, height } = frame(container, { title });

  const ys = data.map(d => d.y);
  const mean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const mrs = ys.slice(1).map((y, i) => Math.abs(y - ys[i]));
  const mrBar = mrs.reduce((a, b) => a + b, 0) / mrs.length;
  // I-chart limits: mean ± 2.66 × MRbar  (d2 = 1.128 for n=2 moving range)
  const ucl = mean + 2.66 * mrBar;
  const lcl = mean - 2.66 * mrBar;

  const padL = 56, padR = 64, padT = 32, padB = 40;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const yMin = Math.min(lcl, Math.min(...ys)) * 0.95;
  const yMax = Math.max(ucl, Math.max(...ys)) * 1.05;
  const px = (i) => padL + (innerW * (data.length === 1 ? 0.5 : i / (data.length - 1)));
  const py = (v) => padT + innerH - (innerH * (v - yMin) / (yMax - yMin));

  svg.append(el("line", { x1: padL, y1: padT, x2: padL, y2: padT + innerH, stroke: "var(--ink-300)" }));
  svg.append(el("line", { x1: padL, y1: padT + innerH, x2: padL + innerW, y2: padT + innerH, stroke: "var(--ink-300)" }));

  for (let t = 0; t <= 4; t++) {
    const v = yMin + (yMax - yMin) * (t / 4);
    svg.append(el("text", { x: padL - 8, y: py(v) + 4, "text-anchor": "end", "font-size": 11, fill: "var(--ink-500)" }, fmtNum(v)));
  }
  data.forEach((d, i) => {
    svg.append(el("text", { x: px(i), y: padT + innerH + 16, "text-anchor": "middle", "font-size": 11, fill: "var(--ink-500)" }, String(d.x)));
  });

  svg.append(el("line", { x1: padL, y1: py(mean), x2: padL + innerW, y2: py(mean), stroke: "var(--ink-500)" }));
  svg.append(el("line", { x1: padL, y1: py(ucl), x2: padL + innerW, y2: py(ucl), stroke: "var(--danger-700)", "stroke-dasharray": "4 2" }));
  svg.append(el("line", { x1: padL, y1: py(lcl), x2: padL + innerW, y2: py(lcl), stroke: "var(--danger-700)", "stroke-dasharray": "4 2" }));
  svg.append(el("text", { x: padL + innerW + 4, y: py(mean) + 4, "font-size": 11, fill: "var(--ink-500)" }, `x̄ ${fmtNum(mean)}`));
  svg.append(el("text", { x: padL + innerW + 4, y: py(ucl) + 4, "font-size": 11, fill: "var(--danger-700)" }, `UCL ${fmtNum(ucl)}`));
  svg.append(el("text", { x: padL + innerW + 4, y: py(lcl) + 4, "font-size": 11, fill: "var(--danger-700)" }, `LCL ${fmtNum(lcl)}`));

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(d.y)}`).join(" ");
  svg.append(el("path", { d: pathD, fill: "none", stroke: "var(--series-1)", "stroke-width": "2" }));
  const focusable = [];
  data.forEach((d, i) => {
    const outOfControl = d.y > ucl || d.y < lcl;
    const pt = el("circle", {
      cx: px(i), cy: py(d.y), r: outOfControl ? 7 : 5,
      fill: outOfControl ? "var(--danger-700)" : "var(--series-1)",
      stroke: "var(--paper-0)", "stroke-width": "1.5",
      tabindex: "0", "data-point": String(i),
      "aria-label": `${d.x}: ${fmtNum(d.y)}${outOfControl ? " (out of control)" : ""}`,
    });
    svg.append(pt);
    focusable.push(pt);
  });

  const describe = () => `${title}. I-chart of individual values. Mean ${fmtNum(mean)}, UCL ${fmtNum(ucl)}, LCL ${fmtNum(lcl)}. ` +
    data.map(d => `${d.x}: ${fmtNum(d.y)}`).join("; ") + ".";

  makeTable(wrap, ["Period", "Value"], data.map(d => [d.x, fmtNum(d.y)]));
  attachControls(wrap, { onDescribe: describe });
  return { focusable, describe, onSelect: () => {} };
}

// ---- Pareto ----

function renderPareto(container, spec) {
  const items = (spec.items || []).slice().sort((a, b) => b.value - a.value);
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  let cum = 0;
  const withCum = items.map(it => { cum += it.value; return { ...it, cum, cumPct: cum / total }; });
  const title = spec.title || "Pareto chart";
  const { wrap, svg, width, height } = frame(container, { title });

  const padL = 48, padR = 56, padT = 32, padB = 64;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const barW = innerW / items.length * 0.7;
  const gap  = innerW / items.length * 0.3;
  const yMax = Math.max(...items.map(i => i.value)) * 1.15;
  const py = (v) => padT + innerH - (innerH * v / yMax);
  const py2 = (pct) => padT + innerH - (innerH * pct);

  svg.append(el("line", { x1: padL, y1: padT, x2: padL, y2: padT + innerH, stroke: "var(--ink-300)" }));
  svg.append(el("line", { x1: padL, y1: padT + innerH, x2: padL + innerW, y2: padT + innerH, stroke: "var(--ink-300)" }));

  const focusable = [];
  withCum.forEach((it, i) => {
    const x = padL + i * (barW + gap) + gap/2;
    const rect = el("rect", {
      x, y: py(it.value), width: barW, height: padT + innerH - py(it.value),
      fill: "var(--series-1)", stroke: "var(--ink-100)",
      tabindex: "0", "data-point": String(i),
      "aria-label": `${it.label}: ${it.value}, cumulative ${(it.cumPct * 100).toFixed(0)}%`,
    });
    svg.append(rect);
    focusable.push(rect);
    svg.append(el("text", {
      x: x + barW/2, y: padT + innerH + 16,
      "text-anchor": "middle", "font-size": 11, fill: "var(--ink-500)",
    }, ellipsis(it.label, 14)));
    svg.append(el("text", {
      x: x + barW/2, y: padT + innerH + 32,
      "text-anchor": "middle", "font-size": 11, fill: "var(--ink-500)",
    }, String(it.value)));
  });

  // Cumulative line
  const cumPath = withCum.map((it, i) => {
    const cx = padL + i * (barW + gap) + gap/2 + barW/2;
    return `${i === 0 ? "M" : "L"}${cx},${py2(it.cumPct)}`;
  }).join(" ");
  svg.append(el("path", { d: cumPath, fill: "none", stroke: "var(--series-2)", "stroke-width": "2", "stroke-dasharray": "0" }));
  withCum.forEach((it, i) => {
    const cx = padL + i * (barW + gap) + gap/2 + barW/2;
    svg.append(el("circle", { cx, cy: py2(it.cumPct), r: 4, fill: "var(--series-2)" }));
  });

  const describe = () => `${title}. Pareto of ${items.length} categories. ` +
    withCum.map(it => `${it.label}: ${it.value} (${(it.cumPct * 100).toFixed(0)}% cumulative)`).join("; ") + ".";

  makeTable(wrap, ["Category", "Count", "Cumulative %"], withCum.map(it => [it.label, it.value, (it.cumPct * 100).toFixed(0) + "%"]));
  attachControls(wrap, { onDescribe: describe });
  return { focusable, describe, onSelect: () => {} };
}

// ---- Bar (simple comparative) ----

function renderBar(container, spec) {
  const items = spec.items || [];
  const title = spec.title || "Bar chart";
  const { wrap, svg, width, height } = frame(container, { title });
  const padL = 48, padR = 24, padT = 32, padB = 60;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const yMax = Math.max(...items.map(i => i.value)) * 1.15;
  const py = (v) => padT + innerH - (innerH * v / yMax);

  svg.append(el("line", { x1: padL, y1: padT, x2: padL, y2: padT + innerH, stroke: "var(--ink-300)" }));
  svg.append(el("line", { x1: padL, y1: padT + innerH, x2: padL + innerW, y2: padT + innerH, stroke: "var(--ink-300)" }));

  const barW = innerW / items.length * 0.7;
  const gap = innerW / items.length * 0.3;
  const focusable = [];
  items.forEach((it, i) => {
    const x = padL + i * (barW + gap) + gap/2;
    const rect = el("rect", {
      x, y: py(it.value), width: barW, height: padT + innerH - py(it.value),
      fill: it.color || "var(--series-1)",
      tabindex: "0", role: "button",
      "aria-label": `${it.label}: ${it.value}`,
    });
    svg.append(rect);
    focusable.push(rect);
    svg.append(el("text", { x: x + barW/2, y: padT + innerH + 18, "text-anchor": "middle", "font-size": 11, fill: "var(--ink-500)" }, ellipsis(it.label, 16)));
    svg.append(el("text", { x: x + barW/2, y: py(it.value) - 6, "text-anchor": "middle", "font-size": 11, fill: "var(--ink-700)" }, String(it.value)));
  });

  const describe = () => `${title}. ${items.map(i => `${i.label}: ${i.value}`).join("; ")}.`;
  makeTable(wrap, ["Category", "Value"], items.map(i => [i.label, i.value]));
  attachControls(wrap, { onDescribe: describe });
  return { focusable, describe, onSelect: () => {} };
}

// ---- Fishbone (display-only at MVP) ----

function renderFishbone(container, spec) {
  const cats = spec.categories || [];
  const title = spec.title || "Fishbone (cause & effect) diagram";
  const wrap = htmlEl("div", { class: "chart-wrap", "data-show-table": "false" });
  const list = htmlEl("dl", { "aria-label": title, style: "margin: 0;" });
  for (const c of cats) {
    list.append(htmlEl("dt", { style: "font-weight:600; margin-top: 8px;" }, c.label));
    const dd = htmlEl("dd", { style: "margin: 0 0 0 16px;" });
    const ul = htmlEl("ul", { style: "margin: 0; padding-left: 16px;" });
    for (const cause of c.causes || []) ul.append(htmlEl("li", {}, cause));
    dd.append(ul);
    list.append(dd);
  }
  wrap.append(list);
  container.append(wrap);
  const describe = () => `${title}. Categories: ${cats.map(c => `${c.label} (${(c.causes||[]).join(", ")})`).join("; ")}.`;
  attachControls(wrap, { onDescribe: describe });
  return { focusable: [], describe, onSelect: () => {} };
}

// ---- Driver Diagram (display-only at MVP) ----

function renderDriverDiagram(container, spec) {
  const title = spec.title || "Driver diagram";
  const wrap = htmlEl("div", { class: "chart-wrap" });
  const aim = htmlEl("div", { class: "card-tight", style: "background:var(--brand-100); border-radius:8px; padding:12px; margin-bottom:12px;" },
    htmlEl("strong", {}, "Aim: "), spec.aim || "");
  wrap.append(aim);
  const grid = htmlEl("div", { style: "display:grid; grid-template-columns: 1fr 2fr; gap: 12px; align-items:start;" });
  for (const pd of spec.primaryDrivers || []) {
    const lhs = htmlEl("div", { style: "background:var(--paper-0); border:1px solid var(--ink-100); border-radius:8px; padding:8px; font-weight:600;" }, pd.label);
    const rhs = htmlEl("div", {});
    for (const ci of pd.changeIdeas || []) {
      rhs.append(htmlEl("div", { style: "background:var(--paper-50); border:1px solid var(--ink-100); border-radius:6px; padding:6px 10px; margin-bottom:6px;" }, ci));
    }
    grid.append(lhs, rhs);
  }
  wrap.append(grid);
  container.append(wrap);
  const describe = () => `${title}. Aim: ${spec.aim}. Drivers: ${(spec.primaryDrivers||[]).map(p => `${p.label} → [${(p.changeIdeas||[]).join("; ")}]`).join(". ")}.`;
  attachControls(wrap, { onDescribe: describe });
  return { focusable: [], describe, onSelect: () => {} };
}

// ---- Table-only exhibit ----

function renderTableOnly(container, spec) {
  const wrap = htmlEl("div", { class: "chart-wrap", "data-show-table": "true" });
  makeTable(wrap, spec.columns || [], spec.rows || []);
  container.append(wrap);
  const describe = () => `Data table titled ${spec.title || "data"}. Columns: ${(spec.columns||[]).join(", ")}.`;
  attachControls(wrap, { onDescribe: describe });
  return { focusable: [], describe, onSelect: () => {} };
}

// ---- Utils ----

function quantile(arr, q) {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
}

function fmtNum(v) {
  if (v >= 100 || v <= -100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

function ellipsis(s, n) {
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
