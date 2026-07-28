# Deployment

## Cloudflare Pages

- Project: `quality-quest`
- Output directory: repository root
- Production branch: `main`
- Build command: none
- Production alias: `https://quality-quest.pages.dev/`

Cloudflare Access currently protects the production alias. Immutable deployment subdomains are used for recovery and verification.

## Release procedure

1. Run `npm run check`.
2. Create a pull request and review its Cloudflare preview.
3. Verify onboarding, remediation, promotion, review queue, Case File, keyboard charts, phone layout, and offline reload.
4. Merge to `main` only after checks pass.
5. Verify that production identifies the expected commit and service-worker cache version.

Direct uploads are an emergency fallback only. If used, record the source commit and deployment ID in the release notes.

