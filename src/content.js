// Quality Quest — content loader (modules + scenarios + glossary + citations)

const CONTENT_BASE = "./content";

const VALID_ITEM_TYPES  = new Set(["MCQ", "HOT", "MATCH", "ORDER", "BUILD", "WRITE", "BRANCH", "DEFEND"]);
const VALID_CHART_TYPES = new Set(["run", "pChart", "uChart", "cChart", "iMR", "gChart", "tChart", "pareto", "fishbone", "driverDiagram", "bar", "table", "none"]);
const VALID_RULES       = new Set(["shift", "trend", "runs", "astronomical"]);

let cache = null;

export async function loadContent() {
  if (cache) return cache;

  // Scenarios are listed in a manifest so the service worker can precache them.
  const [modules, glossary, citations, scenarios] = await Promise.all([
    fetchJson(`${CONTENT_BASE}/modules.json`),
    fetchJson(`${CONTENT_BASE}/glossary.json`),
    fetchJson(`${CONTENT_BASE}/citations.json`),
    fetchJson(`${CONTENT_BASE}/scenarios/bundle.json`),
  ]);

  const validScenarios = scenarios.filter(validateScenario);

  cache = { modules, scenarios: validScenarios, glossary, citations };
  return cache;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function validateScenario(s) {
  if (!s || typeof s !== "object") return warn(s, "not an object");
  if (!s.id || !s.module || !s.tier || !s.lo_id) return warn(s, "missing required field");
  if (!VALID_ITEM_TYPES.has(s.itemType)) return warn(s, `itemType "${s.itemType}" not in enum`);
  if (s.chartType && !VALID_CHART_TYPES.has(s.chartType)) return warn(s, `chartType "${s.chartType}" not in enum`);
  if (s.runChartRule && !VALID_RULES.has(s.runChartRule)) return warn(s, `runChartRule "${s.runChartRule}" not in enum`);
  return true;
}

function warn(s, msg) {
  console.warn(`[content] scenario ${s?.id || "(no id)"} rejected: ${msg}`);
  return false;
}

export function pickGlossary(content, profile, term) {
  const isLowerResource = profile && [
    "district_hospital", "phc_clinic", "moh_office", "donor_programme", "mission_hospital", "community_outreach"
  ].includes(profile.setting);
  const map = isLowerResource ? content.glossary.lmic : content.glossary.hic;
  return map[term] || term;
}

export function applyGlossary(content, profile, text) {
  if (!text) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, term) => pickGlossary(content, profile, term));
}
