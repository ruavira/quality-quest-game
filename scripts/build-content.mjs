import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const scenariosDir = resolve(root, "content/scenarios");
const manifest = JSON.parse(await readFile(resolve(scenariosDir, "manifest.json"), "utf8"));
const scenarios = await Promise.all(manifest.files.map(async file =>
  JSON.parse(await readFile(resolve(scenariosDir, file), "utf8"))));

await writeFile(resolve(scenariosDir, "bundle.json"), `${JSON.stringify(scenarios)}\n`);
console.log(`Built scenario bundle with ${scenarios.length} scenarios.`);
