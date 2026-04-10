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
- Decision: Operate with distinct CTO, frontend, and backend roles using dedicated worktrees and branch ownership.
- Rationale: Parallel development is only safe when role boundaries, editable paths, and integration checkpoints are explicit.
- Impact:
  - team playbook governs thread behavior
  - frontend and backend are built in parallel
  - CTO responsibility remains centralized in `main`
- Owner: User
- Status: `approved`
- Related Docs:
  - `BASEBOOK_TEAM_PLAYBOOK.md`
- Related Milestones:
  - `docs/milestones/frontend.md`
  - `docs/milestones/backend.md`

### DECISION-004

- Date: `2026-04-10`
- Time: `09:10`
- Agenda: Add a dedicated frontend QA role to the parallel development team
- Participants: User, Codex
- Options Considered:
  - Keep QA and frontend implementation in one thread
  - Let CTO do all frontend QA
  - Add a dedicated frontend QA engineer thread
- Decision: Add a dedicated `Frontend QA engineer` role with its own worktree and branch.
- Rationale: Frontend implementation and frontend QA can progress in parallel, and test ownership becomes explicit instead of being treated as leftover work.
- Impact:
  - frontend testing and QA become an owned responsibility
  - a new worktree and onboarding path are required
  - frontend and QA communication points must be documented
- Owner: User
- Status: `approved`
- Related Docs:
  - `BASEBOOK_TEAM_PLAYBOOK.md`
  - `docs/planning/FRONTEND_QA_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### DECISION-005

- Date: `2026-04-10`
- Time: `12:09`
- Agenda: `/season`의 `GET /entries` 연동 방식을 어떻게 구성할지 결정
- Participants: User, Codex
- Options Considered:
  - `/season` 페이지에서 직접 `fetch`
  - `entries` 전용 API client 계층을 두고 페이지가 이를 사용
- Decision: `entries` 전용 API client 계층을 먼저 만들고, `/season` 페이지는 그 계층을 통해 `GET /entries`를 호출한다.
- Rationale: 같은 `/entries` 도메인을 앞으로 상세 조회, 수정, 생성 화면에서도 재사용할 예정이라 페이지마다 직접 fetch를 퍼뜨리는 것보다 교체 범위와 중복을 줄이는 편이 안전하다.
- Impact:
  - `apps/web/src/lib/api` 아래에 재사용 가능한 HTTP client와 `entries` client가 생긴다
  - `/season`은 mock 데이터가 아니라 API 응답을 받는 서버 컴포넌트 구조로 바뀐다
  - 이후 `GET /entries/:id`, `PATCH /entries/:id`, `POST /entries` 연동도 같은 계층을 따라갈 수 있다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`
