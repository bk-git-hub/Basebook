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

### DECISION-006

- Date: `2026-04-10`
- Time: `12:15`
- Agenda: `/entries/[id]`의 `GET /entries/:id` 연동 시 상세 조회 실패 상태를 어떻게 처리할지 결정
- Participants: User, Codex
- Options Considered:
  - 상세 페이지에서 모든 실패를 하나의 에러 화면으로 표시
  - `404`는 `not-found`로 처리하고, 그 외 실패만 에러 상태 카드로 표시
- Decision: `404`는 `/entries/[id]/not-found.tsx`로 처리하고, 그 외 실패는 상세 페이지 안의 에러 상태 카드로 표시한다.
- Rationale: 존재하지 않는 id와 서버 오류를 같은 메시지로 합치면 디버깅과 사용자 이해가 모두 어려워진다. 상세 조회 API 연동 단계에서는 두 경우를 분리해두는 편이 이후 QA와 백엔드 협업에도 유리하다.
- Impact:
  - `/entries/[id]`는 404 응답과 일반 에러를 구분해서 표시한다
  - 최근 기록 리스트에서 상세 페이지로 직접 이동하는 검증 흐름이 생긴다
  - 이후 `PATCH /entries/:id` 연동 시 같은 상세 페이지를 기준 화면으로 재사용할 수 있다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### DECISION-007

- Date: `2026-04-10`
- Time: `12:40`
- Agenda: `/entries/[id]/edit`의 `PATCH /entries/:id` 요청 body를 어떤 방식으로 만들지 결정
- Participants: User, Codex
- Options Considered:
  - 폼 전체 값을 매번 PATCH body로 전송
  - 실제로 바뀐 필드만 diff 형태로 PATCH body에 전송
- Decision: 수정 폼은 `GET /entries/:id`로 받은 초기값과 현재 폼 값을 비교해서, 바뀐 필드만 `PATCH /entries/:id` body에 담아 전송한다.
- Rationale: contracts가 `Partial<CreateDiaryEntryInput>`를 전제로 하고 있어서 PATCH의 의미와 가장 잘 맞고, 변경되지 않은 선택 필드나 미구현 사진 편집 필드를 불필요하게 다시 보내지 않게 된다.
- Impact:
  - `/entries/[id]/edit`는 diff 계산 로직을 가진 클라이언트 폼이 된다
  - 수정 요청 payload를 화면에서 바로 확인할 수 있어 백엔드 협업과 디버깅이 쉬워진다
  - 이후 `POST /entries` 연동과도 역할이 명확히 구분된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`
