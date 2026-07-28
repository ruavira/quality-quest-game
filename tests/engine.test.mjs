import test from "node:test";
import assert from "node:assert/strict";
import { countItemTypeCoverage, recommendNext } from "../src/engine.js";
import { localizeValue, unresolvedTokens } from "../src/terminology.js";

const library = [
  { id: "a", module: "A", tier: 1, itemType: "MCQ", competency_tags: ["signal"] },
  { id: "b", module: "A", tier: 1, itemType: "HOT", competency_tags: ["signal"] },
  { id: "c", module: "A", tier: 2, itemType: "DEFEND", competency_tags: ["signal"] },
];

function fakeState({ completed = [], wrong = 0 } = {}) {
  return { progress: { completedScenarioIds: completed, answers: {}, competency: { signal: { streakWrong: wrong } } } };
}

test("two misses select a different same-competency example", () => {
  const result = recommendNext(library[1], false, library, fakeState({ wrong: 2 }));
  assert.equal(result.action, "remediate");
  assert.equal(result.next.id, "a");
});

test("coverage across two item types promotes", () => {
  const state = fakeState({ completed: ["a", "b"] });
  assert.equal(countItemTypeCoverage("A", 1, library, state), 2);
  const result = recommendNext(library[1], true, library, state);
  assert.equal(result.action, "promote");
  assert.equal(result.next.id, "c");
});

test("terminology is applied recursively", () => {
  const value = { brief: "Send {{board}} to {{exec}} at {{board_meeting}}.", task: ["{{region}}"] };
  const localized = localizeValue(value, { setting: "moh_office" });
  assert.equal(localized.brief, "Send directorate brief to Medical Director at directorate review.");
  assert.deepEqual(unresolvedTokens(localized), []);
});

