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
