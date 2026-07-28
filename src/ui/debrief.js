import { h } from "./dom.js";
import { localizeValue } from "../terminology.js";
import { textToHtml } from "./scenario.js";

export function renderDebrief({ scenario, profile, result, recommendation, onNext, onReflect, isLast }) {
  scenario = localizeValue(scenario, profile);
  const correct = result.correct;

  // WRITE scenario: derive a header that names the rubric score
  let heading = correct ? "Correct" : "Not quite";
  if (scenario.itemType === "WRITE" && result.rubricMax != null) {
    heading = `${result.rubricScore} / ${result.rubricMax} criteria — ${correct ? "Passed" : "Needs more work"}`;
  }

  const block = h("div", { class: "debrief-block " + (correct ? "is-correct" : "is-incorrect") },
    h("h3", {}, heading),
    h("div", {
      class: "debrief-copy",
      html: textToHtml(scenario.debrief?.[correct ? "correct" : "wrong"] || "", profile),
    }),
  );
  if (scenario.debrief?.rule_cited) {
    block.append(h("p", { style: { fontWeight: 600 } }, "Rule applied: ", scenario.debrief.rule_cited));
  }
  if (scenario.debrief?.citations) {
    block.append(h("p", { class: "citation" },
      "Sources: " + scenario.debrief.citations.join(" · ")));
  }
  if (recommendation?.action === "remediate") {
    block.append(h("p", { class: "pacing-note" },
      "Next, you’ll see a different example of this skill so you can practise the idea without repeating the same exercise."));
  } else if (recommendation?.action === "promote") {
    block.append(h("p", { class: "pacing-note" },
      "You’ve demonstrated this tier across more than one question type. The next example steps up the challenge."));
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
