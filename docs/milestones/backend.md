# Basebook Backend Milestones

이 문서는 백엔드 마일스톤과 주요 상태 변화를 기록한다.

규칙:

- 시작, 완료, blocker, scope change, integration ready 상태를 기록한다.
- 길게 서술하지 말고 사실 중심으로 적는다.
- 사용자 검증 전에는 `done`으로 표기하지 않는다.

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
  - `DECISION-001`
  - `DECISION-002`
  - `DECISION-003`
- Blocking Items:
  - worktree creation pending
- Next Step:
  - scaffold backend worktree and start Nest module implementation

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
  - `DECISION-004`
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
  - `DECISION-005`
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
  - `DECISION-006`
  - `DECISION-007`
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
  - `DECISION-006`
  - `DECISION-007`
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
  - `DECISION-008`
- Blocking Items:
  - user verification pending
- Next Step:
  - run the frontend against the local backend and verify browser requests
