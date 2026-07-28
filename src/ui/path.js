import { h } from "./dom.js";

export function renderPathSummary({ profile, library, completedIds, badges, onPlayNext, onCaseFile, onReset }) {
  const completed = library.filter(s => completedIds.includes(s.id));
  const pct = library.length > 0 ? Math.round(completed.length / library.length * 100) : 0;

  const summary = h("section", { class: "card" },
    h("p", { class: "eyebrow" }, "Your progress"),
    h("h2", {}, "Your Quality Quest path"),
    h("div", { style: { display: "flex", gap: "24px", alignItems: "center", margin: "12px 0" } },
      h("div", { class: "mastery-ring", style: { "--pct": pct } }, h("span", {}, `${pct}%`)),
      h("div", {},
        h("p", { style: { margin: 0, fontWeight: 600 } }, `${completed.length} of ${library.length} scenarios completed`),
        h("p", { style: { margin: 0, color: "var(--ink-500)" } }, `${badges.length} badge${badges.length === 1 ? "" : "s"} earned`),
      ),
    ),
    h("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" } },
      h("button", { class: "btn btn-primary", onclick: onPlayNext }, completed.length === 0 ? "Start playing" : "Continue"),
      completed.length > 0 ? h("button", { class: "btn btn-secondary", onclick: onCaseFile }, "View Case File") : null,
      h("button", { class: "btn btn-ghost", onclick: onReset }, "Reset progress"),
    ),
  );
  return summary;
}
