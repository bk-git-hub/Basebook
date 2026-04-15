# Basebook

Basebook is a web service for baseball fans who want to record each game's emotions, photos, and context, then turn a season of memories into a printed book.

## Service Overview

### What it is

Basebook helps baseball fans keep a game-by-game journal and convert selected entries into a season book.

### Who it is for

- KBO fans who regularly follow one team
- fans who want to save both stadium visits and at-home viewing memories
- users who want a structured journal first and a printed keepsake second

### Core features

- season dashboard with seeded demo entries
- game candidate lookup by date and favorite team
- diary entry create / read / update flows
- image upload flow for diary entries
- season book estimate flow
- season book order flow
- order status, shipping update, and order cancel flow

## Tech Stack

| Area | Stack |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Nest.js, TypeScript |
| Database | Prisma, SQLite |
| Shared contracts | workspace package in `packages/contracts` |
| Testing | Vitest, Playwright, Jest, Supertest |
| External integration | Sweetbook Book Print API |

## Repository Structure

- `apps/web` - Next.js frontend
- `apps/api` - Nest.js backend
- `packages/contracts` - shared request/response types
- `data` - demo datasets used for local execution
- `tests/web` - frontend QA workspace
- `docs` - planning, reference, and presentation documents

## Local Run

### 1. Install dependencies

```powershell
npm install
```

### 2. Prepare environment variables

Basebook can run in local demo mode with the fallback values in `apps/api/.env.example`, but it is safer to create a real local env file before running.

PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

macOS / Linux:

```bash
cp apps/api/.env.example apps/api/.env
```

Optional frontend override:

```powershell
Copy-Item .env.example .env
```

### 3. Add your Sandbox API key

Edit `apps/api/.env` and set:

```env
SWEETBOOK_API_KEY=your_real_sandbox_api_key
```

Notes:

- The backend falls back to `apps/api/.env.example` when `.env` is missing in local development.
- The default setup uses `UPLOAD_STORAGE_DRIVER=local` and `SWEETBOOK_ORDER_MODE=local`, so the app can be executed immediately even without external storage.
- To test real Sweetbook Sandbox ordering end-to-end, you need:
  - a valid `SWEETBOOK_API_KEY`
  - `SWEETBOOK_ORDER_MODE=sandbox`
  - a publicly reachable image URL for the season book cover and uploaded photos
  - public image hosting such as R2 if you want uploaded local files to be usable by Sweetbook

### 4. Run the app

```powershell
npm run dev
```

Expected local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

### 5. What should work right after boot

- SQLite schema initialization runs automatically on backend start
- demo game and diary data are available immediately
- you can open the season dashboard and journal routes without creating an account
- the local estimate/order flow works even before real Sandbox ordering is enabled

## Test Commands

### Unit and backend tests

```powershell
npm run test
```

### Frontend Playwright E2E

If Playwright browsers are not installed yet:

```powershell
npx playwright install
```

Then run:

```powershell
npm run test:web:e2e
```

## Main Routes

- `/` - landing page
- `/season` - season dashboard
- `/entries/new` - create a diary entry
- `/entries/[id]` - entry detail
- `/entries/[id]/edit` - entry edit
- `/season-book/new` - season book estimate flow
- `/order/[projectId]` - order entry point
- `/order/[projectId]/status` - order status view

## Book Print API Usage

The backend integrates with the following Sweetbook endpoints.

| API | Usage in Basebook |
|---|---|
| `GET /book-specs` | retrieve available book spec metadata for season book generation |
| `GET /templates` | inspect template availability and readiness |
| `GET /credits` | check Sandbox readiness and available credit state |
| `POST /books` | create a season book draft |
| `POST /books/{bookUid}/cover` | create the season book cover |
| `POST /books/{bookUid}/contents?breakBefore=page` | insert entry pages into the book |
| `POST /books/{bookUid}/finalization` | finalize the generated book before pricing |
| `POST /orders/estimate` | estimate the season book order price |
| `POST /orders` | place the season book order |
| `GET /orders/{orderUid}` | poll the order status |
| `POST /orders/{orderUid}/cancel` | cancel a placed order |
| `PATCH /orders/{orderUid}/shipping` | update shipping information before shipment |

## AI Tool Usage

| AI tool | How it was used |
|---|---|
| Codex | API analysis, product planning, React/Nest implementation support, test scaffolding, and QA assistance |

## Design Intent

### Why this service

Sweetbook already provides strong book-making and fulfillment capabilities. Basebook focuses on the part before printing: helping fans accumulate meaningful game records over an entire season.

The service was chosen because baseball fandom naturally creates structured, repeatable moments worth recording:

- game date
- favorite team and opponent
- score and result
- stadium and seat context
- photos
- personal highlights and emotions

That makes baseball journaling a strong fit for a "service first, print second" product.

### Business potential

The first monetization point is season book ordering.

Possible expansion paths:

- special edition books for playoffs or away-game trips
- fan community features around shared season memories
- automatic data enrichment from public baseball sources
- premium physical keepsake products around fandom rituals

### If I had more time

- stronger visual polish and branding
- richer public-image upload path for real Sandbox ordering
- more robust order history and webhook-based status syncing
- broader automated E2E coverage for season book and order failure cases
- team- and stadium-specific discovery features
