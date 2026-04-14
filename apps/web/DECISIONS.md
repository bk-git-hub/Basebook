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

### WEB-012

- Date: `2026-04-11`
- Time: `16:10`
- Agenda: `/season-book/new` 기록 선택 UI를 페이지 내부 상태로 둘지 별도 컴포넌트로 분리할지 결정
- Participants: User, Codex
- Options Considered:
  - 페이지에서 `GET /entries` 조회와 선택 상태를 모두 직접 관리
  - 페이지는 `GET /entries` 조회와 상태 분기만 맡고, 선택 UI는 전용 클라이언트 컴포넌트로 분리
- Decision: `/season-book/new`는 서버 페이지가 기록 목록을 불러오고, 선택 상태는 `SeasonBookEntrySelection` 클라이언트 컴포넌트에서 관리한다.
- Rationale: 시즌북 화면은 이후 `POST /season-books/estimate`와 옵션 입력으로 이어질 가능성이 높다. 지금부터 선택 패널을 분리하면 다음 슬라이스에서 `selectedEntryIds`를 estimate 요청으로 넘기는 구조를 유지하기 쉽다.
- Impact:
  - `/season-book/new`가 `GET /entries` 기반 기록 선택 화면으로 전환된다
  - 선택 요약과 `selectedEntryIds` preview가 생겨 다음 estimate 연동 범위가 선명해진다
  - 견적 생성 API는 이번 슬라이스에서 제외하고 다음 작업으로 분리된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-013

- Date: `2026-04-12`
- Time: `15:01`
- Agenda: `/season-book/new`의 `POST /season-books/estimate` 연동을 기존 선택 컴포넌트에 직접 넣을지 builder form으로 분리할지 결정
- Participants: User, Codex
- Options Considered:
  - `SeasonBookEntrySelection` 안에 제목/소개문/커버 입력과 estimate 호출까지 직접 추가
  - `SeasonBookBuilderForm`이 선택값과 estimate 요청 상태를 관리하고, `SeasonBookEntrySelection`은 선택 UI만 담당하도록 분리
- Decision: `SeasonBookBuilderForm`을 추가해 시즌북 생성 폼 상태와 `POST /season-books/estimate` 호출을 맡기고, 기존 선택 컴포넌트는 controlled selection UI로 정리한다.
- Rationale: 시즌북 흐름은 선택, 견적, 주문으로 이어지므로 estimate 요청 상태까지 선택 컴포넌트에 넣으면 역할이 빠르게 커진다. 빌더 폼을 별도로 두면 다음 `/order/[projectId]` 연동이나 옵션 확장 시 경계가 명확하다.
- Impact:
  - `/season-book/new`에서 기록 선택 후 제목, 소개문, 커버 URL을 입력해 견적을 생성할 수 있다
  - 성공 응답의 `projectId`, `pageCount`, `totalPrice`, `creditSufficient`를 화면에서 확인할 수 있다
  - `/order/[projectId]` 이동 버튼은 생기지만 주문 화면 구현은 다음 슬라이스로 남는다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-014

- Date: `2026-04-12`
- Time: `15:13`
- Agenda: `/order/[projectId]` 주문 화면을 클라이언트 폼 중심으로 만들지, 서버 페이지와 클라이언트 폼으로 분리할지 결정
- Participants: User, Codex
- Options Considered:
  - 주문 화면 전체를 클라이언트 폼 중심으로 구현
  - 라우트 페이지는 `projectId` 전달과 화면 프레임을 담당하고, 주문 입력과 `POST /season-books/order` 호출은 전용 클라이언트 폼으로 분리
- Decision: `/order/[projectId]`는 서버 라우트 페이지와 `SeasonBookOrderForm` 클라이언트 컴포넌트로 분리한다.
- Rationale: 현재는 프로젝트 상세 조회 API가 없어 페이지가 `projectId`만 전달하지만, 이후 견적 상세 재조회나 결제 상태 표시가 생기면 서버 페이지에 확장하기 쉽다. 주문 입력과 요청 상태는 클라이언트 폼에 두는 편이 역할이 명확하다.
- Impact:
  - `/order/[projectId]`가 실제 주문 입력 화면으로 동작한다
  - `POST /season-books/order` API client가 추가된다
  - 결제, 배송 추적, 프로젝트 상세 재조회는 후속 슬라이스로 남긴다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-015

- Date: `2026-04-12`
- Time: `22:01`
- Agenda: `/` 랜딩을 예전 placeholder shell로 복구할지, 현재 구현된 제품 UI 톤에 맞춰 새로 구성할지 결정
- Participants: User, Codex
- Options Considered:
  - `codex/web`에 있던 `AppShell`/`PlaceholderPage` 기반 홈과 네비게이션을 그대로 복구
  - 현재 `main`의 실제 구현 화면들과 같은 stone/white 카드형 UI 톤으로 랜딩을 새로 구현
- Decision: 이전 placeholder shell은 복구하지 않고, 현재 구현된 `/season`, `/entries`, `/season-book`, `/order` 흐름에 맞는 제품 랜딩으로 `/`를 새로 구현한다.
- Rationale: 예전 shell은 라우트 골격 확인용 placeholder였고 현재 화면들의 색감과 구조와 맞지 않는다. 지금은 실제 API 연결 화면들이 있으므로 랜딩도 현재 제품 흐름을 안내하는 역할이 더 적합하다.
- Impact:
  - `/`가 Next 기본 템플릿에서 Sweetbook 제품 랜딩으로 교체된다
  - 주요 화면으로 이동하는 네비게이션과 CTA가 복구된다
  - 앱 metadata와 html lang도 Sweetbook/한국어 기준으로 보정된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-016

- Date: `2026-04-14`
- Time: `10:36`
- Agenda: `/order/[projectId]`에서 주문 직전 견적 정보를 어떻게 표시할지 결정
- Participants: User, Codex
- Options Considered:
  - 백엔드에 시즌북 프로젝트 상세 조회 API를 요청하고 주문 화면에서 서버 조회로 `pageCount`, `totalPrice`를 표시
  - `/season-book/new`에서 받은 견적 결과를 주문 화면으로 표시용 query string으로 전달
- Decision: 현재는 `pageCount`, `totalPrice`, `currency`, `creditSufficient`를 query string으로 전달해 주문 화면에서 표시하고, 주문 요청 자체는 기존 `projectId` 기반으로 유지한다.
- Rationale: 백엔드 계약을 추가하지 않고도 주문 직전 확인 UX를 바로 보강할 수 있다. 전달값은 표시용이며 주문 생성의 source of truth는 여전히 서버의 `projectId` 처리에 둔다. 이후 프로젝트 상세 조회 API가 생기면 주문 화면의 `estimateSummary` 입력 경계만 서버 조회로 교체할 수 있다.
- Impact:
  - `/season-book/new`에서 주문 화면으로 이동할 때 견적 요약 정보가 함께 전달된다
  - `/order/[projectId]`에서 페이지 수, 예상 금액, 크레딧 상태를 주문 전 확인 영역으로 보여준다
  - 직접 진입처럼 query string이 없는 경우에는 견적 화면에서 다시 이동하라는 안내를 보여준다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

### WEB-017

- Date: `2026-04-14`
- Time: `13:00`
- Agenda: 주문 상태 조회를 기존 `/order/[projectId]` 안에서 처리할지, 별도 상태 화면으로 분리할지 결정
- Participants: User, Codex
- Options Considered:
  - 기존 `/order/[projectId]` 안에서 배송 입력, 주문 완료, 진행 상태 조회를 모두 처리
  - `/order/[projectId]/status` 별도 화면을 추가하고, 주문 입력 화면은 생성에만 집중
- Decision: 주문 상태 조회는 `/order/[projectId]/status` 전용 화면으로 분리한다.
- Rationale: 주문 입력과 주문 추적은 사용자의 목적이 다르다. 별도 화면으로 분리하면 재진입과 새로고침에 강하고, 백엔드가 내려주는 `progress[]` 타임라인 응답을 자연스럽게 표현할 수 있다.
- Impact:
  - `/order/[projectId]/status` 라우트와 상태 조회 UI가 추가된다
  - 주문 성공 후 사용자는 별도 상태 화면에서 제작 및 배송 진행 단계를 확인할 수 있다
  - 기존 `/order/[projectId]`는 배송 정보 입력과 주문 접수에 집중한다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

### WEB-018

- Date: `2026-04-14`
- Time: `13:11`
- Agenda: 남은 UX polishing을 공통 앱 셸부터 시작할지, 화면별 미세 조정부터 시작할지 결정
- Participants: User, Codex
- Options Considered:
  - 각 화면의 버튼, 문구, 간격을 개별적으로 먼저 다듬는다
  - 앱 공통 셸과 전역 타이포그래피를 먼저 정리하고, 세부 폴리싱은 그 다음 단계로 진행한다
- Decision: 공통 앱 셸과 전역 폰트 적용을 먼저 정리하고, 화면별 미세 폴리싱은 후속 슬라이스로 분리한다.
- Rationale: 현재는 `/season`, `/entries`, `/season-book`, `/order` 흐름마다 상단 구조와 이동 맥락이 제각각이라 개별 화면만 먼저 다듬어도 전체 경험의 일관성이 남지 않는다. 공통 셸을 먼저 두면 이후 폴리싱이 같은 구조 안에서 더 빠르고 안정적으로 진행된다.
- Impact:
  - 주요 앱 화면에 공통 상단 내비게이션과 현재 위치 안내가 추가된다
  - 로딩 화면도 동일한 프레임 안에서 표시되어 전환 인상이 안정된다
  - 전역 폰트가 실제 의도한 앱 타이포그래피 기준으로 정상화된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-019

- Date: `2026-04-14`
- Time: `13:21`
- Agenda: 주문 취소 기능에서 취소 사유 입력을 받을지, 즉시 취소로 처리할지 결정
- Participants: User, Codex
- Options Considered:
  - 사용자가 취소 사유를 입력한 뒤 `POST /season-books/:projectId/cancel`을 호출한다
  - 주문 상태 화면에서 사유 입력 없이 바로 취소 요청을 보낸다
- Decision: 주문 취소는 `/order/[projectId]/status` 화면에서 사유 입력 없이 바로 실행하고, 프론트는 계약 호환을 위해 고정 `cancelReason` 값을 함께 전송한다.
- Rationale: 현재 MVP에서는 취소 흐름의 마찰을 줄이는 것이 더 중요하다. 사유 입력을 붙이면 한 번 더 멈추게 되고, 백엔드 계약상 문자열이 필요하므로 프론트에서 고정값으로 호환만 맞춘다.
- Impact:
  - 주문 상태 화면에 즉시 실행 가능한 취소 액션이 추가된다
  - 프론트는 `cancelReason: "USER_REQUESTED"`를 고정값으로 전송한다
  - 취소 사유 수집 UI는 후속 운영 요구가 생길 때 별도 슬라이스로 분리된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-020

- Date: `2026-04-14`
- Time: `14:30`
- Agenda: 배송지 변경 기능을 빈 재입력 폼으로 둘지, 상태 조회 응답 기반 prefill 수정 폼으로 둘지 결정
- Participants: User, Codex
- Options Considered:
  - 배송지 변경 시 빈 폼을 열고 사용자가 전체 주소를 다시 입력한다
  - `GET /season-books/:projectId/status`의 `shipping` snapshot을 기본값으로 사용해 상태 화면 안에서 펼침형 수정 폼을 연다
- Decision: 주문 상태 화면에서 `status.shipping`을 우선 prefill source로 사용하고, 인라인 펼침형 수정 폼으로 `PATCH /season-books/:projectId/shipping`를 호출한다.
- Rationale: 이미 주문된 건의 배송지 변경은 기존 정보를 바탕으로 일부만 고치는 경우가 대부분이라, 빈 폼 재입력보다 수정 UX가 훨씬 자연스럽다. 상태 화면 안에서 바로 처리하면 주문 취소와 같은 관리 영역으로도 읽힌다.
- Impact:
  - `/order/[projectId]/status`에서 현재 배송지 snapshot을 확인하고 바로 수정할 수 있다
  - 저장 성공 시 응답의 merged shipping object로 화면을 즉시 갱신한다
  - `shipping` snapshot이 없는 경우에도 전체 주소 재입력 fallback이 가능하다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/CONTRACT_SPEC.md`
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/frontend.md`

### WEB-021

- Date: `2026-04-14`
- Time: `14:13`
- Agenda: 팀 선택 UI를 텍스트 드롭다운으로 유지할지, 오리지널 SVG 배지 선택기로 바꿀지 결정
- Participants: User, Codex
- Options Considered:
  - 기존 텍스트 `select`를 유지하고 카피와 간격만 다듬는다
  - 팀별 개별 SVG 파일을 두고 선택 UI에 붙인다
  - 공용 SVG 배지 컴포넌트와 팀 메타데이터를 만들고, 팀별 컬러·이니셜·캐릭터 변형만 주는 방식으로 선택 UI를 교체한다
- Decision: 공식 로고 대신 공용 SVG 배지 시스템을 만들고, `favoriteTeam`과 `opponentTeam` 입력은 귀여운 오리지널 배지 선택기로 교체한다.
- Rationale: 현재 드롭다운은 팀 인지가 느리고 제품 인상이 약하다. 반면 공식 로고나 마스코트를 직접 쓰지 않고도 팀 컬러, 이니셜, 오리지널 캐릭터 변형으로 충분한 구분감과 감정적 매력을 줄 수 있다. 공용 컴포넌트 구조로 두면 향후 라이선스 확보 시 공식 에셋 교체도 쉬워진다.
- Impact:
  - `/entries/new`와 `/entries/[id]/edit`의 팀 선택이 시각적 배지 기반 UX로 바뀐다
  - 팀명, 이니셜, 색상 체계가 공용 메타데이터로 정리된다
  - 향후 대시보드와 상세 화면에도 같은 배지를 확장할 수 있는 기반이 생긴다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

### WEB-022

- Date: `2026-04-14`
- Time: `14:23`
- Agenda: 팀 배지 2차 보정에서 이니셜 체계와 캐릭터 모티프를 어떻게 고정할지 결정
- Participants: User, Codex
- Options Considered:
  - 기존 추상 캐릭터 톤을 유지하고 색상과 이니셜만 미세 조정한다
  - 팀별 실제 모티프를 반영하되, 공식 로고 대신 오리지널 SVG 캐릭터 해석으로 풀어낸다
- Decision: 팀 배지는 오리지널 SVG 톤을 유지하면서도 팀별 모티프를 더 분명히 반영한다. `SSG`는 회색 강아지, `키움`은 히어로 헬멧, `NC`는 공룡, `KIA`는 호랑이, `롯데`는 갈매기, `삼성`은 사자, `한화`는 독수리 방향으로 보정하고, 이니셜은 `LG`, `DS`, `SSG`, `KW`, `KT`, `NC`, `KIA`, `LO`, `SL`, `HE`로 확정한다.
- Rationale: 첫 버전 배지는 전체 톤은 좋았지만 팀별 개성이 조금 추상적으로 읽혔다. 실제 팀 이미지와 느슨하게 연결되는 모티프를 넣어주면 팀 인지가 빨라지고, 동시에 공식 자산을 직접 쓰지 않는 안전선도 유지할 수 있다. 3글자 이니셜은 별도 폭 대응을 넣어 칩이 깨지지 않게 한다.
- Impact:
  - 팀 선택 배지의 캐릭터 구분감이 강화된다
  - 2글자와 3글자 이니셜 칩이 모두 안정적으로 렌더링된다
  - 이후 다른 화면에 배지를 확장해도 같은 모티프 체계를 재사용할 수 있다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

### WEB-023

- Date: `2026-04-14`
- Time: `14:34`
- Agenda: 팀 배지를 종별 캐릭터 해석으로 유지할지, 사람 얼굴과 모자 중심의 단순 이모티콘으로 다시 정리할지 결정
- Participants: User, Codex
- Options Considered:
  - 종별 캐릭터 모티프를 유지하면서 디테일만 계속 보정한다
  - 배지를 전부 웃는 사람 얼굴 + 팀별 컬러 모자 구조로 통일하고, 모자 전면 한 글자로만 팀 차이를 준다
- Decision: 팀 선택 배지는 웃는 사람 얼굴과 야구모자 구조로 통일하고, 팀별 차이는 배경색, 모자색, 모자 앞 한 글자 이니셜로만 표현한다. 모자 글자는 `LG:T`, `두산:D`, `SSG:L`, `키움:K`, `KT:W`, `NC:D`, `KIA:T`, `롯데:G`, `삼성:S`, `한화:E`로 고정하며, 카드의 상단 이니셜 칩과 하단 `OO 배지` 보조 문구는 제거한다.
- Rationale: 이전 버전은 개성은 있었지만 배지마다 시각 문법이 달라져 제품 전체 인상이 약간 산만해졌다. 사람 얼굴 이모티콘과 모자 중심으로 통일하면 더 귀엽고 읽기 쉬우며, 팀별 컬러와 한 글자만으로도 충분한 구분감을 만들 수 있다.
- Impact:
  - 팀 선택 카드가 더 단순하고 통일된 인상으로 정리된다
  - 별도 이니셜 칩이 사라져 카드 상단 밀도가 낮아진다
  - 2글자, 3글자 대응 문제 없이 모든 팀을 동일한 구조로 렌더링할 수 있다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

### WEB-024

- Date: `2026-04-14`
- Time: `14:38`
- Agenda: 단순화된 팀 배지에서 모자 실루엣을 어떻게 보정할지 결정
- Participants: User, Codex
- Options Considered:
  - 현재처럼 넓은 곡선 챙과 머리카락 레이어를 유지하고 세부 위치만 미세 조정한다
  - 야구모자를 `크라운 + 전면 패치 + 챙`이 구분되는 구조로 다시 그려서 모자 인지를 우선한다
- Decision: 팀 배지의 모자는 전면 패치와 챙이 분리된 구조로 다시 그리고, 글자는 모자 패치 위에 배치한다.
- Rationale: 이전 버전은 챙과 앞머리 곡선이 겹치면서 눈썹처럼 읽혔다. 제품적으로는 캐릭터 디테일보다 “야구모자를 쓰고 있다”는 인지가 더 중요하므로, 실루엣을 먼저 바로잡는 쪽이 맞다.
- Impact:
  - 모자 글자가 얼굴이나 앞머리에 가려지지 않는다
  - 배지가 더 직관적으로 야구 팬 캐릭터처럼 읽힌다
  - 이후 색상만 바꿔도 팀 구분이 안정적으로 유지된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

### WEB-025

- Date: `2026-04-14`
- Time: `14:42`
- Agenda: 모자 실루엣을 얼굴 뒤로 세울지, 얼굴 윗부분을 덮는 눌러쓴 구조로 바꿀지 결정
- Participants: User, Codex
- Options Considered:
  - 모자 몸통을 얼굴 뒤에 세우고 챙만 분리해 둔다
  - 모자 전면 패치와 챙이 얼굴 윗부분을 살짝 덮도록 내려서 실제로 눌러쓴 인상을 만든다
- Decision: 팀 배지의 모자는 얼굴 윗부분을 살짝 덮는 눌러쓴 구조로 보정한다.
- Rationale: 사용자가 본 문제는 “모자를 쓴 얼굴”이 아니라 “얼굴 뒤에 물체가 달린 캐릭터”처럼 읽히는 점이었다. 챙과 패치를 얼굴과 겹치게 두면 야구모자 인지가 훨씬 즉각적으로 생긴다.
- Impact:
  - 모자 챙이 뿔처럼 튀어나오지 않고 이마를 덮는 형태로 읽힌다
  - 캐릭터가 더 안정적으로 사람 얼굴 이모티콘처럼 보인다
  - 팀별 색상 차이를 유지하면서도 공통 실루엣이 정돈된다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

### WEB-026

- Date: `2026-04-14`
- Time: `14:57`
- Agenda: 사용자가 제공한 팀 캡 캐릭터 시트를 바로 UI에 연결할지, 먼저 개별 PNG 자산으로 분할해 준비 단계로 둘지 결정
- Participants: User, Codex
- Options Considered:
  - `capimage.png`를 바로 현재 팀 선택 UI에 연결하면서 자산 교체와 UI 검증을 한 번에 진행한다
  - 먼저 시트를 개별 PNG 10장으로 분할해 `public/team-badges`에 정리하고, UI 교체는 다음 작업으로 분리한다
- Decision: 이번 작업은 시트 분할만 수행하고, 개별 PNG 자산을 `apps/web/public/team-badges`에 준비한 뒤 UI 연결은 별도 atomic 작업으로 분리한다.
- Rationale: 현재 팀 배지 관련 UI는 롤백과 방향 재정리가 동시에 걸려 있어, 자산 준비와 UI 교체를 한 커밋에 섞으면 리뷰 포인트가 흐려진다. 먼저 개별 PNG를 확보하면 다음 단계에서 카드 레이아웃과 실제 적용 방식을 더 명확하게 회의할 수 있다.
- Impact:
  - `capimage.png`에서 잘라낸 팀별 PNG 10장을 즉시 재사용할 수 있다
  - 다음 회의에서 `TeamBadge`를 PNG 기반으로 교체할지, 선택 화면만 부분 적용할지 분리해서 결정할 수 있다
  - 이번 커밋은 자산 준비 범위에만 머물러 기존 팀 선택 UI 변경과 충돌하지 않는다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

### WEB-027

- Date: `2026-04-14`
- Time: `15:24`
- Agenda: 준비된 팀 PNG 배지를 어떤 범위로 팀 선택 UI에 적용할지 결정
- Participants: User, Codex
- Options Considered:
  - 기존 선택 카드 레이아웃은 유지하고, 배지 렌더러만 SVG에서 PNG로 교체한다
  - 카드 구조와 보조 텍스트까지 함께 다시 설계한다
- Decision: 이번 작업에서는 현재 팀 선택 카드 구조를 크게 흔들지 않고, `TeamBadge`를 PNG 기반으로 교체한다. 다만 기존 의사결정에 맞춰 상단 이니셜 칩과 하단 `OO 배지` 보조 문구는 제거하고 이미지 중심 카드로 정리한다.
- Rationale: 이미 개별 PNG 자산 준비와 가장자리 보정이 끝난 상태라, 우선 실제 입력 UI에 안정적으로 붙이는 것이 가장 작은 기능 단위다. 카드까지 전면 재설계하면 시안 판단 포인트가 늘어나므로, 이번 slice에서는 제품 인식에 직접적인 배지 적용만 확실히 마무리하는 쪽이 맞다.
- Impact:
  - `/entries/new`와 `/entries/[id]/edit`의 팀 선택 UI가 준비된 PNG 배지를 사용한다
  - SVG 전용 메타데이터와 카드 내부 장식이 줄어들어 구조가 단순해진다
  - 이후 카드 배치나 선택 상태 스타일은 별도 UX 폴리싱 작업으로 이어갈 수 있다
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
