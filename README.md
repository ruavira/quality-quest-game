# Quality Quest

> An offline-capable HTML learning game for healthcare quality and patient safety professionals — built around the use of data for improvement.

**Status:** MVP build complete (2026-05-20). 16 scenarios across 6 modules at Apprentice and Practitioner tiers. Installable as a Progressive Web App; works fully offline after first load. Forward roadmap (v1.0 / v1.5 / vNext) lives in `NEXT.md`.

The project lives as a **self-contained sub-project** in `/healthcare-quality-game/` and has nothing to do with the surrounding Ruavira website code.

---

## What's in MVP

- **2-step onboarding wizard** (Role → Setting). Roles include Community Health Worker, PHC facility in-charge, Ministry of Health programme officer, district quality lead, infection preventionist, data analyst, senior leadership, and more. Settings default to district hospital, PHC clinic, MoH office, donor-funded programme, mission hospital, community outreach — with higher-resource and academic / regulator settings available.
- **Linear 12-card path** that prioritises modules and scenarios matching the player's role + setting, with **LMIC scenario variants** chosen by default when the setting is lower-resource.
- **Vocabulary glossary** — scenarios with `{{board}}` / `{{exec}}` / `{{ehr}}` tokens render as "directorate brief / Medical Director / HMIS or DHIS2 export" for LMIC settings and "board report / Chief Medical Officer / EHR query" for HIC settings.
- **16 scenarios** mapped to explicit Learning Objectives across:
  - **Module A — Reading the Data** (run charts, numerator/denominator, data structure, run-chart shift rule, chart-type selection with reason, operational-definition constructor)
  - **Module B — Using the Data** (measure classification, PDSA cycle ordering, family of measures)
  - **Module C — Reading Safety Data** (WHO ICPS harm severity, safety-culture survey interpretation, Pareto of incidents)
  - **Module F — Leading with Data** (dashboard measure types, the mandatory "target line on a control chart" category-error scenario)
  - **Module G — Population & Equity Data** (when stratification changes the story)
  - **Module H — Communicating Data** (chart choice by audience)
- **Seven item types:** MCQ, HOT (hotspot — click the signal on a chart), MATCH, ORDER, BUILD (operational-definition constructor), DEFEND (answer + reason), BRANCH (multi-step). All seven are implemented; the MVP scenarios exercise MCQ, HOT, MATCH, ORDER, BUILD, and DEFEND.
- **Eight chart renderers with keyboard + screen-reader accessibility:** run chart (with median), p-chart (with subgroup-varying limits), I-MR, Pareto, fishbone, driver diagram, bar, and table. Every chart ships with a linearised `<table>` fallback, a "Describe this chart" text summary, and keyboard arrow-traversal of data points.
- **Competency-based adaptive logic** — slowing the player down after two wrong items on the same competency, promoting on coverage across item types (never on speed).
- **Badges anchored to real-world artefacts** — Signal Spotter, Operational Definition, Family of Measures, Board-Ready, Equity Lens, Reflective Practitioner, Curriculum Connoisseur. No streaks, no leaderboard.
- **One-page Case File** auto-generated from the player's last three scenarios + badges + a disclaimer. Print-to-PDF and JSON transcript export.
- **PWA** — installable, fully offline after first load. iOS Safari Add-to-Home-Screen coach-mark + 7-day eviction warning. Stale-while-revalidate caching.
- **WCAG 2.2 AA-conscious design** — system-font only, 44 × 44 px touch targets, visible focus ring, colour-blind-safe series, no hover-only interactions, `prefers-reduced-motion` honoured.
- **No backend, no login, no analytics, no PII.** Profile and progress live in `localStorage`. Player can wipe everything from the Path screen.

## What's deferred (and where)

Read `DESIGN_PLAN_V2.md` for the full v1.0 / v1.5 / vNext breakdown. Highlights:
- **v1.0:** Modules D (Quality Review) + E (Regulatory & Accreditation); Architect-tier scenarios in D–H; map view (4×2 module grid).
- **v1.5:** Full Patient Safety content (RCA2, FMEA, Just Culture); two-session capstone; French, Swahili, Portuguese, Spanish translations; CPHQ exam goal re-introduced with blueprint-weighted distribution.
- **vNext:** Free-text WRITE rubric grading; facilitator mode (cohort import/export); difficulty calibration with optional cohort sync.

---

## How to run locally

The published artefact is plain HTML/CSS/JS — no build step required. The repository contains everything needed to host as a static site.

### Option 1 — Any static server

```bash
cd healthcare-quality-game
python3 -m http.server 5174
# then open http://localhost:5174 in a browser
```

Or:

```bash
npx serve -p 5174 .
```

### Option 2 — File:// (won't fully work)

Loading `index.html` directly via `file://` does **not** work because ES modules and `fetch()` require an http(s) origin. Use a static server (any will do).

### Smoke test in the project

```bash
node -e "require('./package.json').scripts.lint_scenarios" 2>/dev/null   # placeholder
npm run lint:scenarios   # validates all 16 scenarios against the schema enum
```

### Deploying

Drop the contents of `/healthcare-quality-game/` on any static host (Netlify, Cloudflare Pages, GitHub Pages, an S3 bucket, a USB stick served by `python3 -m http.server`). No environment variables. No backend.

---

## Manual test plan (recommended before publishing)

This MVP has been validated by static analysis (JS syntax, scenario JSON schema, HTTP responses) but has **not** been exercised end-to-end in a real browser from this build environment. Before publishing, please walk through:

1. **Onboarding** — Open the app, finish the wizard with a *district hospital* setting + *QI specialist* role. Confirm scenario 1 is `A1-runchart-basics` and that LMIC vocabulary is in use.
2. **Run chart HOT** — Reach `A2-runchart-shift`. Confirm: (a) clicking points selects them, (b) keyboard `Tab` + Arrow keys traverse points, (c) `D` reads the chart summary, (d) `T` shows the data table.
3. **Operational definition BUILD** — Reach `A2-opdef`. Type a draft into each field. Confirm Submit only enables once all six fields have content.
4. **DEFEND** — Reach `F2-target-line` or `A2-chart-type-choice`. Confirm you must pick an answer **then** a reason; both must be right.
5. **Path completion** — Finish all 16 scenarios. Confirm the Case File summarises your last three scenarios and shows earned badges.
6. **PWA install** — On Chrome / Edge / Android, look for the install prompt. On iOS Safari, confirm the Add-to-Home-Screen coach-mark appears.
7. **Offline** — After first load, disable network. Confirm everything still works (open from cache).
8. **Reset** — From the Path screen, hit Reset progress. Confirm profile + progress + badges all clear.
9. **Screen reader** — With NVDA (Windows) or VoiceOver (macOS / iOS) on, navigate to a chart and use D / T. Verify the chart's table fallback and summary are accessible. (This is the highest-risk surface; budget at least 30 minutes here.)
10. **Low-bandwidth check** — Throttle to 2G in DevTools. Confirm time-to-interactive ≤ 5 s on first visit.

If any of those fail, please log an issue against this folder (e.g., `ISSUES.md` or a GitHub issue once a repo is set up).

---

## Tech

- Vanilla HTML, CSS, JavaScript (ES modules) — no framework runtime, no build step.
- PWA manifest + service worker for offline + installability.
- All state in `localStorage`. No backend.
- WCAG 2.2 AA-conscious.
- System fonts only (no CDN, no @font-face). Total cached payload target: **≤ 500 KB**.

## Curriculum anchors

- **WHO Patient Safety Curriculum Guide — Multi-professional Edition** (primary safety lens, LMIC-friendly).
- **WHO Handbook for National Quality Policy and Strategy** (primary equity / population lens).
- **IHI Open School QI 102 / 103 / 104** (Model for Improvement, PDSA, family of measures, run charts, SPC).
- **Provost LP, Murray SK. *The Health Care Data Guide.* 2nd ed. (Jossey-Bass, 2022)** (chart selection, run-chart rules, signal interpretation).
- **NAHQ Healthcare Quality Competency Framework** (secondary scaffold).
- **IOM/NAM STEEEP** dimensions.

This is a **learning tool**, not a credential. The Case File is for the player's own portfolio and CPD log; it is not equivalent to CPHQ, CPPS, ISQua-IEEA, COHSASA, SafeCare, or any other certification.

## Project layout

```
healthcare-quality-game/
├── README.md                    ← you are here
├── DESIGN_PLAN.md               ← v1 design (pre-council)
├── COUNCIL_REVIEW.md            ← multi-perspective critique (5 critics)
├── DESIGN_PLAN_V2.md            ← v2 build-from spec + LMIC addendum
├── NEXT.md                      ← v1.0 / v1.5 / vNext queue + locked post-MVP directives
├── LICENSE                      ← MIT
├── package.json                 ← dev-only (lint:scenarios)
├── index.html                   ← entry point
├── manifest.webmanifest
├── service-worker.js
├── /src/                        ← application code
│   ├── main.js
│   ├── state.js                 ← profile / progress / badges, localStorage persistence
│   ├── engine.js                ← path builder + adaptive logic + badge checks
│   ├── content.js               ← scenario loader + schema validation
│   ├── charts.js                ← run / p / I-MR / Pareto / fishbone / driver / bar / table
│   └── /ui/                     ← splash, onboarding, scenario, debrief, path, case-file, install
├── /styles/
│   ├── tokens.css               ← colour, type, spacing (system fonts; LMIC budget)
│   └── app.css
├── /content/
│   ├── modules.json
│   ├── glossary.json            ← LMIC / HIC vocabulary swaps
│   ├── citations.json
│   └── /scenarios/
│       ├── manifest.json
│       └── (16 scenario .json files)
└── /assets/
    └── /icons/icon.svg
```

## Contributing scenarios

Scenarios live in `/content/scenarios/*.json`. The schema is enforced at load time: `itemType`, `chartType`, and `runChartRule` must use the locked enums. To add a scenario:

1. Pick or write a Learning Objective in `DESIGN_PLAN_V2.md` § 3.
2. Copy any existing scenario JSON as a starting template.
3. Add the new file to `/content/scenarios/manifest.json`.
4. Run `npm run lint:scenarios` to verify.

Authors are credited in the `authors` field of each scenario.

## License

MIT — see `LICENSE`. Curriculum source material (NAHQ, IHI, WHO, AHRQ PSNet, Provost & Murray) is **cited**, not reproduced; item content is original to Quality Quest authors.

---

## Acknowledgements

This project was scoped, critiqued, and built in a single Claude Code session in May 2026. The multi-perspective council that pressure-tested the design plan is documented in `COUNCIL_REVIEW.md` — five critics (CPHQ practitioner, SPC analyst, instructional designer, game designer, equity/LMIC specialist) gave the v1 plan a hard read, and the v2 plan incorporates 18 of their convergent recommendations + the user's resolutions on four strategic forks.
