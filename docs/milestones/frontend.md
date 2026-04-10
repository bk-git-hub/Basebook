# Basebook Frontend Milestones

이 문서는 프론트엔드 마일스톤과 주요 상태 변화를 기록한다.

규칙:

- 시작, 완료, blocker, scope change, integration ready 상태를 기록한다.
- 길게 서술하지 말고 사실 중심으로 적는다.
- 사용자 검증 전에는 `done`으로 표기하지 않는다.
- 앞으로의 `Related Decision IDs`는 `apps/web/DECISIONS.md`의 `WEB-*` id를 사용한다.

---

## Template

### FE-MILESTONE-XXX

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

### FE-MILESTONE-001

- Date: `2026-04-09`
- Time: `13:40`
- Milestone: Frontend functional specification and contract-aligned page scope locked
- Status: `verified`
- Summary:
  - page list for MVP locked
  - frontend role boundary documented
  - contract-driven development path defined
- Related Decision IDs:
  - `DECISION-001`
  - `DECISION-002`
  - `DECISION-003`
- Blocking Items:
  - worktree creation pending
- Next Step:
  - scaffold frontend worktree and start page shell implementation

### FE-MILESTONE-002

- Date: `2026-04-10`
- Time: `09:15`
- Milestone: Frontend QA role and testing ownership added
- Status: `verified`
- Summary:
  - dedicated frontend QA role added to team playbook
  - frontend QA onboarding spec added
  - frontend QA will share the frontend milestone log for progress updates
- Related Decision IDs:
  - `DECISION-004`
- Blocking Items:
  - frontend QA worktree creation pending
- Next Step:
  - create QA worktree and start smoke tests for dashboard and entry form

### FE-MILESTONE-003

- Date: `2026-04-10`
- Time: `12:09`
- Milestone: `/season` `GET /entries` API integration baseline implemented
- Status: `ready_for_review`
- Summary:
  - `entries` API client 계층 추가
  - `/season`이 `GET /entries`를 서버에서 호출하도록 전환
  - loading, error, empty 상태를 최소 범위로 추가
- Related Decision IDs:
  - `DECISION-005`
- Blocking Items:
  - backend `GET /entries` 구현 및 실제 응답 확인 필요
  - 별도 QA thread에서 통합 테스트 예정
- Next Step:
  - user validation 후 `/entries/[id]` 조회 API 연동으로 이동

### FE-MILESTONE-004

- Date: `2026-04-10`
- Time: `12:15`
- Milestone: `/entries/[id]` `GET /entries/:id` API integration baseline implemented
- Status: `ready_for_review`
- Summary:
  - `entries` API client에 상세 조회 함수 추가
  - `/entries/[id]` 상세 페이지와 로딩 상태 추가
  - 404와 일반 에러를 분리해 표시하고 대시보드 최근 기록에서 상세 페이지로 이동 가능하게 함
- Related Decision IDs:
  - `DECISION-006`
- Blocking Items:
  - backend `GET /entries/:id` 구현 및 실제 id 응답 확인 필요
  - 별도 QA thread에서 통합 테스트 예정
- Next Step:
  - user validation 후 `/entries/[id]/edit`의 `PATCH /entries/:id` 연동으로 이동

### FE-MILESTONE-005

- Date: `2026-04-10`
- Time: `12:40`
- Milestone: `/entries/[id]/edit` `PATCH /entries/:id` API integration baseline implemented
- Status: `ready_for_review`
- Summary:
  - 수정 화면이 `GET /entries/:id` 초기값을 받아 실제 폼으로 렌더링됨
  - `PATCH /entries/:id` client 추가 및 diff payload 저장 흐름 구현
  - 저장 성공 시 상세 화면으로 복귀하고, 실패 시 에러 상태를 화면에서 확인할 수 있게 함
- Related Decision IDs:
  - `DECISION-007`
- Blocking Items:
  - backend `PATCH /entries/:id` 구현 및 실제 저장 반영 확인 필요
  - 사진 편집은 업로드 API 연동 범위 밖이라 이번 PATCH에서 제외됨
  - 별도 QA thread에서 통합 테스트 예정
- Next Step:
  - user validation 후 `/entries/new`의 `POST /entries` 연동으로 이동

### FE-MILESTONE-006

- Date: `2026-04-10`
- Time: `12:52`
- Milestone: `/entries/new` `POST /entries` API integration baseline implemented
- Status: `ready_for_review`
- Summary:
  - `entries` API client에 생성 함수 추가
  - `/entries/new`가 실제 생성 폼과 `POST /entries` 저장 흐름을 갖추게 됨
  - 저장 성공 시 생성된 상세 화면으로 이동하고, `/games`와 업로드는 후속 연동 대상으로 분리함
- Related Decision IDs:
  - `WEB-008`
- Blocking Items:
  - backend `POST /entries` 구현 및 실제 생성 응답 확인 필요
  - `GET /games`와 `POST /uploads/image`는 아직 미연동
  - 별도 QA thread에서 통합 테스트 예정
- Next Step:
  - user validation 후 `/games` 또는 업로드 연동 범위를 별도 회의로 결정

### FE-MILESTONE-007

- Date: `2026-04-10`
- Time: `14:17`
- Milestone: Frontend QA workspace isolated from `apps/web`
- Status: `ready_for_review`
- Summary:
  - `tests/web` 워크스페이스를 추가해 프론트 테스트 실행 경로를 분리함
  - 현재 구현된 `/season`, `/entries/new`, `/entries/[id]`, `/entries/[id]/edit` 흐름에 대한 단위 테스트와 e2e smoke를 추가함
  - `apps/web` 자체 lint/build 기준은 유지한 채 QA 인프라를 루트 워크스페이스로 연결함
- Related Decision IDs:
  - `WEB-009`
- Blocking Items:
  - `/season-book/new`, `/order/[projectId]`는 아직 앱 구현이 없어 테스트 범위에 포함되지 않음
  - 실제 백엔드 연동 e2e는 main 안정화 후 별도 검증 필요
- Next Step:
  - user validation 후 API-connected e2e와 미구현 라우트 회귀 테스트를 순차적으로 확장

### FE-MILESTONE-008

- Date: `2026-04-10`
- Time: `14:58`
- Milestone: `/entries/new` `GET /games` candidate lookup integrated with future auto-fetch path preserved
- Status: `ready_for_review`
- Summary:
  - `games` API client를 추가하고 `/entries/new`에서 버튼 기반 `GET /games` 조회를 연결함
  - 조회 조건 생성과 후보 선택 반영 로직을 분리해 추후 자동 조회 trigger로 바꾸기 쉬운 구조를 마련함
  - 경기 후보를 선택하면 `gameId`, 날짜, 상대 팀, 점수, 구장 정보가 폼에 자동 반영되게 함
- Related Decision IDs:
  - `WEB-010`
- Blocking Items:
  - backend `GET /games` 구현 및 실제 후보 응답 shape 확인 필요
  - 자동 조회 UX와 사진 업로드는 후속 슬라이스에서 이어서 검토 예정
  - 별도 QA thread에서 통합 테스트 예정
- Next Step:
  - user validation 후 `/uploads/image` 연동 또는 `GET /games` 자동 조회 전환 범위를 회의로 결정

### FE-MILESTONE-009

- Date: `2026-04-10`
- Time: `15:15`
- Milestone: `/entries/new` `POST /uploads/image` attachment flow integrated
- Status: `ready_for_review`
- Summary:
  - `uploads` API client를 추가하고 `/entries/new`에서 파일 선택 즉시 `POST /uploads/image`를 호출하도록 연결함
  - 업로드된 asset을 폼 state에 보관하고, 저장 전 제거할 수 있는 첨부 목록 UI를 추가함
  - 최종 `POST /entries` payload preview가 실제 업로드된 `photos`를 포함하도록 갱신됨
- Related Decision IDs:
  - `WEB-011`
- Blocking Items:
  - backend `POST /uploads/image` 구현 및 multipart 응답 확인 필요
  - 이미지 미리보기와 업로드 재시도 UX는 후속 polish 범위로 남음
  - 별도 QA thread에서 통합 테스트 예정
- Next Step:
  - user validation 후 `/entries/new` 최종 polish 또는 미구현 라우트 작업 범위를 회의로 결정
