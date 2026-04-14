# Basebook API Decision Log

이 문서는 백엔드 관련 주요 기술 결정을 기록한다.

규칙:

- Backend engineer가 갱신한다.
- 사용자와의 기술 회의 후 확정된 결정만 기록한다.
- 기존 결정을 조용히 덮어쓰지 않는다.
- 변경이 생기면 새로운 entry를 추가한다.
- 시간은 `Asia/Seoul` 기준으로 기록한다.

---

## Template

### API-XXX

- Date: `YYYY-MM-DD`
- Time: `HH:MM`
- Agenda:
- Participants:
- Options Considered:
- Decision:
- Rationale:
- Impact:
- Owner:
- Status: `proposed | approved | superseded | deprecated`
- Related Docs:
- Related Milestones:

---

## Decisions

### API-001

- Date: `2026-04-09`
- Time: `13:00`
- Agenda: Basebook backend architecture baseline
- Participants: User, Codex
- Options Considered:
  - Next.js full-stack only
  - Next.js frontend + Express API
  - Next.js frontend + Nest.js API
- Decision: Use `Nest.js` as the dedicated backend inside a monorepo with a separate Next.js web app.
- Rationale: This makes API orchestration, persistence, uploads, and Sweetbook integration explicit backend responsibilities.
- Impact:
  - `apps/api` owns API routes and domain logic
  - contracts are required for frontend/backend integration
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BASEBOOK_PLAN.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-002

- Date: `2026-04-09`
- Time: `13:10`
- Agenda: Basebook MVP scope boundaries for backend
- Participants: User, Codex
- Options Considered:
  - Include LLM writing support in backend flow
  - Exclude LLM writing support from MVP
  - Depend on automatic external KBO data ingestion
  - Use manual or semi-automatic metadata enrichment
- Decision:
  - Exclude LLM text generation from MVP
  - Use manual or semi-automatic game metadata enrichment
  - Keep auth/admin future-ready in backend structure, not as MVP product scope
- Rationale: The first version should focus on stable journaling and Sweetbook ordering, not optional AI or brittle external dependencies.
- Impact:
  - backend stays focused on game data, diary persistence, upload, and Sweetbook orchestration
  - auth/admin namespaces remain reserved for future expansion
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-003

- Date: `2026-04-10`
- Time: `14:40`
- Agenda: 결정 로그를 프론트엔드와 백엔드별로 분리할지 결정
- Participants: User, Codex
- Options Considered:
  - 하나의 공용 `docs/DECISIONS.md`를 계속 사용
  - 프론트엔드와 백엔드가 각자 app-owned decision log를 사용
- Decision: 백엔드 관련 결정은 앞으로 `apps/api/DECISIONS.md`에 기록한다.
- Rationale: 프론트와 백이 동시에 하나의 결정 로그 파일을 수정하면 관리가 어렵고 충돌 가능성이 커진다.
- Impact:
  - 백엔드는 이 파일만 갱신한다
  - `docs/DECISIONS.md`는 아카이브로만 남는다
- Owner: User
- Status: `approved`
- Related Docs:
  - `AGENTS.md`
  - `BASEBOOK_TEAM_PLAYBOOK.md`
  - `docs/README.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-004

- Date: `2026-04-09`
- Time: `14:08`
- Agenda: Health endpoint implementation structure for the first backend slice
- Participants: User, Codex
- Options Considered:
  - Reuse the default Nest `AppController` and `AppService`
  - Introduce a dedicated `health` module and controller
- Decision: Implement the health check as a dedicated `health` module instead of reusing the Nest starter files.
- Rationale: The user preferred a structure-first approach so the backend can grow by domain module without an early cleanup pass.
- Impact:
  - the Nest starter controller/service were removed
  - `GET /health` now lives in a dedicated module
  - future domain slices can follow the same module pattern
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-005

- Date: `2026-04-09`
- Time: `14:10`
- Agenda: Game candidate status granularity for the `GET /games` contract
- Participants: User, Codex
- Options Considered:
  - Keep `GameStatus` as `SCHEDULED | FINAL`
  - Expand `GameStatus` to `SCHEDULED | IN_PROGRESS | FINAL`
- Decision: Expand `GameStatus` to three states: `SCHEDULED`, `IN_PROGRESS`, and `FINAL`.
- Rationale: The user wants pre-game, live-game, and completed-game states to be represented separately in the contract and future UI.
- Impact:
  - `packages/contracts` now exposes a three-state `GameStatus`
  - `GET /games` responses can distinguish scheduled, live, and completed games
  - frontend status rendering can align to a more realistic product model
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-006

- Date: `2026-04-09`
- Time: `18:04`
- Agenda: Persistence model for diary entries and local demo data seeding
- Participants: User, Codex
- Options Considered:
  - Store `photos` inside `DiaryEntry` as a single JSON blob
  - Use a separate `Photo` table linked to `DiaryEntry`
  - Leave the database empty until a manual seed command is run
  - Automatically seed demo entries when the database is empty
- Decision:
  - Use a separate `Photo` table linked to `DiaryEntry`
  - Automatically seed demo entries when the database is empty
- Rationale: The product ultimately needs image metadata that can evolve toward upload and hosting, and the user wants local demo execution to work immediately without extra setup steps.
- Impact:
  - `DiaryEntry` persistence now supports multiple photos as first-class records
  - local startup can populate visible demo content for dashboard and detail flows
  - future upload and season-book features can reuse the same photo structure
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-007

- Date: `2026-04-09`
- Time: `18:04`
- Agenda: Local execution reliability for database initialization and environment variable layout
- Participants: User, Codex
- Options Considered:
  - Keep a single root `.env` for all apps
  - Split frontend and backend environment files by app
  - Keep relying on Prisma `db push`
  - Use a deterministic `db:init` SQL execution path for local startup
- Decision:
  - Split frontend and backend environment examples by app
  - Prefer a deterministic `db:init` command over `db push` for local setup
- Rationale: The user wants administrator review on another computer to succeed reliably, and this favors explicit app-level configuration plus a database init path that already works in the current environment.
- Impact:
  - backend execution now expects `apps/api/.env`
  - frontend execution can use its own env file without mixing secrets
  - local setup can create the SQLite schema through a repeatable script
- Owner: User
- Status: `approved`
- Related Docs:
  - `apps/api/.env.example`
  - `README.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-008

- Date: `2026-04-10`
- Time: `10:10`
- Agenda: Local frontend-backend integration defaults for browser-based testing
- Participants: User, Codex
- Options Considered:
  - Keep backend on port `3000` and move the frontend
  - Move backend default port to `4000` and keep frontend on `3000`
  - Leave CORS disabled until integration testing starts
  - Enable local CORS for the frontend origin now
- Decision:
  - Use backend default port `4000`
  - Allow local browser requests from `http://localhost:3000`
- Rationale: The user expects the frontend to run on `localhost:3000`, and separating the backend to `4000` avoids local port collisions while unblocking browser-based integration tests.
- Impact:
  - backend local startup defaults now align to `PORT=4000`
  - frontend can call the backend from `localhost:3000` without browser CORS rejection
  - future deployment can still override origin and port through app-level env files
- Owner: User
- Status: `approved`
- Related Docs:
  - `apps/api/.env.example`
  - `README.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-009

- Date: `2026-04-10`
- Time: `10:55`
- Agenda: Local CORS range for multi-agent frontend work on one machine
- Participants: User, Codex
- Options Considered:
  - Keep local CORS locked to `http://localhost:3000` only
  - Allow a small local port range for parallel frontend agents
- Decision:
  - Allow local browser origins from `http://localhost:3000` through `http://localhost:3010`
  - Apply the same range to `http://127.0.0.1`
- Rationale: The user expects multiple local agents to run in parallel on one machine, so pinning CORS to one frontend port would create unnecessary collisions during integration testing.
- Impact:
  - local frontend agents can move across a small port range without reopening backend CORS each time
  - deployed or non-local frontends can still be allowed explicitly through `WEB_ORIGIN`
  - integration testing stays stable even when `3000` is already occupied
- Owner: User
- Status: `approved`
- Related Docs:
  - `apps/api/.env.example`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-010

- Date: `2026-04-10`
- Time: `15:12`
- Agenda: Image upload storage strategy for the first upload slice
- Participants: User, Codex
- Options Considered:
  - Implement remote object storage immediately
  - Implement local file storage first with no abstraction
  - Implement local file storage first behind a replaceable storage interface
- Decision:
  - Start with local file storage for `POST /uploads/image`
  - Keep the storage logic behind a replaceable service boundary so remote storage can be added later
- Rationale: The user wants local execution to work immediately while still preserving a realistic path toward future remote deployment.
- Impact:
  - uploaded files are stored locally during current development
  - backend now has a storage adapter boundary that can later switch to a blob provider
  - frontend can begin real multipart upload integration without waiting for remote infrastructure
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-011

- Date: `2026-04-11`
- Time: `16:12`
- Agenda: First season-book estimate strategy before full Sweetbook API wiring
- Participants: User, Codex
- Options Considered:
  - Wait until the real Sweetbook API flow is fully verified before exposing a frontend endpoint
  - Expose a local deterministic estimate endpoint first, then replace the estimator behind a service boundary
- Decision:
  - Implement `POST /season-books/estimate` with local deterministic pricing and project persistence first
  - Keep estimate calculation behind a replaceable backend service boundary for later Sweetbook API integration
- Rationale: Frontend integration can proceed immediately while the backend still keeps a clear path toward real Book Print API orchestration.
- Impact:
  - frontend can create an estimated season-book project through the backend now
  - the backend stores estimate inputs and generated project metadata
  - future work can swap the local estimator with the real Sweetbook API adapter without changing the frontend contract
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-012

- Date: `2026-04-12`
- Time: `15:05`
- Agenda: Sweetbook API integration path after local season-book estimate
- Participants: User, Codex
- Options Considered:
  - Continue with local-only order flow and replace it later
  - Move directly toward real Sweetbook API integration, starting with the smallest safe sandbox check
- Decision:
  - Add a backend Sweetbook client boundary now
  - Validate sandbox readiness through read-only Sweetbook APIs before implementing real book/order creation
  - Keep the existing local estimate endpoint available while the real book assembly pipeline is added in later slices
- Rationale: This reduces future replacement work while avoiding a risky one-shot implementation of book creation, finalization, estimate, and order creation before the sandbox account shape is verified.
- Impact:
  - backend can now verify Sandbox API key, book specs, templates, and credits without exposing secrets to the browser
  - next season-book slices can use the Sweetbook client instead of inventing another local-only abstraction
  - real order estimate still depends on a finalized Sweetbook `bookUid`, so it remains a follow-up after book assembly is connected
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BOOK_PRINT_API_ANALYSIS.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-013

- Date: `2026-04-12`
- Time: `15:28`
- Agenda: First real Sweetbook season-book assembly path
- Participants: User, Codex
- Options Considered:
  - Replace local estimate completely with forced Sweetbook calls
  - Keep local estimate only and postpone real assembly
  - Use `auto` mode: call Sweetbook when Sandbox API key and public image URLs are usable, otherwise keep local estimate fallback
- Decision:
  - Implement Sweetbook-backed book assembly for `POST /season-books/estimate` through `auto` mode
  - Use sandbox-verified defaults for `SQUAREBOOK_HC` and the diary template set
  - Keep local fallback for missing keys or local-only upload URLs
- Rationale: This moves the product toward the real Book Print API without breaking local reviewer execution or frontend work that still uses localhost upload URLs.
- Impact:
  - a public `coverPhotoUrl` plus configured Sandbox API key can now create a Sweetbook draft, cover, contents, publish page, blank-page padding, finalization, and order estimate
  - local uploads still need a future multipart/file handoff path before they can be sent directly to Sweetbook
  - Sweetbook page-count handling is based on the API's returned current page count rather than an internal-only estimate
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BOOK_PRINT_API_ANALYSIS.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-014

- Date: `2026-04-12`
- Time: `22:16`
- Agenda: Public image hosting path for Sweetbook integration and deployment
- Participants: User, Codex
- Options Considered:
  - Keep local file uploads only
  - Add a new SDK dependency for Cloudflare R2
  - Add R2 upload support through the S3-compatible API without a new package dependency
- Decision:
  - Keep local uploads as the default development path
  - Add optional R2 upload support for deployment and real Sweetbook estimates
  - Avoid adding a new SDK dependency in this slice so the change stays inside the backend app boundary
- Rationale: Sweetbook cannot fetch `localhost` image URLs, so production-like estimates need public image URLs. Local fallback keeps reviewer setup simple while R2 provides a low-cost deployment path.
- Impact:
  - `POST /uploads/image` can return local URLs or R2 public URLs depending on backend environment variables
  - actual R2 upload verification waits for Cloudflare-provided account and bucket credentials
  - no frontend API shape change is required
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-015

- Date: `2026-04-14`
- Time: `11:26`
- Agenda: First `POST /season-books/order` implementation mode
- Participants: User, Codex
- Options Considered:
  - Call the real Sweetbook order API immediately
  - Add a local order completion endpoint first and connect real Sweetbook ordering later
- Decision:
  - Implement the first order endpoint as a local order completion path
  - Only allow ordering for already estimated projects
  - Return the existing order on duplicate submissions instead of creating another order
- Rationale: Ordering is closer to fulfillment and credit usage than estimate, so the first backend slice should unblock the frontend flow without accidentally creating real external orders.
- Impact:
  - `POST /season-books/order` can complete the local MVP flow
  - project records move from `ESTIMATED` to `ORDERED`
  - real Sweetbook order API wiring remains a separate follow-up decision
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-016

- Date: `2026-04-14`
- Time: `11:43`
- Agenda: Sweetbook order API wiring safety mode
- Participants: User, Codex
- Options Considered:
  - Keep only local order completion until final submission
  - Replace local order completion with real Sweetbook order creation
  - Add real Sweetbook order creation behind an explicit opt-in mode
- Decision:
  - Keep local order completion as the default behavior
  - Add Sweetbook sandbox order creation behind `SWEETBOOK_ORDER_MODE=sandbox`
  - Use the project id as the order idempotency key basis to avoid duplicate external orders on retry
- Rationale: Sweetbook order creation immediately deducts credits, so the backend should support the real API path without making it the default during local reviewer execution.
- Impact:
  - local reviewers can keep using the order flow without external side effects
  - maintainers can intentionally test Sweetbook sandbox ordering after confirming sandbox credit usage
  - live/production order placement still requires a separate explicit risk decision
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BOOK_PRINT_API_ANALYSIS.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-017

- Date: `2026-04-14`
- Time: `12:33`
- Agenda: 시즌북 주문 진행 조회 엔드포인트의 계약 고정 순서
- Participants: User, Codex
- Options Considered:
  - 백엔드 구현을 먼저 하고 계약 문서와 공유 타입을 나중에 정리
  - 공유 계약을 먼저 잠그고 그 shape를 기준으로 프론트와 백엔드를 맞춰 구현
- Decision:
  - `GET /season-books/:projectId/status` 계약을 먼저 `packages/contracts`와 계약 문서에 반영한다
  - 응답은 현재 주문 상태뿐 아니라 진행 타임라인용 `progress` 배열까지 포함한다
- Rationale: 프론트가 백엔드 구현 완료를 기다리지 않고도 주문 진행 화면을 같은 응답 shape로 바로 준비할 수 있게 하기 위함이다.
- Impact:
  - 시즌북 주문 진행 조회 응답 shape가 공유 계약에 추가된다
  - 다음 백엔드 구현 슬라이스는 이 계약에 맞춰 상태 조회 API를 구현해야 한다
  - 프론트는 임시 mocking 없이 고정된 필드명을 기준으로 작업할 수 있다
- Owner: User
- Status: `approved`
- Related Docs:
  - `packages/contracts/src/season-book.ts`
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-018 [IMPORTANT]

- Date: `2026-04-14`
- Time: `12:44`
- Agenda: Sweetbook integration method drift between planning documents and backend implementation
- Participants: User, Codex
- Priority: `high`
- Options Considered:
  - Stop and refactor the backend Sweetbook layer back to the official Node.js SDK
  - Keep the implemented direct REST API client approach and correct the planning/decision trail
- Decision:
  - Keep the current backend Sweetbook integration based on direct REST API calls
  - Do not roll back the implemented `apps/api/src/sweetbook/sweetbook.client.ts` flow to the official SDK in the current assignment timeline
  - Record this as an explicit orchestration drift case: planning/spec documents assumed SDK usage, but implementation moved to direct API calls without timely decision-log and planning-document updates
- Rationale:
  - The assignment brief allows both SDK usage and direct API usage, so the implementation is still valid against the external requirement
  - During implementation, a small Nest-owned client gave tighter control over request payloads, idempotency headers, sandbox readiness checks, and error normalization
  - The implemented flow has already been validated against the Sweetbook sandbox for estimate, order creation, and credit deduction behavior, so replacing it now would add risk without clear product gain
  - The real failure was not the technical choice itself, but the orchestration gap: the team allowed the code path to diverge from planning assumptions without immediately updating the decision trail and planning specs
- Impact:
  - Direct HTTPS API calls are now the official backend integration method for the current codebase
  - Existing backend Sweetbook code remains valid and should be extended rather than rewritten to the SDK unless a later decision explicitly reverses this
  - `docs/planning/BASEBOOK_PLAN.md`, `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`, and any other planning docs that still describe SDK-first integration must be corrected in a follow-up documentation slice
  - This entry preserves the reason for the drift and the user-approved decision to continue with the implemented approach so future agents do not misinterpret the mismatch as an unresolved bug
- Owner: User
- Status: `approved`
- Related Docs:
  - `AGENTS.md`
  - `docs/planning/BASEBOOK_PLAN.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/BOOK_PRINT_API_ANALYSIS.md`
  - `apps/api/src/sweetbook/sweetbook.client.ts`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-019

- Date: `2026-04-14`
- Time: `13:05`
- Agenda: Order management and webhook contracts before implementation
- Participants: User, Codex
- Options Considered:
  - Implement cancel, shipping update, and webhook handling first and document later
  - Lock the shared contracts first so frontend and backend follow one response shape
- Decision:
  - Define shared contracts first for `POST /season-books/:projectId/cancel`
  - Define shared contracts first for `PATCH /season-books/:projectId/shipping`
  - Define shared contracts first for `POST /webhooks/sweetbook`
- Rationale: The user wants the remaining order-management work to follow the same contract-first discipline used on the order-status slice so later implementation does not drift again.
- Impact:
  - frontend can plan cancel and address-edit screens against fixed request/response shapes
  - backend implementation can proceed in smaller slices without renegotiating endpoint names later
  - webhook handling now has a documented inbound payload shape and signature-verification expectation before code is written
- Owner: User
- Status: `approved`
- Related Docs:
  - `packages/contracts/src/season-book.ts`
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-020

- Date: `2026-04-14`
- Time: `13:19`
- Agenda: Project state handling after season-book order cancellation
- Participants: User, Codex
- Options Considered:
  - Return the project to an orderable state after cancellation
  - Keep the project in an ordered lifecycle state and preserve cancellation as final order history
- Decision:
  - Keep `projectStatus` as `ORDERED` after cancellation
  - Use `orderStatus` such as `CANCELLED_REFUND` to represent the terminal cancelled state
  - Do not make cancellation behave like a reversible order/unorder toggle in the current product flow
- Rationale: The user wants cancellation to remain a historical order result, not a UI toggle that silently reopens the same project for ordering again.
- Impact:
  - frontend only needs to render cancellation as a terminal order state
  - backend should not automatically reopen the same project for re-order from the cancellation path
  - future re-order support, if ever needed, should be treated as a separate explicit product feature
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-021

- Date: `2026-04-14`
- Time: `14:05`
- Agenda: 배송지 수정 기능을 위한 저장 위치와 로컬 DB 초기화 방식
- Participants: User, Codex
- Options Considered:
  - 배송지 정보를 PATCH 요청 처리 시점에만 사용하고 별도 저장 없이 넘긴다
  - 배송지 정보를 `SeasonBookProject`에 저장하고 기존 로컬 SQLite도 자동으로 컬럼을 보강한다
- Decision:
  - 주문 시점 배송지와 이후 수정 배송지를 모두 `SeasonBookProject`에 저장한다
  - `db:init`는 새 DB 생성뿐 아니라 기존 로컬 SQLite 파일에 빠진 nullable 배송지 컬럼도 자동으로 추가한다
  - 배송지 수정은 출고 전 상태(`PAID`, `CONFIRMED`)에서만 허용한다
- Rationale:
  - 사용자는 프론트에서 배송지 수정 후 다시 조회하거나 이어서 주문 관리 화면을 열어도 같은 주소 정보가 남아 있기를 기대한다
  - 과제 검토자나 관리자 컴퓨터에서 수동 `db push`나 DB 삭제 없이 서버가 올라와야 한다는 사용자 우선순위를 지켜야 한다
  - SQLite는 기존 테이블에 새 컬럼을 안전하게 맞추려면 명시적인 보강 단계가 필요하므로, 자동 초기화 흐름 안에 그 책임을 넣는 편이 가장 운영 실수가 적다
- Impact:
  - 시즌북 주문 프로젝트 레코드에 배송지 필드들이 추가된다
  - `POST /season-books/order`와 `PATCH /season-books/:projectId/shipping`가 같은 저장 원천을 공유한다
  - 기존 개발용 `dev.db`도 `npm run db:init`만 다시 실행하면 배송지 컬럼이 자동 반영된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/prisma/init.sql`
  - `apps/api/scripts/db-init.cjs`
  - `docs/planning/BOOK_PRINT_API_ANALYSIS.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-022

- Date: `2026-04-14`
- Time: `14:24`
- Agenda: 배송지 수정 UX를 위한 상태 조회 계약 보강 순서
- Participants: User, Codex
- Options Considered:
  - 현재 계약만 유지하고 프론트가 빈 배송지 폼에서 전체 주소를 다시 입력받는다
  - 기존 `GET /season-books/:projectId/status` 응답에 현재 배송지를 포함하도록 계약을 먼저 보강한다
- Decision:
  - 구현보다 먼저 계약 문서와 공유 타입을 수정한다
  - 별도 배송지 조회 엔드포인트를 추가하지 않고, 기존 status 응답에 optional `shipping` 필드를 추가한다
- Rationale:
  - 사용자는 주소 수정 화면에서 기존 배송지가 미리 채워져 있는 흐름을 더 자연스럽게 느낀다
  - 기존 status 조회를 확장하면 프론트 호출 구조를 늘리지 않고도 UX를 개선할 수 있다
  - 계약을 먼저 잠그면 프론트와 백엔드가 같은 응답 shape를 기준으로 병렬 작업할 수 있다
- Impact:
  - 프론트는 status 응답 하나로 진행 상태와 배송지 초기값을 함께 받을 수 있다
  - 백엔드는 다음 구현 슬라이스에서 저장된 shipping snapshot을 status 응답에 포함해야 한다
  - 현재 범위에서는 별도 배송지 조회 API를 추가하지 않는다
- Owner: User
- Status: `approved`
- Related Docs:
  - `packages/contracts/src/season-book.ts`
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`
