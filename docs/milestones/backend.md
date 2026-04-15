# Basebook Backend Milestones

이 문서는 백엔드 마일스톤과 주요 상태 변화를 기록한다.

규칙:

- 시작, 완료, blocker, scope change, integration ready 상태를 기록한다.
- 길게 서술하지 말고 사실 중심으로 적는다.
- 사용자 검증 전에는 `done`으로 표기하지 않는다.
- 앞으로의 관련 결정은 `apps/api/DECISIONS.md`를 기준으로 참조한다.

---

## Template

### BE-MILESTONE-XXX

- Date: `YYYY-MM-DD`
- Time: `HH:MM`
- Milestone:
- Status: `planned | in_progress | blocked | ready_for_review | verified`
- Summary:
- Related Decision IDs:
- Blocking Items:
- Next Step:

---

## Log

### BE-MILESTONE-001

- Date: `2026-04-09`
- Time: `13:40`
- Milestone: Backend functional specification and contract-aligned API scope locked
- Status: `verified`
- Summary:
  - MVP endpoint surface locked
  - backend role boundary documented
  - contract ownership rule defined
- Related Decision IDs:
  - `API-001`
  - `API-002`
  - `API-003`
- Blocking Items:
  - worktree creation pending
- Next Step:
  - scaffold backend implementation and start Nest module work

### BE-MILESTONE-002

- Date: `2026-04-09`
- Time: `14:10`
- Milestone: Health endpoint implemented as a dedicated Nest module
- Status: `ready_for_review`
- Summary:
  - `GET /health` now returns the contract-aligned payload
  - health routing moved out of the Nest starter files into a dedicated module
  - unit test, e2e test, and build all passed
- Related Decision IDs:
  - `API-004`
- Blocking Items:
  - user verification pending
- Next Step:
  - start the `GET /games` slice

### BE-MILESTONE-003

- Date: `2026-04-09`
- Time: `14:10`
- Milestone: Games query endpoint implemented with seed-backed filtering
- Status: `ready_for_review`
- Summary:
  - `GET /games` now serves contract-aligned game candidates from `data/demo-games.json`
  - filtering by `favoriteTeam`, `date`, and `seasonYear` is in place
  - demo data now includes `SCHEDULED`, `IN_PROGRESS`, and `FINAL` examples
  - unit test, e2e test, and build all passed
- Related Decision IDs:
  - `API-005`
- Blocking Items:
  - user verification pending
- Next Step:
  - move to the entries slice after user confirmation

### BE-MILESTONE-004

- Date: `2026-04-09`
- Time: `18:04`
- Milestone: Local SQLite persistence and automatic demo seeding established
- Status: `ready_for_review`
- Summary:
  - Prisma client and SQLite schema were introduced for diary persistence
  - local database initialization now uses a deterministic `db:init` command
  - demo entries are automatically seeded when the database is empty
  - frontend and backend env examples are now split by app
- Related Decision IDs:
  - `API-006`
  - `API-007`
- Blocking Items:
  - user verification pending
- Next Step:
  - verify entries endpoints on top of the initialized database

### BE-MILESTONE-005

- Date: `2026-04-09`
- Time: `18:04`
- Milestone: Entries API implemented on SQLite-backed persistence
- Status: `ready_for_review`
- Summary:
  - `GET /entries`, `GET /entries/:id`, `POST /entries`, and `PATCH /entries/:id` are implemented
  - request validation is enabled through Nest validation pipes
  - unit test, e2e test, and build all passed with the new database flow
- Related Decision IDs:
  - `API-006`
  - `API-007`
- Blocking Items:
  - user verification pending
- Next Step:
  - prepare local frontend-backend integration and CORS review

### BE-MILESTONE-006

- Date: `2026-04-10`
- Time: `10:10`
- Milestone: Local frontend-backend integration defaults configured
- Status: `ready_for_review`
- Summary:
  - backend local default port is set to `4000`
  - local browser CORS now allows the frontend origin `http://localhost:3000`
  - API env example documents the integration defaults
- Related Decision IDs:
  - `API-008`
- Blocking Items:
  - user verification pending
- Next Step:
  - run the frontend against the local backend and verify browser requests

### BE-MILESTONE-007

- Date: `2026-04-10`
- Time: `10:55`
- Milestone: Local CORS widened for parallel frontend agents
- Status: `ready_for_review`
- Summary:
  - backend CORS now accepts `localhost` and `127.0.0.1` origins on ports `3000` through `3010`
  - non-local frontend hosts can still be allowed explicitly with `WEB_ORIGIN`
  - unit coverage was added for the local CORS allowlist helper
- Related Decision IDs:
  - `API-009`
- Blocking Items:
  - user verification pending
- Next Step:
  - re-run browser integration against whichever local frontend port is active

### BE-MILESTONE-008

- Date: `2026-04-14`
- Time: `12:33`
- Milestone: Season-book order status query contract locked
- Status: `ready_for_review`
- Summary:
  - shared contract now defines `GET /season-books/:projectId/status`
  - response shape includes current order state plus progress timeline steps for the order-status UI
  - frontend can start integrating against the fixed response before backend implementation lands
- Related Decision IDs:
  - `API-017`
- Blocking Items:
  - backend endpoint implementation pending
- Next Step:
  - implement `GET /season-books/:projectId/status` in `apps/api`

### BE-MILESTONE-009

- Date: `2026-04-14`
- Time: `13:05`
- Milestone: Order management and webhook contracts locked
- Status: `ready_for_review`
- Summary:
  - shared contract now defines order cancel, shipping update, and Sweetbook webhook receive endpoints
  - backend functional spec now treats order management and webhook sync as the next backend slice after status polling
  - cancel and shipping contracts were fixed before implementation to avoid another plan-versus-code drift
- Related Decision IDs:
  - `API-019`
- Blocking Items:
  - backend implementation pending for the three new endpoints
- Next Step:
  - implement `POST /season-books/:projectId/cancel` as the next smallest backend slice

### BE-MILESTONE-010

- Date: `2026-04-14`
- Time: `13:23`
- Milestone: Season-book order cancellation endpoint implemented
- Status: `ready_for_review`
- Summary:
  - `POST /season-books/:projectId/cancel` is now available
  - local orders can be cancelled into terminal history without reopening the project
  - Sweetbook cancel wiring is prepared for configured external orders
  - build, unit tests, and e2e tests all passed after Prisma client regeneration
- Related Decision IDs:
  - `API-020`
- Blocking Items:
  - user verification pending
- Next Step:
  - implement `PATCH /season-books/:projectId/shipping`

### BE-MILESTONE-011

- Date: `2026-04-14`
- Time: `14:05`
- Milestone: Season-book shipping update endpoint implemented
- Status: `ready_for_review`
- Summary:
  - `PATCH /season-books/:projectId/shipping` is now available
  - order-time shipping info is persisted into SQLite and can be updated before shipment
  - existing local SQLite files auto-upgrade missing shipping columns during `db:init`
  - build, unit tests, and e2e tests were rerun for the new slice
- Related Decision IDs:
  - `API-021`
- Blocking Items:
  - user verification pending
- Next Step:
  - implement `POST /webhooks/sweetbook`

### BE-MILESTONE-012

- Date: `2026-04-14`
- Time: `14:24`
- Milestone: Season-book status contract expanded for shipping prefill
- Status: `ready_for_review`
- Summary:
  - shared contract now allows `GET /season-books/:projectId/status` to include optional `shipping`
  - planning docs define the status response as the prefill source for the address-edit form
  - backend implementation is now expected to return saved shipping data through the existing status endpoint
- Related Decision IDs:
  - `API-022`
- Blocking Items:
  - backend implementation pending
- Next Step:
  - update `apps/api` status endpoint implementation to return stored shipping data

### BE-MILESTONE-013

- Date: `2026-04-14`
- Time: `14:37`
- Milestone: Season-book status endpoint returns shipping prefill data
- Status: `ready_for_review`
- Summary:
  - `GET /season-books/:projectId/status` now includes optional `shipping` when the project already has a saved address snapshot
  - unit and e2e coverage now verify the status response includes shipping after order placement and after cancellation
  - frontend can use the existing status query as the single source for both progress timeline and address form prefill
- Related Decision IDs:
  - `API-022`
- Blocking Items:
  - user verification pending
- Next Step:
  - implement `POST /webhooks/sweetbook`

### BE-MILESTONE-014

- Date: `2026-04-14`
- Time: `15:05`
- Milestone: Sweetbook webhook receiver implemented
- Status: `ready_for_review`
- Summary:
  - `POST /webhooks/sweetbook` now receives contract-shaped webhook events and updates matching season-book orders by `orderUid`
  - webhook signature verification is supported when `SWEETBOOK_WEBHOOK_SECRET` is configured, while local development can leave it blank
  - unit tests and e2e tests cover asynchronous status sync through the webhook endpoint
- Related Decision IDs:
  - `API-023`
- Blocking Items:
  - user verification pending
- Next Step:
  - decide whether to spend the next slice on real Sweetbook sandbox validation or deployment-readiness cleanup

### BE-MILESTONE-015

- Date: `2026-04-14`
- Time: `16:20`
- Milestone: Railway deployment path prepared for the backend API
- Status: `ready_for_review`
- Summary:
  - `apps/api` now includes a Railway-ready Dockerfile for the monorepo structure
  - production env loading no longer falls back to placeholder example values on Railway
  - backend deployment assets now cover the required Railway variables, persistent SQLite volume setup, and R2-based upload hosting
- Related Decision IDs:
  - `API-024`
- Blocking Items:
  - Railway CLI login and first real deploy still require the user's authenticated Railway session
- Next Step:
  - authenticate Railway on the user's machine and execute the first backend deployment

### BE-MILESTONE-016

- Date: `2026-04-15`
- Time: `16:45`
- Milestone: Diary delete endpoint and backend API docs synchronized
- Status: `ready_for_review`
- Summary:
  - `DELETE /entries/:id` is now implemented and deployed without resetting the existing production SQLite data
  - shared contract and planning docs now reflect the latest implemented backend endpoints including entry deletion and order history
  - `apps/api/docs/API_REFERENCE.md` was added as a static human-readable endpoint reference for frontend and QA
- Related Decision IDs:
  - `API-027`
  - `API-028`
- Blocking Items:
  - frontend delete button wiring is still pending in `apps/web`
- Next Step:
  - connect the frontend delete action to `DELETE /entries/:id`
