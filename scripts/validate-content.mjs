import fs from "node:fs";
import path from "node:path";
import { localizeValue, unresolvedTokens } from "../src/terminology.js";

const root = path.resolve(import.meta.dirname, "..");
const scenarioDir = path.join(root, "content/scenarios");
const manifest = readJson(path.join(scenarioDir, "manifest.json"));
const citations = readJson(path.join(root, "content/citations.json"));
const scenarios = manifest.files.map(file => readJson(path.join(scenarioDir, file)));
const errors = [];
const ids = new Set();
const validItems = new Set(["MCQ", "HOT", "MATCH", "ORDER", "BUILD", "WRITE", "BRANCH", "DEFEND"]);
const validCharts = new Set(["run", "pChart", "iMR", "pareto", "fishbone", "driverDiagram", "bar", "table", "none"]);

for (const scenario of scenarios) {
  if (ids.has(scenario.id)) errors.push(`duplicate scenario id: ${scenario.id}`);
  ids.add(scenario.id);
  for (const field of ["id", "module", "tier", "lo_id", "itemType", "brief", "task", "answer", "debrief"]) {
    if (scenario[field] == null) errors.push(`${scenario.id}: missing ${field}`);
  }
  if (!validItems.has(scenario.itemType)) errors.push(`${scenario.id}: invalid itemType ${scenario.itemType}`);
  const chart = scenario.chartType || scenario.exhibit?.chartType || scenario.exhibit?.kind || "none";
  if (!validCharts.has(chart)) errors.push(`${scenario.id}: invalid chart type ${chart}`);
  for (const citation of scenario.debrief?.citations || []) {
    if (!citations.sources?.[citation]) errors.push(`${scenario.id}: unknown citation ${citation}`);
  }
  for (const profile of [{ setting: "moh_office" }, { setting: "tertiary_hospital" }]) {
    const unresolved = unresolvedTokens(localizeValue(scenario, profile));
    if (unresolved.length) errors.push(`${scenario.id}: unresolved tokens ${unresolved.join(", ")}`);
  }
}

if (manifest.files.length !== ids.size) errors.push("manifest count does not match unique scenario count");
for (const moduleId of "ABCDEFGH") {
  if (!scenarios.some(s => s.module === moduleId)) errors.push(`module ${moduleId} has no scenarios`);
}

const chartCounts = Object.create(null);
for (const scenario of scenarios) {
  const chart = scenario.chartType || scenario.exhibit?.chartType || scenario.exhibit?.kind || "none";
  chartCounts[chart] = (chartCounts[chart] || 0) + 1;
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK — ${scenarios.length} scenarios across 8 modules`);
console.log(`Chart coverage: ${JSON.stringify(chartCounts)}`);

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
