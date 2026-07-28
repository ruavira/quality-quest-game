# Quality Quest — Design Plan v2 (post-council)

**Date:** 2026-05-20
**Supersedes:** `DESIGN_PLAN.md` (v1) where the two disagree.
**Incorporates:** `COUNCIL_REVIEW.md` (CON-1 through CON-12) and the user's resolutions on FORK-A, B, C, D, E.

> This file lists only the **changes** from v1. Anything in v1 not contradicted here still holds. Read v1 first for the full curriculum scaffolding and architectural rationale.

---

## 1. Locked product decisions (post-fork)

| Fork | Decision | What it means in build |
| --- | --- | --- |
| **FORK-A** Patient Safety scope | **A3 read-only at MVP.** Module C covers reading safety data (incident taxonomies, harm severity, safety-culture survey interpretation) only. RCA2 / FMEA / Just Culture → v1.5. | Module C MVP: 3 scenarios, all Tier 1–2, all "read & interpret," no decision items about RCA/FMEA process. |
| **FORK-B** CPHQ goal | **B1 dropped at MVP.** Quality Quest positions as a working-QI-professional sharpening tool, not exam prep. CPHQ goal returns in v1.5 with blueprint-weighted distribution. | Goal picker drops the "I want to prepare for the CPHQ exam" option. README disclaims explicitly. |
| **FORK-C** LMIC depth | **C2 default.** Toggle + 1 LMIC variant per module at MVP, with `context_review_pending` flag in scenario JSON. Upgrade path to C1 (≥ 50% LMIC-authored) earmarked for v1.5. | At least 4–5 of the 18 MVP scenarios carry a `setting_variant: "lower_resource"` tag with explicit LMIC framing. |
| **FORK-D** Capstone | **D1 cut.** Replaced by a 5-minute auto-generated "Case File" summarising the player's last 3 scenarios + their reflection. | One template, populated client-side, downloadable as `.txt` and printable as PDF via browser print. No multi-stage capstone code at MVP. |
| **FORK-E** Branding | **E1 Quality Quest, independent.** | Own identity, own palette (teal-leaning clinical), README acknowledges Ruavira as publisher but the product is not Ruavira-branded. |

---

## 2. Mechanical fixes applied (from COUNCIL_REVIEW.md)

All 18 of the high-confidence convergent fixes are adopted. Highlights:

- **CON-1 / CON-2** → 2-step onboarding (Role + Setting), placement quiz removed, linear 12-card path at MVP (map view deferred to v1.0). Mid-game profile refinement after scenario 3.
- **CON-3** → LO table written *before* scenarios (§3 below). Every scenario JSON declares `lo_id`.
- **CON-5** → `chartType` and `runChartRule` enums locked in the content schema (§4 below). No generic `controlChart`.
- **CON-6** → Adaptive logic is competency-based, not streak-based. `Signal Spotter` rewards true-negative non-calls.
- **CON-7** → Chart Accessibility Spec elevated to its own subsection (§5 below). Every chart ships with a linearised `<table>` fallback + a "Describe this chart" text summary + keyboard equivalents.
- **CON-8** → iOS Safari install path explicitly designed (Add-to-Home-Screen coach-mark + 7-day eviction warning + "Verify offline" self-test).
- **CON-11** → 1 current-focus skill bar + 1 mastery ring (8 simultaneous bars retired).
- **CON-12** → WRITE item type deferred to vNext; operational-definition tasks become a structured BUILD constructor.

---

## 3. Learning Objective table (MVP)

Each LO is keyed `M.<module>.<tier>.<n>` and is the **gate for tagging scenarios**. Every MVP scenario assesses exactly one LO. Bloom level in `[brackets]`.

### Module A — Reading the Data (Health Data Analytics)

| LO id | Tier | Objective | Bloom |
| --- | --- | --- | --- |
| A.1.1 | L1 | Given a run chart, the learner identifies the median, data points, and time axis correctly. | Remember |
| A.1.2 | L1 | Given a measure description, the learner identifies its numerator and denominator. | Understand |
| A.1.3 | L1 | Given a healthcare data scenario, the learner correctly distinguishes count vs classification vs continuous data. | Understand |
| A.2.1 | L2 | Given a run chart with ≥ 10 data points, the learner correctly applies Provost & Murray's shift rule (≥ 6 consecutive points on one side of the median) and the trend rule (≥ 5 consecutively increasing or decreasing). | Apply |
| A.2.2 | L2 | Given a data structure (count of events vs proportion of classifications vs individual continuous values), the learner selects the appropriate chart type from {run, pChart, uChart, iMR}. | Apply |
| A.2.3 | L2 | Given an operational definition draft, the learner identifies what is missing from {numerator, denominator, inclusions, exclusions, data source, measurement window}. | Analyze |
| A.2.4 | L2 | Given a measure description and setting, the learner constructs a complete operational definition covering all six components. *(v1.5 — assessed via WRITE item type with self-scored rubric)* | Create |

### Module B — Using the Data (Performance & Process Improvement)

| LO id | Tier | Objective | Bloom |
| --- | --- | --- | --- |
| B.1.1 | L1 | Given a quality improvement aim, the learner classifies a candidate measure as outcome, process, or balancing. | Understand |
| B.1.2 | L1 | Given a list of activities, the learner correctly orders the steps of one PDSA cycle. | Understand |
| B.2.1 | L2 | Given an aim statement, the learner constructs a balanced family of measures (1–2 outcome, 3–5 process, 1–2 balancing). | Apply |
| B.2.2 | L2 | Given a driver diagram skeleton, the learner places primary drivers and change ideas in the correct rows. | Apply |

### Module C — Reading Safety Data (Patient Safety)

| LO id | Tier | Objective | Bloom |
| --- | --- | --- | --- |
| C.1.1 | L1 | Given an incident report excerpt, the learner classifies the event by harm severity (no-harm / mild / moderate / severe / death). | Understand |
| C.1.2 | L1 | Given a safety-culture survey result, the learner identifies the lowest-scoring dimension and one plausible reason. | Analyze |
| C.2.1 | L2 | Given a set of incident reports, the learner constructs a Pareto-style ranking and identifies the top driver. | Apply |
| C.2.2 | L2 | Given an incident timeline with contributing factors, the learner categorises each factor as human, process, or system/organisational using the RCA² framework. | Analyze |
| C.2.3 | L2 | Given a set of failure modes with Severity, Probability, and Detectability scores, the learner ranks them by Risk Priority Number (RPN = S × P × D). | Apply |
| C.3.1 | L3 | Given a clinical incident description, the learner applies the Just Culture framework to classify the staff member's behaviour as human error, at-risk behaviour, or reckless behaviour. | Evaluate |
| C.3.2 | L3 | Given a narrated safety event management scenario, the learner identifies which stage of the reporting and learning cycle was omitted or broken. | Analyze |
| C.3.3 | L3 | Given a clinical incident narrative, the learner distinguishes latent system failures from the active human failures that triggered the event. | Analyze |

### Module F — Leading with Data (Quality Leadership & Integration)

| LO id | Tier | Objective | Bloom |
| --- | --- | --- | --- |
| F.1.1 | L1 | Given a board-facing dashboard, the learner identifies which measures are outcome vs process vs balancing. | Understand |
| F.2.1 | L2 | Given a board's request to "add a target line to a control chart," the learner identifies the request as a category error and proposes the correct visualisation (target on a run chart, or a separate target annotation). **(The mandatory anti-misuse scenario — CON-5 fix.)** | Evaluate |

### Module G — Population & Equity Data

| LO id | Tier | Objective | Bloom |
| --- | --- | --- | --- |
| G.1.1 | L1 | Given a measure result, the learner identifies when stratification (by language, deprivation, geography) would change the interpretation. | Understand |

### Module H — Communicating Data

| LO id | Tier | Objective | Bloom |
| --- | --- | --- | --- |
| H.1.1 | L1 | Given a chart and an audience, the learner picks the most appropriate visualisation (chart type + annotations) for that audience. | Apply |

**MVP scenario count:** **18 scenarios** mapped to **18 LOs** above. Distribution: A=6, B=4, C=3, F=2, G=1, H=2.

Modules **D (Quality Review & Accountability)** and **E (Regulatory & Accreditation)** are **deferred to v1.0** (CPHQ alignment is no longer the MVP positioning per FORK-B).

---

## 4. Content schema (locked enums)

```jsonc
{
  "id": "A2-runchart-shift",                   // module + tier + slug
  "module": "A",
  "tier": 2,
  "lo_id": "A.2.1",
  "itemType": "HOT",                          // MCQ | HOT | MATCH | ORDER | BUILD | WRITE | BRANCH | DEFEND
  "chartType": "run",                         // run | pChart | uChart | cChart | iMR | gChart | tChart | pareto | fishbone | driverDiagram | bar | table | none
  "runChartRule": "shift",                    // null | shift | trend | runs | astronomical
  "competency_tags": ["run_chart_rules", "signal_vs_noise"],
  "setting_variant": "lower_resource",        // null | lower_resource | higher_resource | any
  "stem": "Brief text...",
  "exhibit": { "kind": "svg-runchart", "data": [...] },
  // task shape depends on itemType:
  // MCQ:    { stem, options: [{ label, desc? }] }
  // HOT:    { stem }  — answer picks indices on the chart
  // MATCH:  { stem, items: [{ id, label }], categories: [{ id, label }] }
  // ORDER:  { stem, steps: [{ id, label }] }
  // BUILD:  { stem, fields: [{ id, label, placeholder?, options? }], buildType? }
  // WRITE:  { stem, context?, placeholder? }  — answer has rubric array + passingScore
  // BRANCH: { branches: [{ stem, options: [{ label, correct }] }] }
  // DEFEND: { stem, options, reasonStem, reasons }
  "task": { ... },                            // shape depends on itemType
  "answer": { ... },
  "debrief": {
    "correct": "...",
    "wrong": "...",
    "rule_cited": "Provost & Murray (2nd ed.) — Shift rule, 6 consecutive points",
    "citations": ["Provost & Murray ch. 4", "IHI QI 104"]
  },
  "authors": ["Quality Quest core"],
  "review": {
    "clinical": null,
    "statistical": null,
    "instructional": null,
    "plain_language": null,
    "context_review_pending": false           // true for LMIC variants until v1.5 review
  }
}
```

**Enum gate:** `itemType`, `chartType`, `runChartRule` are validated at scenario load time. Scenario fails to load (with a console warning) if values are out of enum.

---

## 5. Chart Accessibility Spec

Every chart renderer in `/src/charts/` exposes the same interface:

```js
renderChart(container, spec) → {
  svg: SVGElement,            // visual representation
  table: HTMLTableElement,    // linearised tabular fallback (always rendered, visually hidden by default, exposed to screen readers)
  describe(): string,         // text summary, populates the "Describe this chart" button
  focusable: NodeList,        // ordered list of keyboard-traversable elements
  onSelect(handler)           // for HOT items: keyboard or click select on a data element
}
```

**Keyboard model (uniform across chart types):**
- `Tab` enters the chart focus group.
- `Left/Right` arrows traverse data points along the time axis.
- `Up/Down` arrows traverse data series (for multi-series charts).
- `Enter` selects the focused element (used by HOT items).
- `D` opens the "Describe this chart" text summary.
- `T` toggles the table fallback to visible.

**Patterns + colour:** Every categorical series uses **both** a colour (Okabe-Ito derived) and a pattern (dot, cross-hatch, diagonal, solid). Never colour-only.

**Tested with:** NVDA on Firefox, VoiceOver on Safari, keyboard-only flow with the screen-reader off. Audit gate before scenario 25.

---

## 6. Onboarding flow (v2)

```
[Splash — single screen]
  ↓ (≤ 60s)
[Step 1: Role]            ← 1 click (multi-select up to 3, default "Any QI role")
  ↓
[Step 2: Setting]         ← 1 click (radio, default "Mixed")
  ↓
[Scenario 1]              ← Apprentice-tier A.1.1 (read a run chart)
  ↓
[Scenario 2]              ← Apprentice-tier B.1.1 (classify a measure)
  ↓
[Scenario 3]              ← Apprentice-tier A.1.2 (numerator/denominator)
  ↓
[Profile Refinement Card]  ← "Want to personalise further? Pick your data
                              interactions and data types in 30 seconds."
                              [Customise] [Keep playing]
  ↓
[Scenarios 4–18] (path adapts based on refinement, or continues linearly)
  ↓
[Case File auto-generated + Transcript export + Certificate]
```

**Time-to-first-scenario:** measured target ≤ 60 s. Reverify on every release.

---

## 7. Adaptive logic (v2 — competency-based)

```
on scenario_complete(s, correct):
  recordCompetencyAttempt(s.competency_tags, correct, timing)

  consecutiveWrongInTag = countConsecutiveWrong(tag)
  if any tag has consecutiveWrongInTag >= 2:
    nextScenario = pickRemediation(tag, oneTierBelow)
    showMessage("Let's slow down — here's a refresher on " + tag)

  coverageInTier = competencyCoverage(currentTier)
  if coverageInTier >= 2_item_types_correct_per_competency:
    promoteToNextTier()

  // Speed is never a promotion criterion.
```

- `Signal Spotter` badge: awarded for **5 correct signal calls + 5 correct non-calls** (not 5 in a row).
- No streak counter. No leaderboard.

---

## 8. PWA install — iOS Safari path

Pseudo-flow in `/src/ui/install.js`:

```js
if (isIOSSafari() && !isStandalone()) {
  showCoachMark({
    text: "To use Quality Quest offline, tap Share → Add to Home Screen.",
    illustration: "share-sheet-arrow.svg",
    dismiss: { remember_for_days: 7 }
  });
  scheduleEvictionReminder({ afterDaysIdle: 6, message: "Open Quality Quest at least once a week so iOS keeps your saved progress." });
}

if (hasBeforeInstallPrompt()) {
  // Chrome/Edge/Android — standard prompt
  showStandardInstallButton();
}

runOfflineSelfTest();  // On every launch: try to fetch the manifest from cache.
                       // If it fails, force re-cache before showing the home screen.
```

---

## 9. MVP build sequence (revised — ≈ 13 working days at single-developer pace)

| Day | Deliverable |
| --- | --- |
| 1 | LO table + content schema with enums; locked. |
| 2 | Design tokens + base layout + splash; iOS install coach-mark; service worker scaffolding. |
| 3–4 | Chart renderers: run, p-chart, I-MR, Pareto, fishbone, driver-diagram, bar, table (with accessible alternatives for each). |
| 5 | Onboarding (2 steps + refinement card) + state persistence + linear path UI. |
| 6 | Path engine + competency-based adaptive logic + scoring + badges (Signal Spotter true-positive/true-negative dual gate). |
| 7–11 | Author 18 scenarios against the LO table, with the mandatory Module F "target line" scenario. ≥ 4 carry an LMIC `setting_variant`. |
| 12 | Case File auto-generation + transcript JSON export + Certificate page. |
| 13 | NVDA + VoiceOver pass + WCAG colour-contrast pass + offline self-test verification + README polish. |

---

## 10. What is *not* in MVP (explicit list)

| Feature | Lives in |
| --- | --- |
| Capstone (full 30–45 min role-personalised) | v1.5 |
| Modules D (Quality Review) and E (Regulatory) | v1.0 |
| RCA2 / FMEA / Just Culture content (Module C advanced) | v1.5 |
| WRITE item type (free-text rubric grading) | vNext |
| Map view (4×2 module grid) | v1.0 |
| French / Spanish / Portuguese / Swahili translation | v1.5 |
| Facilitator mode (cohort import/export) | vNext |
| Item difficulty calibration with cohort sync | vNext |
| Tier 3 (Architect) scenarios in D–H | v1.0 |
| CPHQ exam goal + blueprint-weighted distribution | v1.5 |
| Streak counter, leaderboard | not planned |

---

## 11. Open user touchpoints

The build can proceed without further input. As authoring progresses, I may ask the user for:

- Real-world setting nuances (e.g., "what's the equivalent of HCAHPS in your Nigerian acute-care context?") on a per-scenario basis.
- Final certificate wording and signatories.
- Whether to publish at a public URL once MVP is playable.

---

*Council critique closed. v2 is the build-from spec.*

---

## Addendum (2026-05-20) — LMIC as the primary audience

User directive: the largest audience works in Africa and other LMICs. This addendum binds the build.

### A. Curriculum re-balancing
- **WHO Patient Safety Curriculum Guide** + **WHO *Handbook for National Quality Policy and Strategy*** are **equal primary** sources with NAHQ.
- **IHI Model for Improvement / Provost & Murray** remain the methodology spine (framework-neutral).
- **NAHQ HQ Essentials** drops to a **secondary** reference.
- The CPHQ exam goal stays deferred to v1.5 per FORK-B; no MVP positioning around it.

### B. Default setting flip
- **Default scenario settings** at MVP: district hospital, primary care clinic / health centre, MoH programme office, donor-funded clinical programme.
- HIC acute care becomes a `setting_variant: "higher_resource"` flag, not the default.
- **New settings** added to the wizard: faith-based / mission hospital, community / outreach, donor-funded clinical programme (HIV / TB / malaria).

### C. Role list addition
- Community Health Worker / CHEW
- PHC facility in-charge
- Programme officer (MoH / NGO)
- District / county / provincial quality lead
- Donor-funded programme M&E officer
- "Executive" reframed as **Senior leadership** with the displayed term (CMO / CNO / DHO / Medical Director / Programme Director) chosen by the player's setting.

### D. Vocabulary defaults (LMIC primary)
| Default term (LMIC) | Variant term (HIC) |
| --- | --- |
| Directorate brief / Programme review | Board report |
| Quarterly governance meeting | Board meeting |
| Medical Director / DHO | CMO / Chief Medical Officer |
| Patient experience survey | HCAHPS |
| Health Management Information System (HMIS) / DHIS2 | Electronic Health Record (EHR) |
| District / county / provincial | State / region |
| Accreditation body (COHSASA / SafeCare / ISQua-recognised) | The Joint Commission / Accreditation Canada |

Active term is selected at scenario render time from the player's `setting` profile. Stored in `/content/glossary.json`.

### E. Data realities embedded
Scenarios at MVP must include all of:
- At least 3 scenarios where the **data source is a paper register** or DHIS2 export, not an EMR query.
- At least 1 scenario where **data quality / completeness is the QI problem itself** (not the data being used to solve a problem).
- At least 1 scenario where **intermittent power / connectivity** is a balancing-measure or constraint.
- Equity-stratified data (urban/rural, wealth quintile, gender) is treated as **core** content in Module G, not a flag.

### F. Patient safety source-of-truth (Module C, read-only at MVP)
- Incident-report taxonomy uses the **WHO Conceptual Framework for the International Classification for Patient Safety (ICPS)**.
- Harm severity categories: **None / Mild / Moderate / Severe / Death** (ICPS).
- Safety-culture survey scenarios reference WHO topics 4 (Being an effective team player), 5 (Learning from errors), and 6 (Understanding & managing clinical risk) from the Multi-professional Curriculum Guide.

### G. Accreditation references (when surfaced)
- Default: COHSASA, SafeCare, ISQua-IEEA, NHIA (Nigeria), Council for Health Service Accreditation of Southern Africa.
- HIC variant: The Joint Commission, Accreditation Canada Diamond, ACHS Australia, CQC England.
- Module E (Regulatory) is post-MVP per §10.

### H. Tech budget (tightened for LMIC)
- **Total cached payload at MVP: ≤ 500 KB** (down from 1.5 MB).
- App shell ≤ 80 KB JS + ≤ 30 KB CSS + ≤ 200 KB content (initial 6 scenarios) + ≤ 30 KB icons + headroom.
- Tested at **2G network throttle on a low-end Android 7+** (1 GB RAM, 4-year-old chipset).
- **Time-to-interactive on first visit ≤ 5 s** at 2G; ≤ 1 s after install.
- **System font stack only at MVP.** No web fonts. Type tokens use `font-family` system stacks; one optional self-hosted serif may be added in v1.0 if budget allows.

### I. Plain-language target (tightened)
- **Grade 6** Flesch–Kincaid for L1 briefs and all UI chrome.
- Grade 7 for L2 briefs.
- Grade 8 maximum for L3 briefs.
- Banned by default: US/UK idioms ("rule of thumb", "the buck stops here", "circle back", "knock it out of the park", "table this discussion"); region-specific acronyms unless setting-tagged.
- Acronyms expanded on **first** use in every scenario.

### J. Translation priority (v1.5)
Revised order:
1. English (MVP)
2. **French** (West / Central Africa)
3. **Swahili** (East Africa)
4. **Portuguese** (Lusophone Africa)
5. Spanish
6. (v2.0 exploratory) Hausa, Yoruba, Igbo, Amharic, Arabic

### K. Touch-first UI
- All interactions must work without hover. No hover-only menus, no hover-only chart tooltips (charts must respond to tap and to keyboard arrow-traverse).
- Minimum touch target 44 × 44 px (already WCAG, restated).
- Pinch-zoom never disabled.
- Type scale has reserve for low-DPI screens (root font-size at 16 px; max-width on text columns to keep line length sane on small screens).

### L. Access / pricing posture
- README states explicitly that Quality Quest is **free for individual use** and that any institutional pricing — if introduced later — will not apply to **public-sector LMIC use**.
- No login wall, no email gate, no analytics gate. Install once, play offline forever.

### M. v1.5 translation cost flagged
- Professional medical-translation review (not crowd-translation) is required before any non-English language ships. Budget owner: TBD with the user once MVP is live.

---

*End of LMIC addendum. The build proceeds against v2 + this addendum.*
