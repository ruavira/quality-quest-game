# Council Review — Quality Quest design plan v1

**Date:** 2026-05-20
**Plan reviewed:** `DESIGN_PLAN.md` v1 (this same date)
**Council composition (5 parallel critics):**

1. **Senior Healthcare Quality Director (CPHQ-credentialed)** — clinical credibility, CPHQ blueprint fit, real-world workflow.
2. **Healthcare Data Analyst / SPC specialist** — Provost/Murray rigour, chart selection, signal interpretation.
3. **Instructional Designer (adult learning, serious games)** — pedagogy, assessment, learning-objective alignment.
4. **Game Designer / UX lead** — onboarding, retention, mechanics, session-2 abandonment risk.
5. **Equity / Accessibility / LMIC implementation specialist** — bandwidth, iOS PWA, screen-reader/keyboard chart a11y, global scenario fit.

Each was given the full plan, instructed to be brutally honest, capped at 500 words, and asked for: 3 strengths, 5 weaknesses, 5 concrete recommendations, and one must-fix before MVP.

---

## What the council agreed on (convergent findings)

Five independent critics surfaced the same patterns repeatedly — these are the highest-confidence items to fix.

### CON-1. Onboarding is a cliff, not a ramp.
*(Game designer, instructional designer, equity specialist)*
Five wizard steps + a six-item placement quiz + a map view = ~70 decisions before scenario 1. For a stolen-lunch-break audience, that's fatal. Time-to-first-scenario should be ≤ 60 seconds.

### CON-2. MVP is over-scoped.
*(Game designer, CPHQ practitioner)*
24 scenarios + 5 item types + adaptive engine + path engine + 4 SVG chart renderers + PWA + WCAG AA + a full capstone in ~3 weeks is two MVPs stapled together. The capstone alone is a v1.5 feature.

### CON-3. Learning objectives are implicit, not declared.
*(Instructional designer — the must-fix for that lens)*
No observable LOs per module-tier. Without them, item-to-LO alignment is unverifiable, debriefs drift, tier transitions can't be criterion-referenced, and the certificate cannot be defended.

### CON-4. Patient safety (Module C) is dangerously thin.
*(CPHQ practitioner — the must-fix for that lens)*
3 MVP scenarios cannot responsibly cover RCA2 + FMEA + Just Culture + safety culture surveys. "Just Culture = don't pick blame-first answers" trivialises the most-misunderstood concept in the field.

### CON-5. SPC chart taxonomy is too sparse and run-chart rules are conflated.
*(SPC analyst — the must-fix for that lens)*
A single generic `controlChart.js` cannot teach the right chart for the data structure (p/u/c/I-MR/g/t are different beasts). Run-chart "rules of 8" is referenced once, never enumerated. Targets on control charts hazard not flagged.

### CON-6. Adaptive difficulty rewards the wrong behaviours.
*(CPHQ practitioner, instructional designer, game designer)*
"Two wrong → drop, three fast-correct → promote" rewards speed and streaks. The right behaviour for SPC is to *slow down* and check the operational definition. *Signal Spotter* should reward correct *non-calls* as much as correct calls.

### CON-7. Chart accessibility is the hardest problem and gets two sentences.
*(Equity specialist — the must-fix for that lens)*
There is no defined non-visual equivalent for HOT (hotspot/click-the-signal). Keyboard-only BUILD has no spec. Without solving this from scenario 1, the equity claim is hollow.

### CON-8. iOS Safari PWA is hand-waved.
*(Equity specialist)*
iOS has no `beforeinstallprompt`, only Share-sheet Add-to-Home-Screen, and storage can be evicted after 7 days idle. This silently breaks the offline promise for most iPhone users (which is most of LATAM and chunks of urban Africa).

### CON-9. LMIC framing is a toggle, not a content stream.
*(Equity specialist)*
One LMIC scenario per module + full pack deferred to v1.5 + Calgary-based authoring = US/Canada content in LMIC clothing. "Board report" ≠ "Directorate brief"; "CMO" ≠ "DHO".

### CON-10. CPHQ blueprint weights are asserted, not applied.
*(CPHQ practitioner)*
Uniform "3 scenarios per module" doesn't match the actual NAHQ CPHQ Detailed Content Outline weights. If exam prep is real audience, Modules D–F are under-served.

### CON-11. 8 simultaneous skill bars create perpetual incompleteness.
*(Game designer)*
8 half-finished progress meters are dead weight. One current-focus bar + a mastery ring works better.

### CON-12. WRITE rubric for operational definitions is a credibility landmine.
*(CPHQ practitioner)*
Keyword matching will pass sloppy definitions and fail correct unconventional ones. Replace with a structured-template constructor.

---

## What the council appreciated

- The NAHQ × IHI × WHO blend as curriculum scaffolding.
- The five-beat scenario rhythm (Brief → Exhibit → Task → Decision → Debrief).
- LMIC toggle + equity-stratified data as first-class wizard inputs.
- Anchoring badges to real-world artefacts (Operational Definition, Signal Spotter, Driver Diagrammer) → portfolio value.
- Tier-end confidence-vs-score calibration prompts (metacognitive scaffolding).
- 1.5 MB transfer budget, no D3, no font CDN, localStorage-only — right offline instincts.
- Transcript export + a future "professional mode" toggle as senior-pro objection insurance.

---

## What changes in v2 (high-confidence, no user fork needed)

These are mechanical fixes from convergent critique — applied without re-asking the user.

1. **LO map first.** Before authoring scenarios, write an explicit Learning Objective table per module-tier (observable verb, criterion, condition). Every scenario JSON declares the `lo_id` it assesses. Blueprint coverage becomes auditable. *(Fixes CON-3.)*
2. **Onboarding cut from 5 steps to 2.** Role + Setting only at start. Data interactions, data types, goal, and self-rated level deferred to a mid-game profile refinement after scenario 3. Time-to-first-scenario ≤ 60 s. *(Fixes CON-1.)*
3. **Linear path at MVP; map view to v1.0.** Ship a "next best scenario" card with a visible 12-card track. Drop the 4×2 module grid until enough content exists to justify it. *(Fixes CON-1 + CON-2.)*
4. **Chart type enum locked in the content schema.** `chartType ∈ {run, pChart, uChart, cChart, iMR, gChart, tChart, pareto, fishbone, driverDiagram, bar, table}`. No "controlChart" catch-all. *(Fixes CON-5.)*
5. **Run-chart rule enum locked.** `runChartRule ∈ {shift, trend, runs, astronomical}` (Provost & Murray edition specified in citation). Every signal-spotting debrief must name the rule and threshold. *(Fixes CON-5.)*
6. **Adaptive difficulty rewritten to be competency-based, not streak-based.** Demote only after two wrong items tagged to the same competency; promote on demonstrated coverage across ≥ 2 item types in the tier — not speed. Debrief explains the rule. *(Fixes CON-6.)*
7. **`Signal Spotter` redesigned.** Rewards true-negative recognition (correctly *not* declaring special cause when no rule fires) at parity with true-positive. *(Fixes CON-6.)*
8. **Skill bars: 1 current-focus + 1 mastery ring**, not 8 in parallel. *(Fixes CON-11.)*
9. **Streak counter removed.** Replaced with a `Reflective Practitioner` badge tied to quality of optional reflections. *(Fixes CON-6.)*
10. **WRITE deferred to vNext; BUILD promoted into MVP item-type set.** Operational-definition task becomes a structured constructor (numerator / denominator / inclusions / exclusions / data source / measurement window as discrete fields). BUILD also replaces ORDER in MVP (more distinctive, more shareable). *(Fixes CON-12 + game-designer marketing-asset point.)*
11. **Capstone cut from MVP.** Replaced with a 5-minute auto-generated "case file" summary of the player's last 3 scenarios. Real capstone re-spec'd for v1.5 as a two-session artefact with a 7-day gap. *(Fixes CON-2.)*
12. **Module F gets a mandatory "The board wants a target line" scenario at MVP**, inoculating against the single most common SPC misuse in leadership reporting. *(Fixes CON-5.)*
13. **Chart Accessibility Spec lifted to its own section.** Every chart ships with: (a) linearised `<table>` fallback with row/column headers, (b) "Describe this chart" text summary button, (c) keyboard equivalents for every chart interaction (arrow-key traversal of data points, Enter to select; for BUILD, a reorder-list alternative to drag). Tested with NVDA + VoiceOver before scenario 25. *(Fixes CON-7.)*
14. **iOS install path explicitly designed.** Detect iOS Safari, render Add-to-Home-Screen coach-mark, warn about 7-day eviction, ship a "Verify offline" self-test that re-caches on launch. *(Fixes CON-8.)*
15. **Glossary baked into scenarios.** "Board report ↔ Directorate brief"; "CMO ↔ Medical Director / DHO"; "Joint Commission ↔ Accreditation Canada / ISQua-aligned regulator." The active term is chosen by the player's setting. *(Fixes CON-9.)*
16. **Plain-language target lowered.** Grade 7 for UI chrome and L1 briefs; Grade 9 only for L3. *(Fixes CON-9.)*
17. **Colour token re-pick.** `--warn-600` and `--danger-600` reselected against `--paper-50` to clear 4.5:1 (text) and 3:1 (UI) on WCAG AA. Published Okabe-Ito mapping. Pattern fills required on *every* categorical chart series. *(Fixes equity specialist's palette gripe.)*
18. **Patient Safety content review workflow tightened.** Every Module C scenario debrief must cite either Reason's model, the Just Culture algorithm (Marx), or the IHI/WHO source — no generic "blame" debriefs. SME co-author named in scenario JSON. *(Fixes CON-4 partially — full fix depends on user fork below.)*

---

## Strategic forks the council surfaced — user decision required

These are real product decisions, not mechanical fixes. I'm flagging them for the user before implementation.

### FORK-A. Patient Safety module at MVP — expand or descope?
- **Option A1 (Council CPHQ pick):** Expand Module C to 6–8 scenarios at MVP with a named patient-safety SME co-author per debrief. Pushes MVP timeline by ~1 week.
- **Option A2:** Descope Module C from MVP entirely. Ship MVP as a *Data for Improvement* tool (Modules A + B + F + small slice of G/H), and add Module C as v1.5 with proper SME review.
- **Option A3 (compromise):** Keep Module C at 3 scenarios but restrict to *reading safety data* (incident report taxonomies, harm severity coding, safety culture survey interpretation). Move RCA2 + FMEA + Just Culture wholesale to v1.5.

### FORK-B. CPHQ exam prep — primary audience or aspirational?
- **Option B1:** Drop "I want to prepare for the CPHQ exam" from the goal picker at MVP. Position Quality Quest as a *working QI professional sharpening tool*, not a prep product. Keeps blueprint pressure off.
- **Option B2:** Keep CPHQ as a goal and re-weight MVP scenario distribution to match the NAHQ CPHQ Detailed Content Outline — which means more scenarios in D/E/F early and pushes MVP timeline out.

### FORK-C. LMIC content depth — aspirational or core?
- **Option C1 (Equity specialist pick):** Commit to ≥ 50% of MVP scenarios co-authored or context-reviewed by a practitioner currently working in an LMIC setting. Requires sourcing co-authors before scenario writing begins — adds calendar time, adds credibility.
- **Option C2:** Ship MVP with the LMIC toggle and *one* LMIC variant per module (12 of 24), authored by the Collective with explicit "context-reviewed by [name] pending v1.5" notes. Faster; weaker claim.

### FORK-D. Capstone in MVP — cut or keep small?
- **Option D1 (Council pick):** Cut full capstone from MVP. Auto-generate a 5-minute "case file" summary instead.
- **Option D2:** Keep a small capstone (10–15 min, single sitting, not the 30–45 min spec) at MVP.

### FORK-E. Branding — "Quality Quest" or a Ruavira-branded name?
- **Option E1:** Ship as "Quality Quest" (working title) — independent product, easier to extract from this repo later, doesn't tie reputational risk to Ruavira while the game is still maturing.
- **Option E2:** Ship as "Ruavira Improvement Lab" (or similar) — co-brands with the Collective from day one.

---

## Recommended v2 build sequence (if forks default to Council picks)

1. Write Learning Objective table (1 day).
2. Lock content schema with chart-type + rule enums (½ day).
3. Build the 2-step onboarding + linear 12-card path UI (1 day).
4. Build run-chart + p-chart + u-chart + I-MR + Pareto + fishbone + driver-diagram SVG renderers + accessible alternatives for each (3 days).
5. Build path engine + competency-based adaptive logic + scoring (1 day).
6. Author 18–20 scenarios (down from 24) with at least one Module F "target line" scenario and the run-chart-rule discrimination set (5 days).
7. PWA install + iOS Add-to-Home-Screen coach-mark + offline self-test (1 day).
8. NVDA + VoiceOver chart a11y pass (1 day).
9. Polish, certificate, transcript export, README finalisation (1 day).

≈ 13 working days, single-developer pace. Real-elapsed will be longer with content review cycles.

---

*This council review is a permanent artefact. v2 of the design plan will reference each council finding by its CON-/FORK- id.*
