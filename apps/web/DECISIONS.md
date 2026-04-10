# Basebook Web Decision Log

이 문서는 프론트엔드와 프론트엔드 QA 관련 주요 기술 결정을 기록한다.

규칙:

- Frontend engineer와 Frontend QA engineer가 갱신한다.
- 사용자와의 기술 회의 후 확정된 결정만 기록한다.
- 기존 결정을 조용히 덮어쓰지 않는다.
- 변경이 생기면 새로운 entry를 추가한다.
- 시간은 `Asia/Seoul` 기준으로 기록한다.

---

## Template

### WEB-XXX

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

### WEB-001

- Date: `2026-04-09`
- Time: `13:00`
- Agenda: Basebook frontend architecture baseline
- Participants: User, Codex
- Options Considered:
  - Next.js full-stack only
  - Next.js frontend + Express API
  - Next.js frontend + Nest.js API
- Decision: Use `Next.js` as the dedicated frontend inside a monorepo with a separate Nest.js API.
- Rationale: This keeps UI responsibilities focused in the web app while allowing API orchestration and persistence to live in a separate backend.
- Impact:
  - `apps/web` owns UI and client behavior
  - frontend integrates through contracts instead of direct backend code sharing
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BASEBOOK_PLAN.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-002

- Date: `2026-04-09`
- Time: `13:10`
- Agenda: Basebook MVP scope boundaries for frontend
- Participants: User, Codex
- Options Considered:
  - Include AI writing assistance in UI
  - Exclude AI writing assistance from MVP
  - Add auth/login UI now
  - Keep auth/admin future-ready but out of MVP UI
- Decision:
  - Exclude AI writing assistance from MVP
  - Keep auth and admin UI out of the first version
  - Use manual or semi-automatic game metadata enrichment
- Rationale: The first version should emphasize journaling and book conversion, not optional AI or account-management UI.
- Impact:
  - frontend scope remains focused on journaling, dashboard, season-book, and order flows
  - auth/admin are reserved for later expansion
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-003

- Date: `2026-04-10`
- Time: `09:10`
- Agenda: Add a dedicated frontend QA role
- Participants: User, Codex
- Options Considered:
  - Keep QA in the frontend implementation thread
  - Add a separate frontend QA engineer role
- Decision: Add a dedicated `Frontend QA engineer` role and separate QA branch/worktree.
- Rationale: Frontend implementation and frontend QA can progress in parallel, and test ownership becomes explicit.
- Impact:
  - QA has its own worktree and onboarding path
  - frontend testing becomes an owned responsibility
- Owner: User
- Status: `approved`
- Related Docs:
  - `BASEBOOK_TEAM_PLAYBOOK.md`
  - `docs/planning/FRONTEND_QA_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-004

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
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-005

- Date: `2026-04-10`
- Time: `12:15`
- Agenda: `/entries/[id]`의 `GET /entries/:id` 연동 시 상세 조회 실패 상태를 어떻게 처리할지 결정
- Participants: User, Codex
- Options Considered:
  - 상세 페이지에서 모든 실패를 하나의 에러 화면으로 표시
  - `404`는 `not-found`로 처리하고, 그 외 실패만 에러 상태 카드로 표시
- Decision: `404`는 `/entries/[id]/not-found.tsx`로 처리하고, 그 외 실패는 상세 페이지 안의 에러 상태 카드로 표시한다.
- Rationale: 존재하지 않는 id와 서버 오류를 같은 메시지로 합치면 디버깅과 사용자 이해가 모두 어려워진다.
- Impact:
  - `/entries/[id]`는 404 응답과 일반 에러를 구분해서 표시한다
  - 최근 기록 리스트에서 상세 페이지로 직접 이동하는 검증 흐름이 생긴다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-006

- Date: `2026-04-10`
- Time: `12:40`
- Agenda: `/entries/[id]/edit`의 `PATCH /entries/:id` 요청 body를 어떤 방식으로 만들지 결정
- Participants: User, Codex
- Options Considered:
  - 폼 전체 값을 매번 PATCH body로 전송
  - 실제로 바뀐 필드만 diff 형태로 PATCH body에 전송
- Decision: 수정 폼은 `GET /entries/:id`로 받은 초기값과 현재 폼 값을 비교해서, 바뀐 필드만 `PATCH /entries/:id` body에 담아 전송한다.
- Rationale: contracts가 `Partial<CreateDiaryEntryInput>`를 전제로 하고 있어서 PATCH의 의미와 가장 잘 맞고, 변경되지 않은 필드를 불필요하게 다시 보내지 않게 된다.
- Impact:
  - 수정 폼은 diff 계산 로직을 가진 클라이언트 폼이 된다
  - 수정 요청 payload를 화면에서 확인하기 쉬워진다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-007

- Date: `2026-04-10`
- Time: `14:40`
- Agenda: 결정 로그를 프론트엔드와 백엔드별로 분리할지 결정
- Participants: User, Codex
- Options Considered:
  - 하나의 공용 `docs/DECISIONS.md`를 계속 사용
  - 프론트엔드와 백엔드가 각자 app-owned decision log를 사용
- Decision: 프론트엔드 관련 결정은 앞으로 `apps/web/DECISIONS.md`에 기록한다.
- Rationale: 프론트와 백이 동시에 하나의 결정 로그 파일을 수정하면 관리가 어렵고 충돌 가능성이 커진다.
- Impact:
  - 프론트/QA는 이 파일만 갱신한다
  - `docs/DECISIONS.md`는 아카이브로만 남는다
- Owner: User
- Status: `approved`
- Related Docs:
  - `AGENTS.md`
  - `BASEBOOK_TEAM_PLAYBOOK.md`
  - `docs/README.md`
- Related Milestones:
  - `docs/milestones/frontend.md`
