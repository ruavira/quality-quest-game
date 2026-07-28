# Architecture

Quality Quest is a static, framework-free JavaScript application.

## Runtime boundaries

- `src/main.js` owns routing and session orchestration.
- `src/state.js` owns local persistence, attempt history, reflections, review dates, and exports.
- `src/engine.js` owns weighting, path selection, remediation, promotion, review paths, and badge evidence.
- `src/terminology.js` applies setting-aware language recursively to all scenario fields.
- `src/charts.js` renders exhibits with structured descriptions and data alternatives.
- `content/scenarios/*.json` contains the learning library.
- `service-worker.js` owns offline caching and rejects redirected Access responses.

There is no gameplay API or database. Cloudflare Pages hosts the static files; Cloudflare Access is a separate deployment-perimeter control.

## State model

The v2 transcript schema stores:

- profile and setting
- latest answer summary per scenario
- append-only attempt history
- competency right/wrong evidence and consecutive misses
- review due dates
- reflections
- badges

Existing v1 local data is migrated in place by adding an empty history array when absent.

