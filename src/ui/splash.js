import { h } from "./dom.js";

export function renderSplash({ onStart, onContinue, hasProfile }) {
  return h("section", { class: "card", "aria-label": "Welcome to Quality Quest" },
    h("p", { class: "eyebrow" }, "Quality Quest"),
    h("h1", {}, "Use data. Improve care. Level up."),
    h("p", {},
      "A short, offline-capable learning game for healthcare quality and patient safety professionals — built around the use of data for improvement."),
    h("p", {},
      "Tell us a little about your work and we’ll set up your first few scenarios. No login. No data leaves this device."),
    h("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" } },
      hasProfile
        ? h("button", { class: "btn btn-primary", onclick: onContinue }, "Continue")
        : h("button", { class: "btn btn-primary", onclick: onStart }, "Start"),
      h("a", { class: "btn btn-secondary", href: "#about" }, "About")),
    h("p", { class: "eyebrow", style: { marginTop: "24px" } }, "What you’ll learn"),
    h("ul", { style: { paddingLeft: "18px", marginTop: "8px" } },
      h("li", {}, "Read a run chart. Tell signal from noise."),
      h("li", {}, "Pick the right family of measures for an aim."),
      h("li", {}, "Choose the right chart type for your data."),
      h("li", {}, "Classify safety events. Read a safety-culture survey."),
      h("li", {}, "Lead with data: spot common dashboard mistakes."),
      h("li", {}, "Stratify for equity when it changes the story.")),
  );
}
