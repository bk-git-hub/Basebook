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

### WEB-008

- Date: `2026-04-10`
- Time: `12:52`
- Agenda: `/entries/new`의 `POST /entries` 연동 범위를 어디까지 포함할지 결정
- Participants: User, Codex
- Options Considered:
  - `GET /games`, `POST /uploads/image`, `POST /entries`를 한 번에 모두 연결
  - 이번 슬라이스는 `POST /entries`만 붙이고 경기 조회와 업로드는 다음 의존성 슬라이스로 분리
- Decision: `/entries/new`는 이번 단계에서 수동 입력 기반으로 `POST /entries`만 먼저 연동하고, `gameId`는 선택 입력으로 열어두며 사진은 빈 배열로 전송한다.
- Rationale: 사장님이 API 연동을 하나씩 atomic하게 진행하자고 정한 만큼, 아직 준비되지 않은 `/games`와 업로드 의존성을 같이 묶으면 생성 흐름 검증 범위가 불필요하게 커진다.
- Impact:
  - `/entries/new`는 즉시 `POST /entries` 통신 테스트가 가능해진다
  - `/games` 자동 채움과 사진 업로드는 후속 슬라이스로 분리된다
  - 생성 요청 payload를 화면에서 직접 확인할 수 있게 된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-009

- Date: `2026-04-10`
- Time: `14:17`
- Agenda: 프론트엔드 테스트 코드를 어디에 둘지 결정
- Participants: User, Codex
- Options Considered:
  - `apps/web` 내부에 단위 테스트와 e2e 테스트를 함께 둔다
  - 별도 `tests/web` 워크스페이스를 만들고 `apps/web`는 앱 코드만 유지한다
- Decision: 프론트엔드 테스트와 QA 자동화 코드는 별도 `tests/web` 워크스페이스에 두고, `apps/web`는 프론트엔드 앱 코드와 결정 로그만 유지한다.
- Rationale: 앱 코드와 QA 인프라를 분리하면 프론트 구현 워크트리의 책임 범위가 선명해지고, 테스트 의존성과 실행 설정도 독립적으로 관리할 수 있다.
- Impact:
  - `tests/web`가 `vitest`와 `playwright` 기반의 프론트 QA 워크스페이스가 된다
  - `apps/web`는 테스트 전용 파일 없이 프론트 소스 중심으로 유지된다
  - 이후 프론트-백 연동 e2e도 같은 워크스페이스에서 확장한다
- Owner: User
- Status: `approved`
- Related Docs:
  - `AGENTS.md`
  - `BASEBOOK_TEAM_PLAYBOOK.md`
  - `docs/planning/FRONTEND_QA_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-010

- Date: `2026-04-10`
- Time: `14:58`
- Agenda: `/entries/new`의 `GET /games` 조회 방식을 버튼 기반으로 시작할지 자동 조회로 시작할지 결정
- Participants: User, Codex
- Options Considered:
  - 날짜나 응원 팀이 바뀔 때마다 자동으로 `GET /games`를 호출
  - 사용자가 명시적으로 버튼을 눌렀을 때만 `GET /games`를 호출
- Decision: 지금은 버튼 기반 조회로 시작하되, 조회 query 생성과 후보 반영 로직을 분리해서 추후 자동 조회로 확장할 수 있게 구현한다.
- Rationale: 현재 단계에서는 API 연동 범위를 작게 유지해 디버깅과 검증을 단순하게 가져가는 편이 유리하다. 다만 이후 UX를 개선할 때 자동 조회로 전환할 수 있도록 데이터 조회 경계는 처음부터 분리해 두는 것이 맞다.
- Impact:
  - `/entries/new`에서 사용자가 버튼으로 경기 후보를 조회하고 선택하면 폼이 자동으로 채워진다
  - 조회 trigger만 바꾸면 같은 query/apply 로직으로 자동 조회를 붙일 수 있다
  - `gameId` 수동 입력 의존도가 낮아지고 생성 UX가 실제 사용 흐름에 가까워진다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-011

- Date: `2026-04-10`
- Time: `15:15`
- Agenda: `/entries/new`의 `POST /uploads/image`를 저장 직전 일괄 업로드로 둘지, 파일 선택 즉시 업로드로 둘지 결정
- Participants: User, Codex
- Options Considered:
  - 저장 버튼을 눌렀을 때 `POST /entries` 직전에 업로드를 함께 처리
  - 파일을 고르는 즉시 `POST /uploads/image`를 먼저 호출하고 업로드된 asset을 폼 state에 보관
- Decision: `/entries/new`는 파일 선택 즉시 업로드를 수행하고, 업로드 응답 asset을 폼 state에 저장한 뒤 최종 `POST /entries` payload의 `photos`로 전달한다.
- Rationale: 업로드 실패와 기록 저장 실패를 분리하면 디버깅과 사용자 피드백이 쉬워지고, 생성 화면에서도 첨부 사진을 먼저 확인하거나 제외할 수 있다. 또한 업로드 응답 shape가 `PhotoAsset`과 바로 호환되어 payload 조립이 단순하다.
- Impact:
  - 사용자는 저장 전에 업로드 성공 여부를 바로 확인할 수 있다
  - 업로드된 사진을 생성 payload에서 개별적으로 제외할 수 있다
  - `/entries/new` 생성 흐름이 `GET /games` + `POST /uploads/image` + `POST /entries` 기준으로 거의 완성된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`
