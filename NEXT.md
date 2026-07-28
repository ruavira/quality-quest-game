# Quality Quest — v1.0 / v1.5 / vNext queue

Lives alongside `DESIGN_PLAN_V2.md`. This file captures **directives the user gave after the MVP shipped**, so they don't get lost between sessions. Last updated 2026-05-20.

---

## Locked decisions (after MVP)

### Credential-prep goals (v1.5)

When the goal picker is re-introduced in v1.5, it must offer **both** credentials as separate goals — not a generic "credential prep" lump:

- **CPHQ** — Certified Professional in Healthcare Quality (NAHQ). Targets the broad QI workforce. Requires re-weighting scenario distribution to match the NAHQ CPHQ Detailed Content Outline (more depth in Modules D / E / F).
- **CPPS** — Certified Professional in Patient Safety (CBPPS, IHI-affiliated). Targets patient-safety officers, risk managers, infection preventionists. **Gated on Module C v1.5** shipping first (RCA2 / FMEA / Just Culture / safety event management / human factors).

**Ordering rule:** ship CPHQ and CPPS *together* in v1.5 once Module C is full-depth. If Module C work lands before Modules D + E, CPPS may ship first and CPHQ follow with v1.0 module work. Decide deliberately when v1.5 planning starts.

### Accreditation bodies for Module E v1.0

Module E (Regulatory & Accreditation) is deferred to v1.0. When it ships, scenarios should anchor on **one body per scenario** rather than render the same scenario in nine variants. The body list:

| Body | Region / focus | Anchor scenario theme |
| --- | --- | --- |
| **SQHN** — Society for Quality in Healthcare in Nigeria | Nigeria — accreditation body with ISQua-IEEA-accredited standards | Survey preparation against SQHN standards; data submission to maintain accreditation; reading an SQHN survey report |
| **COHSASA** — Council for Health Service Accreditation of Southern Africa | Southern Africa | Survey preparation; standards-based data submission |
| **SafeCare** (PharmAccess Foundation) | West / East / Southern Africa | Stepwise standards uptake; SafeCare assessment data |
| **NHIA** — Nigeria Health Insurance Authority | Nigeria | Insurance-tied facility accreditation data |
| **ISQua-IEEA** — International Society for Quality in Healthcare External Evaluation Association | Global meta-reference | Standards-of-standards; cross-recognition |
| **Joint Commission** | United States | JCI International Patient Safety Goals; ORYX-style core measures |
| **Accreditation Canada (Diamond)** | Canada | ROP (Required Organizational Practices) data |
| **CQC** — Care Quality Commission | England | KLOE / Single Assessment Framework data |
| **ACHS** — Australian Council on Healthcare Standards | Australia / Hong Kong | EQuIP standards data |

**SQHN treatment note:** SQHN is a Nigerian healthcare accreditation body whose standards have been accredited by **ISQua-IEEA** (the meta-accreditor that accredits the accreditors). SQHN's standards are used to survey hospitals and other healthcare providers, putting SQHN in the same operational class as COHSASA, SafeCare, JCI, etc. — a full survey/accreditation body, not merely a professional society or standards reference. ISQua-IEEA accreditation of SQHN's standards is itself worth weaving into scenarios (it places a national accreditor at international parity with the major bodies, and is a relatively small global club).

**Implementation rule:** at least one scenario per body in Module E v1.0. Plus one "cross-recognition" scenario referencing ISQua-IEEA as the meta-standard.

**Authorship privacy rule (applies to all modules, not just E):** scenario `authors` field stays generic — "Quality Quest core", "Collective contributor", or a non-identifying role descriptor. Do not surface individual names publicly anywhere in the repo (README, design docs, scenario JSON, commit messages). Internal review sign-off can still happen — it just doesn't ship to the published artefact or the repo's plain-text files.

---

## v1.0 queue (in priority order)

1. **Module E (Regulatory & Accreditation)** — ≥ 9 scenarios anchored on the body list above. Locked enums in scenario JSON: `accrediting_body` field added to schema.
2. **Module D (Quality Review & Accountability)** — requires the chart-abstraction BUILD interface first. Likely 6-8 scenarios on chart audit design, abstraction reliability, peer review, M&M.
3. **Chart-abstraction BUILD interface** — new UI component for simulated chart-audit data entry; unblocks Module D scenarios at depth.
4. **Architect-tier scenarios** in Modules D–H (~10 scenarios).
5. **Map view (4×2 module grid)** — replaces the linear 12-card path once content density justifies the navigation complexity.
6. **Item-difficulty calibration** (local-only; no cohort sync at v1.0).

## v1.5 queue

**Locked decisions (2026-05-20 planning session):**
- WRITE rubric: self-scored in-scenario (stage 1 = write, stage 2 = check rubric), not LLM-graded. Pass mark = 5/6 criteria. ✅ shipped.
- Module C v1.5: internal draft first, named SME gates review before v1.5 tag ships.
- Capstone: self-assessed model — learner marks their own artefact against the rubric. No facilitator screen.
- CPHQ goal: pending NAHQ Detailed Content Outline percentages to set blueprint weights.
- CPPS goal: gated on Module C v1.5 content landing.

1. **Module C v1.5** — full Patient Safety (RCA2, FMEA, Just Culture, safety event management, human factors). ✅ *Shipped 2026-05-20.* 5 new scenarios: C2-rca2, C2-fmea, C3-just-culture, C3-safety-events, C3-human-factors. LOs C.2.2–C.3.3 added. *SME clinical review pending — `context_review_pending: true` on LMIC-framed scenarios (C2-rca2, C3-safety-events, C3-human-factors).*
2. **CPHQ + CPPS goals re-introduced** in the goal picker, with blueprint-weighted scenario distribution. *CPPS gated on Item 1. CPHQ pending NAHQ blueprint percentages.*
3. **Two-session capstone** — 7-day-gap real artefact (charter + measurement plan → data collection → board / directorate report). Self-assessed model; learner scores against printable rubric.
4. **Translation** — English → French → Swahili → Portuguese → Spanish. Professional medical translation review per language *before* shipping. *Budget owner: TBD.*
5. **WRITE rubric grading** for operational definitions. ✅ *Shipped 2026-05-20.* LO A.2.4 added. Scenario: `A2-opdef-write.json` (TB sputum turnaround, lower_resource). itemType `WRITE` added to schema enum.

## vNext (no committed timeline)

1. **Facilitator mode** — cohort import/export, group debrief deck.
2. **Item difficulty calibration with cohort sync** (Supabase or local-first sync).
3. **Print-friendly facilitator deck PDF** — auto-generated from a module's scenarios.
4. **Web Share API** — "send this scenario to a colleague" sharing.
5. **Hausa / Yoruba / Igbo / Amharic / Arabic** translation exploration.

---

## Out-of-scope / not planned

- Streak counters and leaderboards (game-designer council critique CON-6 — bad incentives for SPC mental models).
- Free-text WRITE grading via LLM in production (privacy + offline are non-negotiable; offline LLM eval is not viable at MVP-class device budgets).
- Multi-user real-time play (not the audience).

---

## DFQI Part 1 alignment (added 2026-07-26)

Three scenarios added so Quality Quest drills exactly what the rebuilt DFQI Part 1 ("Signal or Noise? / From Metric to Chart / From Chart to Boardroom") now teaches. These complement the existing family-of-measures coverage (B1, B2, F1 already teach outcome/process/**balancing**).

| Scenario | Module / LO | Item type | Restored Part-1 concept it drills |
| --- | --- | --- | --- |
| `A2-signal-vs-noise` | A / **A.2.5** | DEFEND (run chart, no rule fires) | Signal vs noise; **don't tamper** / the two-point trap (correct answer = keep watching, change nothing) |
| `F2-frame-collision` | F / **F.2.2** | DEFEND (run chart, shift) | Improvement-vs-judgment **frame collision**; Solberg's three faces; the reframe |
| `H2-board-onepager` | H / **H.2.1** | MCQ | **One Chart · One Paragraph · One Decision**; the decision-asked sentence (one verb, one time horizon) |

New citation added: `solberg_1997`. New LO ids (`A.2.5`, `F.2.2`, `H.2.1`) should be reflected in `DESIGN_PLAN_V2.md` §3 at the next design-doc pass. Verified: `lint:scenarios` OK; the no-signal chart provably fires no rule; the frame-collision chart provably contains a ≥6 shift.

**Signal-recognition hotspots added (2026-07-26):** `A2-runchart-trend` (LO **A.2.6**, HOT — click the ≥5 rising run) and `A2-runchart-astronomical` (LO **A.2.7**, HOT — click the lone outlier). With the existing `A2-runchart-shift`, all three "find-the-signal" hotspots (shift / trend / astronomical) now exist. `lint:scenarios` OK at **44 scenarios**; a headless audit confirms every scenario passes the UI's per-item scoring contract, all glossary tokens + citations resolve, and the path builder yields valid unique paths.

**Signal Recognition reinforcement pack added (2026-07-26)** — 7 scenarios targeting run-chart rules (the cohort's weakest area): `A1-signal-name-shift` (A.1.3, MCQ name-the-signal = shift), `A1-signal-name-none` (A.1.4, MCQ = no signal / don't tamper), `A2-runchart-trend2` (A.2.8, HOT — 2nd trend, falling lab-TAT), `A2-shift-direction` (A.2.9, DEFEND — an *undesirable* upward shift; direction matters), `A2-enough-data` (A.2.10, MCQ — only 6 points, need ~10–12), `A2-runs-rule` (A.2.11, MCQ — the technical runs/lookup-table rule), `A1-median-on-line` (A.1.5, MCQ — points on the median are skipped). `lint:scenarios` OK at **51 scenarios**; headless audit 0 defects; each new chart's signal verified programmatically (shift = run of 8; trend2 = 6-point strictly-falling run; no-signal charts fire nothing; the 6-point chart flagged as too-few). Module A now has 4 hotspots + a full name-the-signal set. A11y bug in `src/charts.js` `makeTable` fixed the same day (empty td values) — verified live.

---

*Append future user directives here as they arrive. Maintained alongside `DESIGN_PLAN_V2.md` and `COUNCIL_REVIEW.md`.*
