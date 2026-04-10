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
