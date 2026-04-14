# Railway Deployment Guide

Last updated: 2026-04-14

This guide is for deploying the backend API from the shared monorepo to Railway with:

- Railway-hosted Nest API
- persistent SQLite volume
- Cloudflare R2 image hosting
- Sweetbook sandbox credentials kept as Railway secrets

## Why This Shape

- The repository is a monorepo, so Railway must build from the repository root.
- The backend runtime still lives in `apps/api`.
- SQLite must sit on a mounted volume so redeploys do not erase season-book projects and shipping data.
- Public image URLs should come from Cloudflare R2 in deployed mode, not Railway local disk.

## Files Added For Railway

- `apps/api/Dockerfile`

This Dockerfile assumes the Railway deploy context is the repository root and that Railway is told to use `apps/api/Dockerfile` as the Dockerfile path.

## Required Railway Variables

Set these on the Railway service before the first real deployment:

```text
RAILWAY_DOCKERFILE_PATH=apps/api/Dockerfile
NODE_ENV=production
DATABASE_URL=file:/data/dev.db
WEB_ORIGIN=https://your-frontend-domain.example.com
SWEETBOOK_API_BASE_URL=https://api-sandbox.sweetbook.com/v1
SWEETBOOK_API_KEY=<Sandbox API key>
SWEETBOOK_ESTIMATE_MODE=auto
SWEETBOOK_ORDER_MODE=local
SWEETBOOK_WEBHOOK_SECRET=<optional for deployed webhook verification>
SWEETBOOK_BOOK_SPEC_UID=SQUAREBOOK_HC
SWEETBOOK_COVER_TEMPLATE_UID=4MY2fokVjkeY
SWEETBOOK_CONTENT_TEMPLATE_UID=3FhSEhJ94c0T
SWEETBOOK_BLANK_TEMPLATE_UID=2mi1ao0Z4Vxl
SWEETBOOK_PUBLISH_TEMPLATE_UID=75vMl9IeyPMI
UPLOAD_STORAGE_DRIVER=r2
R2_ACCOUNT_ID=<Cloudflare account id>
R2_ACCESS_KEY_ID=<R2 access key id>
R2_SECRET_ACCESS_KEY=<R2 secret access key>
R2_BUCKET=<R2 bucket name>
R2_PUBLIC_BASE_URL=<public R2 base url>
```

Notes:

- `PORT` does not need to be fixed manually. Railway injects it.
- Keep `SWEETBOOK_ORDER_MODE=local` until you intentionally want sandbox order placement again.
- `WEB_ORIGIN` should be the deployed frontend URL. Localhost is already covered only for local development.

## Required Railway Volume

Create one volume and mount it at:

```text
/data
```

Reason:

- the backend reads `DATABASE_URL=file:/data/dev.db`
- `npm run db:init` runs automatically on container start
- the SQLite file survives redeploys as long as the volume stays attached

## Recommended Deployment Flow

Run these commands from the repository root:

```powershell
npx -y @railway/cli login
npx -y @railway/cli init --name sweetbook-api
npx -y @railway/cli add --service api
npx -y @railway/cli link --service api
```

Then set service variables:

```powershell
npx -y @railway/cli variable set --service api RAILWAY_DOCKERFILE_PATH=apps/api/Dockerfile NODE_ENV=production DATABASE_URL=file:/data/dev.db SWEETBOOK_API_BASE_URL=https://api-sandbox.sweetbook.com/v1 SWEETBOOK_ESTIMATE_MODE=auto SWEETBOOK_ORDER_MODE=local UPLOAD_STORAGE_DRIVER=r2
```

Set secret values one by one so they do not end up in shell history dumps:

```powershell
npx -y @railway/cli variable set --service api SWEETBOOK_API_KEY=...
npx -y @railway/cli variable set --service api R2_ACCOUNT_ID=...
npx -y @railway/cli variable set --service api R2_ACCESS_KEY_ID=...
npx -y @railway/cli variable set --service api R2_SECRET_ACCESS_KEY=...
npx -y @railway/cli variable set --service api R2_BUCKET=...
npx -y @railway/cli variable set --service api R2_PUBLIC_BASE_URL=...
```

Create and attach the persistent volume:

```powershell
npx -y @railway/cli volume add --service api --mount-path /data
```

If Railway asks for a separate attach step, attach the created volume to the `api` service.

Deploy:

```powershell
npx -y @railway/cli up --service api .
```

## First Verification Checklist

After deploy:

1. Open the Railway-generated service domain.
2. Check `GET /health`.
3. Upload one image through `POST /uploads/image` and confirm the response URL points to the R2 public base URL.
4. Run one `POST /season-books/estimate` request with a public cover URL.
5. Confirm Railway logs show `db:init` succeeded on startup.

## Important Behavior Difference From Local

- Local development may fall back to `apps/api/.env.example` when `.env` is absent.
- Railway production does not rely on that fallback and should use real service variables instead.
- This prevents placeholder values from silently masking missing production secrets.
