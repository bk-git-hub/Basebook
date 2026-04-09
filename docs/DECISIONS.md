# Basebook Decision Log

이 문서는 사용자와의 기술 회의에서 확정된 주요 결정을 기록한다.

규칙:

- 결정은 사용자와의 회의 후에만 기록한다.
- 기존 결정을 조용히 덮어쓰지 않는다.
- 변경이 생기면 새로운 decision entry를 추가한다.
- 시간은 `Asia/Seoul` 기준으로 기록한다.

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

### DECISION-001

- Date: `2026-04-09`
- Time: `13:00`
- Agenda: Basebook product direction and core architecture
- Participants: User, Codex
- Options Considered:
  - Next.js full-stack only
  - Next.js frontend + Express API
  - Next.js frontend + Nest.js API
- Decision: Use a monorepo with `Next.js` for web and `Nest.js` for API.
- Rationale: This preserves a clear full-stack architecture and makes backend domain ownership and orchestration more explicit.
- Impact:
  - `apps/web` and `apps/api` are developed separately
  - API orchestration and persistence stay in Nest.js
  - integration requires shared contracts
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BASEBOOK_PLAN.md`
  - `docs/planning/CONTRACT_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`
  - `docs/milestones/backend.md`

### DECISION-002

- Date: `2026-04-09`
- Time: `13:10`
- Agenda: Basebook MVP scope boundaries
- Participants: User, Codex
- Options Considered:
  - Include AI writing assistance
  - Exclude AI writing assistance from MVP
  - Depend on automatic external KBO data ingestion
  - Use manual or semi-automatic metadata enrichment
- Decision:
  - Exclude LLM text generation from MVP
  - Use manual or semi-automatic game metadata enrichment
  - Keep auth/admin as future-ready architecture, not MVP UI
- Rationale: The MVP should emphasize reliable journaling and Sweetbook ordering, not optional AI or unstable external dependencies.
- Impact:
  - journaling UX remains the product core
  - contracts reserve future auth/admin expansion
  - KBO enrichment stays optional and non-blocking
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BASEBOOK_PLAN.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`
  - `docs/milestones/backend.md`

### DECISION-003

- Date: `2026-04-09`
- Time: `13:35`
- Agenda: Team operating model for multi-thread parallel development
- Participants: User, Codex
- Options Considered:
  - Single thread sequential development
  - Multiple Codex threads without strict worktree rules
  - Multiple Codex threads with fixed role and worktree ownership
- Decision: Operate with distinct integration, frontend, and backend roles using dedicated worktrees and branch ownership.
- Rationale: Parallel development is only safe when role boundaries, editable paths, and integration checkpoints are explicit.
- Impact:
  - team playbook governs thread behavior
  - frontend and backend are built in parallel
  - integration remains centralized in `main`
- Owner: User
- Status: `approved`
- Related Docs:
  - `BASEBOOK_TEAM_PLAYBOOK.md`
- Related Milestones:
  - `docs/milestones/frontend.md`
  - `docs/milestones/backend.md`

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
  - `docs/milestones/backend.md`

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
  - `docs/milestones/backend.md`

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
  - `docs/milestones/backend.md`

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
  - `docs/milestones/backend.md`
