# Basebook API Decision Log

이 문서는 `apps/api` 범위의 백엔드 전용 기술 결정을 기록한다.

규칙:

- 결정은 사용자와의 기술 회의 후에만 기록한다.
- 기존 결정을 조용히 덮어쓰지 않는다.
- 변경이 생기면 새로운 decision entry를 추가한다.
- 시간은 `Asia/Seoul` 기준으로 기록한다.
- 프론트엔드 전용 또는 전사 공통 결정은 루트 `docs` 문서에 기록한다.

---

## Template

### DECISION-XXX

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

### DECISION-004

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
  - `apps/api/docs/MILESTONES.md`

### DECISION-005

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
  - `apps/api/docs/MILESTONES.md`

### DECISION-006

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
  - `apps/api/docs/MILESTONES.md`

### DECISION-007

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
  - `.env.example`
  - `README.md`
- Related Milestones:
  - `apps/api/docs/MILESTONES.md`

### DECISION-008

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
  - `apps/api/docs/MILESTONES.md`

### DECISION-009

- Date: `2026-04-10`
- Time: `10:25`
- Agenda: Separate backend decision and milestone logs from frontend-facing project docs
- Participants: User, Codex
- Options Considered:
  - Keep backend implementation logs in the root `docs` directory
  - Create backend-only logs inside `apps/api/docs`
- Decision:
  - Record backend-only decisions in `apps/api/docs/DECISIONS.md`
  - Record backend-only progress in `apps/api/docs/MILESTONES.md`
- Rationale: The user wants backend work logs to stay clearly separated from frontend work and from shared project documentation.
- Impact:
  - backend documentation ownership is now scoped under `apps/api`
  - future backend slices can update their own log files without mixing with frontend tracking
  - shared root docs can stay focused on cross-cutting product material
- Owner: User
- Status: `approved`
- Related Docs:
  - `AGENTS.md`
  - `BASEBOOK_TEAM_PLAYBOOK.md`
  - `docs/README.md`
- Related Milestones:
  - `apps/api/docs/MILESTONES.md`

### DECISION-010

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
- Rationale: The user expects multiple local agents and worktrees to run in parallel on one machine, so pinning CORS to one frontend port would create unnecessary collisions during integration testing.
- Impact:
  - local frontend agents can move across a small port range without reopening backend CORS each time
  - deployed or non-local frontends can still be allowed explicitly through `WEB_ORIGIN`
  - integration testing stays stable even when `3000` is already occupied
- Owner: User
- Status: `approved`
- Related Docs:
  - `apps/api/.env.example`
- Related Milestones:
  - `apps/api/docs/MILESTONES.md`
