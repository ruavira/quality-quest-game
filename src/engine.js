// Quality Quest — path engine + scoring + adaptive logic (competency-based, not streak-based)

import { getState } from "./state.js";

// Module base weights — Module A (Reading the Data) and B (Using the Data) are the spine.
const BASE_WEIGHT = {
  A: 3.0, B: 3.0, C: 1.5, D: 1.2, E: 1.0, F: 1.5, G: 1.2, H: 1.0,
};

const ROLE_BIAS = {
  "qi_specialist":            { A: +1.0, B: +1.0, D: +0.8, F: +0.5 },
  "patient_safety_officer":   { C: +1.5, A: +0.5, D: +0.5 },
  "infection_preventionist":  { A: +0.5, C: +0.5, D: +0.5, G: +0.5 },
  "data_analyst":             { A: +1.5, D: +0.8, H: +0.5 },
  "clinical_educator":        { H: +0.8, B: +0.3, D: +0.3 },
  "frontline_clinician":      { B: +0.5, C: +0.5 },
  "charge_nurse":             { B: +0.5, C: +0.5 },
  "senior_leadership":        { F: +1.2, E: +0.8, H: +0.5 },
  "regulatory_lead":          { A: +0.5, E: +1.5, F: +0.5, D: +0.5 },
  "moh_programme_officer":    { G: +1.0, E: +0.8, F: +0.5, A: +0.5 },
  "chw":                      { G: +0.8, B: +0.3 },
  "phc_in_charge":            { B: +0.5, C: +0.5, E: +0.3, G: +0.5 },
  "researcher":               { A: +1.0, D: +0.5, G: +0.5 },
  "consultant":               { F: +0.5, E: +0.5, B: +0.5 },
  "student":                  { /* uniform */ },
};

const SETTING_BIAS = {
  "district_hospital":      { A: +0.3, B: +0.3, C: +0.3, G: +0.3, E: +0.3 },
  "phc_clinic":             { A: +0.3, B: +0.3, G: +0.5, E: +0.3 },
  "tertiary_hospital":      { F: +0.3, A: +0.3, D: +0.8, E: +0.5 },
  "moh_office":             { F: +0.8, G: +0.5, E: +0.8 },
  "regulator":              { A: +0.3, E: +1.5, F: +0.5, D: +0.5 },
  "donor_programme":        { G: +0.8, B: +0.3, E: +0.3 },
  "mission_hospital":       { B: +0.3, C: +0.3, E: +0.3 },
  "community_outreach":     { G: +0.8 },
  "ltc":                    { C: +0.3, B: +0.3 },
  "mental_health":          { C: +0.3, B: +0.3 },
  "consulting":             { F: +0.3, E: +0.5, D: +0.3, B: +0.3 },
  "academic":               { A: +0.5, D: +0.5, H: +0.3 },
};

export function moduleWeights(profile) {
  const w = { ...BASE_WEIGHT };
  for (const role of profile?.roles || []) {
    const bias = ROLE_BIAS[role] || {};
    for (const [m, v] of Object.entries(bias)) w[m] = (w[m] || 1) + v;
  }
  const sb = SETTING_BIAS[profile?.setting] || {};
  for (const [m, v] of Object.entries(sb)) w[m] = (w[m] || 1) + v;
  return w;
}

export function recommendedModuleOrder(profile) {
  const w = moduleWeights(profile);
  return Object.entries(w)
    .sort((a, b) => b[1] - a[1])
    .map(([m]) => m);
}

// ---- Local difficulty calibration ----
// Returns a priority boost (higher = serve sooner).
// Previously failed (attempted but not yet correct) → boost 2.
// Never seen → boost 0 (neutral).
// Completed correctly → not in pool (filtered out upstream), boost 0 if seen.
function difficultyBoost(s, answers) {
  const a = answers?.[s.id];
  if (!a || a.attempts === 0) return 0;   // unseen — neutral
  return a.correct ? 0 : 2;              // failed — prioritise for re-serving
}

// ---- Shared helpers ----

function isLMIC(profile) {
  return !!(profile?.setting && [
    "district_hospital", "phc_clinic", "moh_office",
    "donor_programme", "mission_hospital", "community_outreach",
  ].includes(profile.setting));
}

function settingScore(s, lmic) {
  if (!s.setting_variant || s.setting_variant === "any") return 1;
  if (lmic  && s.setting_variant === "lower_resource")  return 2;
  if (!lmic && s.setting_variant === "higher_resource") return 2;
  return 0.5;
}

// ---- Build the player's adaptive path (cross-module) ----

export function buildPath(profile, contentLibrary, { length = 12, currentTier = 1 } = {}) {
  const state   = getState();
  const done    = new Set(state.progress.completedScenarioIds);
  const answers = state.progress.answers;
  const ordered = recommendedModuleOrder(profile);
  const lmic    = isLMIC(profile);

  function poolFor(tier) {
    return contentLibrary
      .filter(s => s.tier === tier && !done.has(s.id))
      .sort((a, b) => {
        // 1. Prioritise previously-failed scenarios (calibration)
        const db = difficultyBoost(b, answers) - difficultyBoost(a, answers);
        if (db !== 0) return db;
        // 2. Then module rank (role + setting weighted)
        const am = ordered.indexOf(a.module), bm = ordered.indexOf(b.module);
        if (am !== bm) return am - bm;
        // 3. Then setting match
        return settingScore(b, lmic) - settingScore(a, lmic);
      });
  }

  const path = [];
  let tier = currentTier;
  let pool = poolFor(tier);
  let safety = 0;
  while (path.length < length && safety++ < 200) {
    if (pool.length === 0) {
      tier += 1;
      pool = poolFor(tier);
      if (pool.length === 0) break;
    }
    path.push(pool.shift());
  }
  return path;
}

// ---- Build a module-focused path ----
// Used by the Map view "Focus" button. Serves all incomplete scenarios
// in the chosen module, failed ones first, then by tier.

export function buildModulePath(moduleId, profile, contentLibrary, { length = 20 } = {}) {
  const state   = getState();
  const done    = new Set(state.progress.completedScenarioIds);
  const answers = state.progress.answers;
  const lmic    = isLMIC(profile);

  return contentLibrary
    .filter(s => s.module === moduleId && !done.has(s.id))
    .sort((a, b) => {
      // 1. Failed scenarios first (calibration)
      const db = difficultyBoost(b, answers) - difficultyBoost(a, answers);
      if (db !== 0) return db;
      // 2. Tier ascending (easier first)
      if (a.tier !== b.tier) return a.tier - b.tier;
      // 3. Setting match
      return settingScore(b, lmic) - settingScore(a, lmic);
    })
    .slice(0, length);
}

export function buildReviewPath(contentLibrary, { length = 8, now = Date.now() } = {}) {
  const state = getState();
  const due = new Set(Object.entries(state.progress.answers)
    .filter(([, answer]) => answer.reviewDueAt && answer.reviewDueAt <= now)
    .map(([id]) => id));
  return contentLibrary
    .filter(s => due.has(s.id))
    .sort((a, b) => state.progress.answers[a.id].reviewDueAt - state.progress.answers[b.id].reviewDueAt)
    .slice(0, length);
}

// ---- Scoring ----

export function scoreAnswer(scenario, answer) {
  // Each scenario.answer is opaque to the engine; the scenario UI evaluates correctness
  // and passes a boolean. This function exists for future weighting/timing.
  return { correct: !!answer.correct, points: answer.correct ? pointsFor(scenario) : 0 };
}

function pointsFor(scenario) {
  return scenario.tier * 10;
}

// ---- Adaptive logic (competency-based) ----

export function recommendNext(scenario, correct, contentLibrary, state = getState()) {
  const tags = scenario.competency_tags || [];
  // After two consecutive misses, change the example while keeping the competency.
  for (const tag of tags) {
    const c = state.progress.competency[tag];
    if (c && c.streakWrong >= 2) {
      const remed = contentLibrary
        .filter(s =>
          s.id !== scenario.id &&
          s.tier <= scenario.tier &&
          (s.competency_tags || []).includes(tag) &&
          !state.progress.completedScenarioIds.includes(s.id))
        .sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id))[0];
      if (remed) return { action: "remediate", next: remed, tag };
    }
  }

  // Promotion requires correct evidence from at least two item types at this tier.
  const tierCoverage = countItemTypeCoverage(scenario.module, scenario.tier, contentLibrary, state);
  if (correct && tierCoverage >= 2) {
    const promoted = contentLibrary
      .filter(s => s.module === scenario.module && s.tier === scenario.tier + 1 &&
        !state.progress.completedScenarioIds.includes(s.id))
      .sort((a, b) => {
        const aMatch = (a.competency_tags || []).some(tag => tags.includes(tag)) ? 0 : 1;
        const bMatch = (b.competency_tags || []).some(tag => tags.includes(tag)) ? 0 : 1;
        return aMatch - bMatch || a.id.localeCompare(b.id);
      })[0];
    return { action: "promote", next: promoted || null, coverage: tierCoverage };
  }
  return { action: "continue", next: null };
}

export function countItemTypeCoverage(moduleId, tier, library, state = getState()) {
  const types = new Set();
  for (const id of state.progress.completedScenarioIds) {
    const item = library.find(s => s.id === id);
    if (item?.module === moduleId && item?.tier === tier) types.add(item.itemType);
  }
  return types.size;
}

// ---- Badges ----

export function checkBadges(state, library) {
  const earned = [];
  // Signal Spotter — evidence across true-signal and correct non-call scenarios.
  let truePos = 0, trueNeg = 0;
  for (const id of state.progress.completedScenarioIds) {
    const s = library.find(x => x.id === id); if (!s) continue;
    if (s.competency_tags?.includes("run_chart_rules") || s.competency_tags?.includes("signal_vs_noise")) {
      if (s.runChartRule) truePos++; else trueNeg++;
    }
  }
  if (truePos >= 3 && trueNeg >= 2) earned.push("signal_spotter");

  // Operational Definition — both constrained construction and free-writing evidence.
  const opDefs = state.progress.completedScenarioIds.filter(id => id.startsWith("A2-opdef")).length;
  if (opDefs >= 2) earned.push("operational_definition");

  // Family of Measures — classification plus applied family-of-measures evidence.
  const fom = state.progress.completedScenarioIds.filter(id => id === "B1-measure-classification" || id.startsWith("B2-fom")).length;
  if (fom >= 2) earned.push("family_of_measures");

  // Board-Ready — two distinct board-facing judgements.
  if (["F2-target-line", "F2-frame-collision"].every(id => state.progress.completedScenarioIds.includes(id))) earned.push("board_ready");

  // Equity Lens — reserved for two pieces of evidence (the library is expanded in v2).
  if (state.progress.completedScenarioIds.filter(id => id.startsWith("G1") || id.startsWith("G2")).length >= 2) earned.push("equity_lens");

  // Reflective Practitioner — 3 reflections of ≥ 20 chars.
  const reflections = Object.values(state.progress.answers).filter(a => a.reflection && a.reflection.length >= 20).length;
  if (reflections >= 3) earned.push("reflective_practitioner");

  // Curriculum Connoisseur — at least 1 scenario solved in all eight modules.
  const mvpModules = new Set(["A","B","C","D","E","F","G","H"]);
  const playedModules = new Set();
  for (const id of state.progress.completedScenarioIds) {
    const s = library.find(x => x.id === id); if (s) playedModules.add(s.module);
  }
  if ([...mvpModules].every(m => playedModules.has(m))) earned.push("curriculum_connoisseur");

  return earned;
}
