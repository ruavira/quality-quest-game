# Quality Quest — Healthcare Quality & Patient Safety Data Game

**Design plan, v1 (draft for council critique) · 2026-05-20**

> A standalone, offline-capable, HTML-based learning game that teaches and tests competencies in **using data for improvement** across healthcare quality and patient safety roles. Lives in `/healthcare-quality-game/` as a self-contained sub-project; no shared code with the Ruavira website.

---

## 1. Goal in one paragraph

Help quality professionals — and the clinicians, analysts, and leaders who work alongside them — **learn, apply, and self-evaluate** their ability to use data for improvement. The game profiles the player on their **role, setting, data interactions, and data types**, then routes them through a personalised path of scenarios that escalate from **foundational → proficient → advanced**. Every level couples a learn step (concept), an apply step (do something with data in-game), and an evaluate step (decide what action the data justifies). The artefact is an installable PWA — works fully offline once installed, runs from a USB stick if needed, and can be used by an individual or facilitated by a trainer with a small group.

---

## 2. Curriculum scaffolding (the "what")

The blended curriculum anchor confirmed with the user:

| Source | Role in the game |
| --- | --- |
| **NAHQ Healthcare Quality Competency Framework** (8 domains, 29 competencies, ~486 skills, 3 proficiency tiers: Foundational / Proficient / Advanced) | Primary skeleton. Game levels mirror the three proficiency tiers; modules map to the 8 domains, with Health Data Analytics + Performance & Process Improvement as the spine. |
| **IHI Open School QI series** (esp. QI 102 *Model for Improvement*, QI 103 *PDSA + Measurement*, QI 104 *Run charts & SPC*) | Methodology lens. PDSA cycles, family of measures (outcome/process/balancing), run-chart rules, SPC basics, operational definitions. |
| **WHO Patient Safety Curriculum Guide — Multi-professional Edition** (11 topics) | Safety lens + global/LMIC relevance. Topics 5 (*Learning from errors*), 6 (*Understanding & managing clinical risk*), 7 (*Quality improvement methods*) and 11 (*Improving medication safety*) are most data-heavy. |
| **IOM/NAM STEEEP** (Safe, Timely, Effective, Efficient, Equitable, Patient-centred) | Dimensions used to label scenarios and stratify performance. |
| **Lloyd Provost / Sandra Murray *Healthcare Data Guide*** | Practical decision rules (run-chart rules of 8, signals, when to switch run → SPC, sampling, operational definitions). |

### 2.1 The eight NAHQ domains, mapped to game modules

| # | NAHQ Domain | Game module | Data-for-improvement focus |
| --- | --- | --- | --- |
| 1 | Health Data Analytics | **Module A — Reading the Data** | Operational definitions, numerator/denominator, sampling, run vs SPC, signals vs noise, common vs special cause. |
| 2 | Performance & Process Improvement | **Module B — Using the Data** | Model for Improvement, family of measures, PDSA, driver diagrams, Pareto, fishbone, sustaining gains. |
| 3 | Patient Safety | **Module C — Safety Data** | Incident reporting taxonomies, harm severity, RCA2, FMEA, just culture, safety culture survey reading. |
| 4 | Quality Review & Accountability | **Module D — Auditing & Reviewing** | Chart audit design, abstraction reliability, peer review data, mortality & morbidity review. |
| 5 | Regulatory & Accreditation | **Module E — Data for Compliance** | Accreditation data submissions (e.g., Accreditation Canada, JCI, Joint Commission, ISQua-aligned), public reporting, regulator dashboards. |
| 6 | Quality Leadership & Integration | **Module F — Leading with Data** | Strategic dashboards, board-level reporting, choosing what to escalate, governance of measurement. |
| 7 | Population Health & Care Transitions | **Module G — Population Data** | Stratification, equity-stratified measures, readmission analysis, hot-spotting. |
| 8 | Professional Engagement | **Module H — Communicating Data** | Telling the story, data-visualisation choices, presenting to non-data audiences, data ethics. |

A player does **not** have to traverse all 8 — the setup wizard prunes to the modules relevant to their profile (see §4).

### 2.2 The three proficiency tiers (game levels)

| Tier | NAHQ label | Game shorthand | What success looks like |
| --- | --- | --- | --- |
| L1 | Foundational | **Apprentice** | Can read a run chart, name the family of measures, find the numerator/denominator, recognise an obvious signal vs noise. |
| L2 | Proficient | **Practitioner** | Can pick the right measure for an aim statement, build a driver diagram, design a PDSA, choose run vs SPC, write an operational definition, interpret control-chart rules. |
| L3 | Advanced | **Architect** | Can govern a measurement strategy, stratify for equity, defend a measure choice to a board, design a balanced scorecard, decide when to stop a PDSA, advise on regulatory submission integrity. |

Each module has 1–4 scenarios per tier (≈ 24 baseline scenarios at MVP, ≈ 60 at full content).

---

## 3. The setup wizard (the "for whom")

The wizard is **five short steps**, each with sensible defaults so a returning player can rebuild a profile in under a minute. Answers are stored in `localStorage` as the player's **Profile**, and re-edited from the menu.

### 3.1 Step 1 — Role

Multi-select up to 3. Drives **module weighting** and **scenario voice**.

- Frontline clinician (nurse / physician / allied health)
- Charge nurse / unit lead
- Quality Improvement specialist / coordinator
- Patient Safety officer / risk manager
- Infection preventionist
- Clinical educator
- Healthcare data analyst / informatics
- Accreditation & regulatory lead
- Department director / clinical leader
- Executive (CMO / CNO / CQO / CEO)
- Public health / Ministry of Health analyst
- Researcher / academic
- Student / trainee
- Consultant / advisor (external)

### 3.2 Step 2 — Setting

Single-select primary + optional secondary. Drives **scenario context** (acute vs primary care vs LTC etc.) and **resource constraints** (digital-mature HIC vs paper-heavy LMIC).

- Acute care hospital — tertiary / academic
- Acute care hospital — community / district
- Primary care clinic / family medicine
- Specialist outpatient clinic
- Long-term / residential care
- Mental health & addictions
- Home & community care
- Public health agency / Ministry of Health
- Health regulator / accrediting body
- Pharmacy / lab / diagnostics
- Digital health / health-tech vendor
- Consulting firm / NGO
- Academic / research

Plus a **resource setting** toggle: *High-resource* / *Mixed* / *Lower-resource (LMIC)* — affects whether scenarios assume an EMR, what data exists, and what infrastructure is realistic.

### 3.3 Step 3 — How you interact with data

Multi-select. Drives **task difficulty mix** and **whether the player is graded on doing vs interpreting**.

- I **read** dashboards and reports others build
- I **request** reports from analysts
- I **build** dashboards and reports
- I **clean & prepare** data
- I **analyse & interpret** data
- I **present & communicate** data to leaders / boards
- I **govern** measurement (decide what gets measured, sign off on definitions)
- I **model & predict** (regression, risk-adjustment, ML)
- I **collect data** at the point of care (chart audits, surveys)

### 3.4 Step 4 — Types of data you work with

Multi-select. Drives **scenario data set choice**.

- Clinical / EMR (vitals, labs, meds, problem lists)
- Administrative / claims / billing
- Patient experience (HCAHPS-like surveys, complaints, compliments)
- Safety event / incident reports
- Outcome measures (mortality, readmissions, healthcare-associated infections)
- Process measures (bundle compliance, time-to-treatment)
- Balancing measures
- Chart audit / structured abstraction
- Qualitative (interviews, focus groups, free text)
- Equity-stratified data (race, language, deprivation, geography)
- Time-series operational data (LOS, throughput, no-show rates)
- Cost / value data
- Workforce / HR data (vacancy, turnover, burnout)

### 3.5 Step 5 — Goal + starting level

Single-select goal + single-select self-rated starting level.

**Goals** (affect badge focus and end-of-game summary):
- I want to prepare for the CPHQ exam
- I want to lead a QI project at work
- I want to be a better consumer of data as a leader
- I want to teach my team
- I'm just exploring

**Self-rated start:** Apprentice / Practitioner / Architect. A short 6-item placement quiz fine-tunes this after the wizard.

### 3.6 What the wizard outputs

```
Profile {
  roles: ["QI specialist", "Clinical educator"],
  setting: { primary: "Community hospital", resource: "Mixed" },
  interactions: ["read", "build", "analyse", "present"],
  data_types: ["process", "outcome", "incident", "chart audit"],
  goal: "Lead a QI project at work",
  start_level: "Practitioner",
  placement_adjustment: +1   // from 6-item placement quiz
}
```

This profile is fed into the **Path Engine** (§5).

---

## 4. Game flow (the "how it feels")

```
[Splash] → [Setup wizard] → [Placement quiz, 6 items] → [Personalised
           map of modules & tiers] → [Scenario] → [Debrief] → [XP +
           badges + skill-bar update] → next Scenario → [Tier boss
           challenge] → next Tier → [Module complete] → next Module
           → [Capstone] → [Certificate of Completion + portable
           transcript JSON export]
```

### 4.1 Map view

Picture an isometric-ish dashboard map (clean, professional — no cartoon characters). Modules are tiles laid out as a 4×2 grid; each tile has three pips for L1/L2/L3 progress. Tiles the player's profile rules out are visible but greyed with a "*Not in your current path — unlock anytime*" hover. Players can deviate from the recommended path at any time.

### 4.2 Scenario anatomy

Every scenario follows the same five-beat structure so the player builds rhythm:

1. **Brief** — 80–150 words. Sets the situation in the player's chosen setting and role.
2. **Data exhibit** — a chart, table, dashboard screenshot, run chart, control chart, fishbone, or driver diagram rendered in-game. SVG, no external assets.
3. **Task** — one of the eight item types (§4.3). Tier determines complexity.
4. **Decision** — the player commits an answer. No back-button on the answer itself (mirrors real life).
5. **Debrief** — explains the right answer, the reasoning, links to the curriculum source (NAHQ / IHI / WHO citation), and a "*What this looks like in practice*" note from the player's setting.

### 4.3 Eight item types (mix-and-match across scenarios)

| Code | Type | Example |
| --- | --- | --- |
| **MCQ** | Multiple-choice | "Which of these is a balancing measure for an aim to reduce ED LOS?" |
| **HOT** | Hotspot | Click the special-cause signal on a run chart. |
| **MATCH** | Drag-to-match | Match each measure to outcome/process/balancing. |
| **ORDER** | Sequencing | Order the steps of a PDSA cycle. |
| **BUILD** | Constructor | Drag chart components to build a run chart correctly (median, points, annotations). |
| **WRITE** | Short text + rubric | Write an operational definition; auto-graded against a keyword/structure rubric. |
| **BRANCH** | Branching scenario | Each choice opens new data and a new task; final score weighted across the branch. |
| **DEFEND** | Multi-stage MCQ | Pick an answer, then pick the *reason* — both must be right. |

### 4.4 Tier-boss challenges

End of each tier in each module: one timed BRANCH scenario that pulls together everything in the tier. Pass mark 70%. Failing replays the tier-boss with one variant swap; second failure routes the player back to the weakest scenario in the tier.

### 4.5 Capstone

After completing the player's recommended path, a 30–45 minute multi-stage capstone simulates **a real QI project from problem statement to board report**, drawing on the player's chosen role and setting. Output: a downloadable PDF "case file" they can take to their team.

---

## 5. Path Engine — how the profile turns into a level set

A pure-JS function `buildPath(profile, contentLibrary) → orderedScenarioList`.

### 5.1 Module weighting

Each module starts with a base weight. The profile multiplies the weights:

```
weight(module) = baseWeight
                * roleMultiplier   (e.g., "Patient Safety officer" → Module C ×2)
                * settingMultiplier
                * dataTypeMultiplier
                * interactionMultiplier
```

The top 4–6 modules become the player's recommended path. Others are shown as "stretch" tiles.

### 5.2 Tier entry

Self-rated start + placement quiz puts the player at L1 / L2 / L3 of their first module. A player can ask to start at L1 of everything ("I want to be sure I have the basics"). Architects who fail a tier-boss drop one tier; Apprentices who 100% a tier auto-jump.

### 5.3 Scenario selection within a tier

Within a tier, the engine picks scenarios whose tags match the player's **data_types** and **interactions** first, then fills with diverse-tag scenarios to broaden exposure. No repeats unless replayed deliberately.

### 5.4 Adaptive difficulty inside a tier

Two consecutive wrong → next scenario is one tier lower or the same scenario simplified.
Three consecutive correct & fast → next scenario is one tier higher or has a harder variant flag.

### 5.5 Content library shape

```
contentLibrary = [
  {
    id: "A1-runchart-basics",
    module: "A",
    tier: 1,
    type: "HOT",
    tags: ["run_chart", "outcome", "acute_care"],
    title: "Spot the signal",
    brief: "...",
    exhibit: { kind: "svg-runchart", data: [...] },
    task: { ... },
    debrief: { ... },
    citations: ["IHI QI 104", "Provost & Murray ch. 4"]
  },
  ...
]
```

JSON files in `/content/` — easy to extend, easy to translate.

---

## 6. Game mechanics & motivation layer

Clinical-professional, not arcade. Inspired by IHI Open School, NEJM Knowledge+, and Duolingo's restraint.

- **XP** per scenario (more XP for higher tier, no penalty for wrong — only no XP).
- **Skill bars** per module (8 bars, each fills 0–100%).
- **Streak counter** (consecutive days) — light, no nagging notifications.
- **Badges** keyed to real-world artefacts:
  - *Operational Definition* — for writing 3 clean op defs.
  - *Signal Spotter* — for getting 5 run-chart signals right in a row.
  - *Driver Diagrammer* — for building 3 driver diagrams.
  - *Family of Measures* — for picking the right balanced set 3×.
  - *Just Culture* — for handling 3 safety scenarios without blame-first answers.
  - *Equity Lens* — for stratifying when it matters.
  - *Board-Ready* — for completing the leadership communication module.
  - *Curriculum Connoisseur* — for finishing all 8 modules.
- **Transcript export** — the player can export a JSON + PDF transcript of their play (modules completed, scores, time, badges) for their portfolio or CPD log.
- **No leaderboard** at MVP — it pulls focus toward speed-running rather than learning. Add as a per-cohort feature later if facilitators ask.

---

## 7. Technical architecture (the "how it's built")

### 7.1 Stack

- **Vanilla HTML/CSS/JS, ES modules** — no build step required for production.
- **PWA**: manifest + service worker (Workbox-style hand-rolled) to cache app shell + all content for true offline use.
- **Optional dev tooling**: `npm run dev` via `vite` for live-reload during development; `npm run build` produces a `/dist` that's also just static HTML/CSS/JS (no framework runtime). The published artefact stays framework-free.
- **No backend.** Profile + progress in `localStorage` (and `IndexedDB` if we ever store images). Optional JSON export/import for cross-device transfer.
- **Chart rendering**: native SVG via small helper functions in `/src/charts/`. No D3 dependency at MVP (keeps the bundle small for offline + LMIC bandwidth).
- **Accessibility**: WCAG 2.2 AA target; keyboard navigation; ARIA labels on every interactive chart element; colour-blind-safe palette; text-only fallback for every chart exhibit.

### 7.2 File structure

```
healthcare-quality-game/
├── README.md
├── DESIGN_PLAN.md                ← this file
├── COUNCIL_REVIEW.md             ← appears after council critique
├── LICENSE                        ← MIT
├── index.html                     ← entry point
├── manifest.webmanifest
├── service-worker.js
├── /src/
│   ├── main.js                    ← bootstraps the app
│   ├── /state/                    ← profile, progress, persistence
│   ├── /engine/                   ← pathEngine.js, scoring.js, adaptive.js
│   ├── /ui/                       ← components: wizard, map, scenario, debrief
│   ├── /charts/                   ← runChart.js, controlChart.js, pareto.js,
│   │                                fishbone.js, driverDiagram.js
│   └── /util/                     ← rng, time, format, a11y helpers
├── /styles/
│   ├── tokens.css                 ← colour, type, spacing tokens
│   └── app.css
├── /content/
│   ├── modules.json               ← module metadata + weights
│   ├── /scenarios/
│   │   ├── A1-runchart-basics.json
│   │   ├── A2-numerator-denominator.json
│   │   └── ...
│   └── /citations/
│       └── citations.json
├── /assets/
│   ├── /icons/                    ← PWA icons (192, 512, maskable)
│   └── /img/                      ← any static imagery (kept minimal)
└── /tests/
    ├── pathEngine.test.js
    ├── scoring.test.js
    └── content-schema.test.js
```

### 7.3 Offline & install

- Service worker precaches: shell HTML/CSS/JS + all scenarios JSON + icons.
- "Install" button appears on first visit; works on iOS Safari, Android Chrome, desktop Chrome/Edge.
- After install, network is never required.

### 7.4 Data persistence model

```
localStorage["qq:profile"]      // { roles, setting, interactions, ... }
localStorage["qq:progress"]     // { moduleId: { tier1: {score, attempts}, ... } }
localStorage["qq:badges"]       // [ badgeId, ... ]
localStorage["qq:settings"]     // { theme, reducedMotion, language }
```

`Export profile` writes the same blob as a JSON file; `Import profile` reads it back. Useful for trainers spinning up a cohort.

### 7.5 Privacy

- No PII collected. No analytics by default. An optional `?analytics=on` URL flag enables a minimal `navigator.sendBeacon` to an endpoint the user configures — off by default.
- Player can wipe everything from the Settings panel.
- README states clearly: this is a learning tool, not a clinical system; no patient data is collected; scenarios use synthetic data.

### 7.6 Performance budget

- Initial load (cold): ≤ 200 KB JS + ≤ 50 KB CSS + ≤ 30 KB content (manifest + first 4 scenarios prefetched).
- All scenarios eventually cached: ≤ 1.5 MB total.
- Time-to-interactive on a 3-year-old Android over 3G: ≤ 3 s.

---

## 8. Visual design system

Clinical-professional with subtle game polish — confirmed.

| Token | Hex | Use |
| --- | --- | --- |
| `--ink-900` | `#0B1F33` | Primary text, headings |
| `--ink-700` | `#1F3A57` | Secondary text |
| `--ink-100` | `#E6ECF2` | Borders, hairlines |
| `--paper-50` | `#F7F9FC` | Surface |
| `--brand-600` | `#0A6E8F` | Primary accent (teal-leaning) |
| `--brand-500` | `#1796B8` | Hover / focus |
| `--success-600` | `#1F8F5F` | Correct, signal-positive |
| `--warn-600` | `#C77A00` | Caution, balancing measures |
| `--danger-600` | `#B33A3A` | Wrong, safety-critical |
| `--neutral-600` | `#4F5B6B` | Chart gridlines |

Type: **Inter** (UI + body) + **Source Serif 4** or **IBM Plex Serif** (chart titles, scenario briefs) — both available via system fall-backs or `@font-face` self-hosted. No external font CDN (offline-safe).

Motion: 150–250 ms cubic-bezier easings; `prefers-reduced-motion: reduce` honoured everywhere.

---

## 9. Content production plan

| Phase | Scenarios | Modules | Tiers covered |
| --- | --- | --- | --- |
| **MVP (this build)** | 24 (3 per module) | All 8 | At least L1 + L2 in every module; L3 in A, B, C only |
| **v1.0** | 60 | All 8 | L1–L3 in every module + 1 capstone |
| **v1.5** | 80+ | All 8 | + LMIC variants, + translations |
| **v2.0** | 100+ | All 8 | + facilitator mode + cohort import/export |

Source material drawn from:
- IHI Open School public abstracts and worksheets (concepts only — no copyrighted item text reused).
- AHRQ PSNet case studies (public domain, attribution preserved).
- WHO Patient Safety Curriculum Guide topic outlines (public).
- Provost & Murray *Healthcare Data Guide* methodology (cited, not reproduced).
- Collective domain expertise (Collective-authored items).

Item review workflow: every scenario passes (a) clinical accuracy review, (b) statistical/SPC review, (c) instructional-design review, (d) plain-language review. Reviewers initialled in scenario JSON.

---

## 10. Accessibility, equity, and global reach

- **WCAG 2.2 AA** target, audited with axe before each release.
- Every chart has a `<table>` text fallback + an audio-described summary toggle.
- Colour-blind safe palette (Okabe-Ito derived); pattern fills in addition to colour on key chart elements.
- Keyboard-only flow through every screen; visible focus ring.
- All copy at ~Grade 9 reading level (Hemingway-checked) except where domain vocabulary is the point.
- **i18n** scaffolded from day one: every UI string and scenario field keyed for translation; English at launch; **French, Spanish, Portuguese, and Swahili** earmarked for v1.5 (priority Collective partner languages).
- **Low-bandwidth friendly**: works on a feature-phone-style Android over 2G after install; total transfer-once budget under 1.5 MB.
- **LMIC scenario flag** so a player in a lower-resource setting doesn't get "configure your Tableau dashboard" tasks.

---

## 11. Assessment integrity & evaluation

- **Item difficulty** is recalibrated by play data once we have ≥ 30 plays per item (handled locally; no central server, so this is per-player calibration only at MVP).
- **Anti-gaming**: scenarios randomise the order of answer options; BRANCH scenarios randomise variant paths; WRITE items use a keyword + structure rubric (not exact match).
- **Self-evaluation prompts** at the end of every tier: "How confident are you in *X*?" 1–5 Likert. Compared to actual score to surface calibration gaps.
- **Reflection capture**: optional 1-sentence reflection at the end of each scenario, stored locally, exported in the transcript.

No external proctoring, no exam-style stakes — this is a **growth tool**, not a credential issuer. The README explicitly says the certificate of completion is a learning artefact, not equivalent to CPHQ or any other certification.

---

## 12. MVP scope vs vNext

### MVP (this build, target ~3 weeks of focused work)

- Setup wizard (5 steps)
- Placement quiz (6 items)
- Path engine + adaptive difficulty
- 24 scenarios across all 8 modules, ≥ L1 + L2 everywhere
- 5 of the 8 item types (MCQ, HOT, MATCH, ORDER, BRANCH)
- Run-chart + control-chart + Pareto + fishbone SVG renderers
- Progress + badges + transcript export
- PWA installable + fully offline
- WCAG 2.2 AA baseline
- English only
- One sample capstone

### vNext (separate sessions)

- BUILD + WRITE + DEFEND item types
- Tier 3 (Architect) scenarios in modules D–H
- French / Spanish / Portuguese / Swahili translation
- Facilitator mode (cohort import/export, group debrief)
- Driver-diagram + FMEA + RCA2 builders
- Item difficulty calibration with optional cohort sync (Supabase or local-first sync)
- Print-friendly facilitator deck PDF
- Web-share API "send this scenario to a colleague"

---

## 13. Naming & branding (proposal — open to swap)

- **Working title:** **Quality Quest** — short, memorable, professional, and signals progression.
- **Tagline:** *Use data. Improve care. Level up.*
- **Sub-title:** *A learning game for healthcare quality and patient safety professionals.*
- **Icon concept:** stylised run chart line crossing a median, forming a subtle "Q".

Alternatives if "Quality Quest" tests poorly: *The Improvement Lab*, *Signal & Story*, *Q-Path*.

---

## 14. Open questions for the user (to settle before/after council)

1. **Audience priority** — is the *primary* target the player working toward CPHQ exam prep, or the working QI professional who wants to sharpen on the job? (Both are in scope; the weighting affects scenario voice.)
2. **Branding** — is "Quality Quest" acceptable as a working title, or do you want a Ruavira-branded name (e.g., *Ruavira Improvement Lab*) even though this is structurally independent of the website?
3. **Certificate** — wording on the completion certificate matters because the README must be clear it's not a credential. Are you happy with "Certificate of Completion — Quality Quest", with explicit "not a substitute for CPHQ/CPPS" language?
4. **Hosting** — even though the game works fully offline, do you want it published at a URL? Options: (a) host under `ruavira.org/game/` as a static export; (b) host under a separate domain you own; (c) leave it as a downloadable PWA only.
5. **Content ownership** — once the Collective starts contributing scenarios, what's the credit/IP model? (Default proposal: scenarios authored by the Collective are MIT-licensed within the repo; the `authors` field stays generic ("Quality Quest core", "Collective contributor") rather than naming individuals publicly.)

---

## 15. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Content takes longer than code to build | Ship MVP with 24 sturdy scenarios, lean on AHRQ/IHI public material, build an authoring template so others can contribute |
| Game-y framing alienates senior professionals | Visual style stays clinical; XP/badges can be hidden via a "professional mode" toggle |
| Statistical content goes wrong (e.g., misuses run-chart rules) | Every chart-related scenario reviewed by a stats-literate Collective member; cite the exact rule in the debrief |
| Equity blind spots (US-centric scenarios) | LMIC scenario flag from MVP; one LMIC scenario per module at MVP; full LMIC pack in v1.5 |
| Misperceived as a credentialing tool | Disclaimer in three places: splash, certificate, README |
| Accessibility regressions as content grows | axe audit in CI; a11y checklist in the scenario-authoring template |

---

## 16. What success looks like at release

- An external healthcare quality manager downloads the PWA, completes the setup wizard, plays for 25 minutes, walks away knowing one new thing they can apply on Monday — and would recommend it to a colleague.
- An academic running a quality-and-safety module assigns it as preparatory homework; students arrive in class having already done the apprentice-tier work.
- A Ruavira Collective consulting engagement starts with the client team playing it, giving everyone a shared vocabulary before the first workshop.

---

*End of v1 design plan. Council critique follows in `COUNCIL_REVIEW.md`.*
