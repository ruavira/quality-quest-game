import { h } from "./dom.js";

export function renderDebrief({ scenario, result, onNext, onReflect, isLast }) {
  const correct = result.correct;

  // WRITE scenario: derive a header that names the rubric score
  let heading = correct ? "Correct" : "Not quite";
  if (scenario.itemType === "WRITE" && result.rubricMax != null) {
    heading = `${result.rubricScore} / ${result.rubricMax} criteria — ${correct ? "Passed" : "Needs more work"}`;
  }

  const block = h("div", { class: "debrief-block " + (correct ? "is-correct" : "is-incorrect") },
    h("h3", {}, heading),
    h("p", { html: scenario.debrief?.[correct ? "correct" : "wrong"] || "" }),
  );
  if (scenario.debrief?.rule_cited) {
    block.append(h("p", { style: { fontWeight: 600 } }, "Rule applied: ", scenario.debrief.rule_cited));
  }
  if (scenario.debrief?.citations) {
    block.append(h("p", { class: "citation" },
      "Sources: " + scenario.debrief.citations.join(" · ")));
  }

  // Optional 1-sentence reflection (Reflective Practitioner badge target)
  let reflection = "";
  const refl = h("div", { style: { marginTop: "12px" } },
    h("label", { for: "refl", style: { fontWeight: 600 } }, "One sentence: what will you try at work this week?"),
    h("textarea", {
      id: "refl", rows: "2",
      style: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--ink-100)", marginTop: "4px" },
      placeholder: "Optional. Stored only on this device.",
      oninput: (e) => { reflection = e.target.value; }
    }),
  );
  block.append(refl);

  const root = h("section", { class: "card" });
  root.append(h("h2", {}, scenario.title));
  root.append(block);
  root.append(h("div", { style: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" } },
    h("button", {
      class: "btn btn-primary",
      onclick: () => {
        if (reflection.trim().length >= 5) onReflect(reflection.trim());
        onNext();
      }
    }, isLast ? "Finish — see your Case File" : "Next scenario"),
  ));
  return root;
}
