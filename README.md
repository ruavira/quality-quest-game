# Quality Quest

Quality Quest is an offline-capable practice game for healthcare quality and patient-safety professionals. It turns data-for-improvement concepts into short scenarios with immediate, cited feedback.

## Current product

- 54 scenarios across eight modules and three tiers
- Eight item types: MCQ, hotspot, matching, ordering, construction, writing, branching, and answer-plus-reason
- Eight exhibit types represented in live content: run chart, p-chart, I-chart, Pareto, fishbone, driver diagram, bar chart, and table
- Role- and setting-weighted learning paths
- Different-example remediation after two misses on a competency
- Promotion after correct evidence across at least two question types
- Fourteen-day review scheduling for missed or fragile skills
- Evidence-based badges with visible criteria
- A portfolio-style Case File that includes attempts, developing competencies, demonstrated competencies, reflections, and recent scenarios
- Local-only gameplay state and learner-controlled JSON export
- Installable PWA with offline caching after a successful first load

Quality Quest is a learning tool, not a credential or clinical system.

## Privacy and access

Gameplay profile, answers, reflections, review dates, and badges are stored in the browser's local storage. The application has no gameplay backend or analytics integration.

The current pilot is hosted behind Cloudflare Access. First access may therefore require an authorized email and creates normal Cloudflare access logs. Once the application reports a successful load and its service worker has cached the content, it can operate offline.

## Run locally

```bash
npm run dev
```

Then open `http://localhost:5174`.

## Validate

```bash
npm run check
```

The checks validate scenario structure, identifiers, citations, terminology placeholders, module coverage, JavaScript syntax, and adaptive-engine behavior.

## Repository and deployment

This repository was reconstructed from an immutable Cloudflare Pages deployment after the original working tree could not be located. See [RECOVERY_PROVENANCE.md](RECOVERY_PROVENANCE.md).

The intended release flow is:

1. Feature branch and pull request
2. Automated validation
3. Cloudflare preview deployment
4. Human review
5. Merge to `main`
6. Production deployment tied to the merged commit

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

## Content principles

- Improvement, not punishment
- Mastery across contexts, not speed
- Cited feedback, not reproduced proprietary curriculum
- Context-aware healthcare language
- Text and table alternatives for visual exhibits
- No streaks, lives, or leaderboards
- Learner-controlled sharing

## License

MIT. See [LICENSE](LICENSE).
