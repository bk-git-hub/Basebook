# Backend Reminder

Last updated: 2026-04-14

This file is a quick restart note for the next backend work session.

## Read First

- `AGENTS.md`
- `BASEBOOK_TEAM_PLAYBOOK.md`
- `docs/AGENT_SYNC.md`
- `docs/planning/CONTRACT_SPEC.md`
- `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- `apps/api/DECISIONS.md`
- `apps/api/docs/backend_reminder.md`

## Role And Scope

- Work from the shared repository at `C:\Users\bksoft\Documents\Sweetbook`.
- Work on local `main`; do not create or rely on a separate worktree.
- Backend write scope is `apps/api/**`.
- Treat frontend paths, root config, and shared docs as read-only unless the user explicitly approves the cross-area change.
- Do not copy secrets from `apikey.txt`, `.env`, or environment variables into docs, commits, logs, or prompts.
- When discussing the Sweetbook key, call it `Sandbox API key`.

## Current Backend State

- API runs on port `4000` by default.
- CORS allows local frontend origins from `localhost:3000` through `localhost:3010`.
- `GET /health` is available.
- `GET /games` is available with three game states: `scheduled`, `in_progress`, `final`.
- `/entries` CRUD and photo metadata persistence are implemented.
- `POST /uploads/image` supports local file storage by default.
- Optional Cloudflare R2 storage is prepared for public image hosting.
- `POST /season-books/estimate` is implemented with local fallback and Sweetbook-backed `auto` mode.
- `POST /season-books/order` is implemented as a local order completion path for already estimated projects.
- `GET /season-books/:projectId/status` is implemented for order-progress polling, local shipping prefill, and optional Sweetbook order refresh.
- `POST /season-books/:projectId/cancel` is implemented for local cancellation history and Sweetbook-backed cancel calls when configured.
- `PATCH /season-books/:projectId/shipping` is implemented for pre-shipment address updates with local persistence and optional Sweetbook forwarding.
- `POST /webhooks/sweetbook` is implemented for async order-status sync; signature verification turns on when `SWEETBOOK_WEBHOOK_SECRET` is configured.
- Sweetbook sandbox readiness check script exists.

## Important Decisions

- `API-010`: Local upload first, but behind a replaceable storage interface.
- `API-011`: Season-book estimate endpoint first, with estimator boundary.
- `API-012`: Add Sweetbook client boundary and verify sandbox before full ordering.
- `API-013`: Use Sweetbook-backed estimate in `auto` mode when Sandbox API key and public image URLs are usable.
- `API-014`: Keep local upload default; add optional Cloudflare R2 image storage without adding a new SDK dependency in that slice.
- `API-015`: Implement the first order endpoint locally and keep real Sweetbook order placement as a follow-up decision.
- `API-016`: Add Sweetbook sandbox order wiring behind an explicit `SWEETBOOK_ORDER_MODE=sandbox` flag while keeping local order as the default.
- `API-020`: Keep cancelled orders as terminal order history instead of reopening the project for reorder by default.
- `API-021`: Persist season-book shipping info in SQLite and keep `db:init` auto-upgrading existing local databases.
- `API-022`: Expand the season-book status contract so the existing status response can also return shipping prefill data.
- `API-023`: Webhook signature verification is optional in local development and enforced when the webhook secret is configured.
- `API-024`: Railway is the chosen backend deployment target for the assignment demo; SQLite stays on a Railway volume and uploads should use Cloudflare R2 in deployed mode.

## Environment Notes

- Root secrets must not be copied into docs or commits.
- Backend env example lives at `apps/api/.env.example`.
- For local-only reviewer flow, keep `UPLOAD_STORAGE_DRIVER=local`.
- For R2 flow, Cloudflare values must be set:
- `UPLOAD_STORAGE_DRIVER=r2` or `UPLOAD_STORAGE_DRIVER=auto`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`
- `npm run r2:check` is expected to fail until those R2 values are configured.
- `SWEETBOOK_ESTIMATE_MODE=auto` can call Sweetbook only when the Sandbox API key is configured and image URLs are publicly fetchable.
- `SWEETBOOK_ORDER_MODE=local` keeps order completion local.
- `SWEETBOOK_ORDER_MODE=sandbox` can place Sweetbook sandbox orders and may deduct sandbox credits, so only enable it intentionally.
- `SWEETBOOK_WEBHOOK_SECRET` can stay blank for local development; when filled, incoming Sweetbook webhooks must pass HMAC-SHA256 signature verification.
- `npm run db:init` now also appends missing nullable shipping columns on existing local SQLite files, so old local DBs upgrade automatically without a manual reset.
- Railway deployment should use `DATABASE_URL=file:/data/dev.db` with a mounted `/data` volume.
- Railway deployment should set `UPLOAD_STORAGE_DRIVER=r2` so uploaded images are public and survive restarts independently of the API container.

## Last Verified Commands

Run from `apps/api` unless noted.

```powershell
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Last known result: all three passed on 2026-04-14 after the Railway deployment-prep slice.

## Known Open Backend Follow-Ups

- Real Sweetbook order placement is wired for sandbox mode, but production/live ordering remains a separate risk decision.
- After the user finishes Cloudflare setup, run `npm run r2:check` from `apps/api` to verify a real public image upload.
- If R2 check passes, test the frontend upload-to-estimate path again so Sweetbook can receive a public `coverPhotoUrl`.
- Railway deployment still requires Railway CLI login on the user's machine before the first real deploy can be executed.
- After the first Railway deploy, record the generated public API URL and use it to verify `GET /health` plus one real upload request.

## Next Session Suggested Start

1. Read `docs/AGENT_SYNC.md` and this file.
2. Run `git status --short --branch`.
3. If Railway login is ready, complete the first backend deploy using `apps/api/docs/railway-deploy.md`.
4. Verify the deployed `/health` endpoint and one R2-backed upload before moving to the next backend slice.
