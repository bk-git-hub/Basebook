# Basebook API

Nest-based backend for the Sweetbook take-home app.

## Local Run

From the repository root:

```powershell
npm install
npm run start:dev -w apps/api
```

Default local behavior:

- port `4000`
- local SQLite database
- local CORS for `localhost` and `127.0.0.1` on ports `3000` through `3010`
- local upload storage unless R2 is configured

If `apps/api/.env` is missing, local commands can fall back to `apps/api/.env.example`.

## Useful Commands

Run from `apps/api` unless noted.

```powershell
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run db:init
npm run r2:check
npm run sweetbook:check
```

## Environment Notes

Main file:

- `apps/api/.env`

Template:

- `apps/api/.env.example`

Important production-like settings:

- `DATABASE_URL`
- `WEB_ORIGIN`
- `SWEETBOOK_API_KEY`
- `SWEETBOOK_ESTIMATE_MODE`
- `SWEETBOOK_ORDER_MODE`
- `UPLOAD_STORAGE_DRIVER`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

## Current Backend Scope

- `GET /health`
- `GET /games`
- `/entries` CRUD
- `POST /uploads/image`
- `POST /season-books/estimate`
- `POST /season-books/order`
- `GET /season-books/:projectId/status`
- `POST /season-books/:projectId/cancel`
- `PATCH /season-books/:projectId/shipping`
- `POST /webhooks/sweetbook`
