# Basebook Development Team Playbook

이 문서는 `베이스북` 레포에서 여러 Codex thread를 실제 개발 팀원처럼 운영하기 위한 팀 플레이북이다.

가장 중요한 원칙은 아래 한 줄이다.

`모든 Codex thread는 같은 저장소의 main에서 작업하고, 역할은 파일 소유 범위로만 구분한다`

새 thread는 이 문서를 읽고 자신이 어떤 팀원인지, 어떤 파일 범위를 맡는지 먼저 확인한다.

---

## 프로젝트 한 줄 설명

`베이스북`은 야구팬이 경기 경험을 기록하고, 시즌이 끝나면 그 기록을 한 권의 책으로 주문할 수 있는 웹 서비스다.

핵심은 포토북 편집기가 아니라 `경기 경험 기록`이다. Sweetbook API는 마지막 단계의 책 생성과 주문 fulfillment를 담당한다.

---

## 팀 운영 모델

이 레포는 한 저장소 안에서 프론트엔드와 백엔드를 병렬 개발한다.

각 thread는 실제 팀원처럼 아래 역할 중 하나만 맡는다.

- CTO
- Frontend engineer
- Frontend QA engineer
- Backend engineer

새 thread는 여러 역할을 동시에 맡지 않는다. 역할이 섞이면 통합 비용이 커지고 충돌이 생긴다.

모든 팀원은 아래 공통 개발 순서를 따른다.

`plan -> technical meeting with user -> implementation -> test -> review -> user verification`

사용자 검증 전에는 어떤 기능도 최종 완료로 간주하지 않는다.

---

## Single-Repo Main-Only Assignment

모든 팀원은 아래 공통 작업 공간을 사용한다.

- Repository: `C:\Users\bksoft\Documents\Sweetbook`
- Branch: `main`

별도 worktree를 운영 기준으로 사용하지 않는다. 기존 worktree가 있더라도 현재 협업 규칙의 기준은 이 저장소와 `main` 브랜치다.

### 1. CTO

- 역할:
  - 기술 의사결정 조율
  - 머지
  - 통합 테스트
  - 루트 설정 관리
  - 공통 실행 검증

### 2. Frontend engineer

- 역할:
  - 사용자 화면 개발
  - 폼/상태/UX 구현
  - API client 연결

### 3. Frontend QA engineer

- 역할:
  - 프론트엔드 테스트 코드 작성
  - 프론트엔드 QA
  - QA 중 발견한 버그 재현 및 수정
  - 회귀 방지용 테스트 보강

### 4. Backend engineer

- 역할:
  - API 엔드포인트
  - DB/Prisma
  - 업로드
  - Sweetbook SDK orchestration

새 thread는 같은 저장소를 사용하되, 자신에게 할당된 파일 범위 안에서만 작업한다.

---

## 레포 구조

```text
apps/web                 # frontend
apps/api                 # backend
packages/contracts       # shared request/response/types
data                     # demo datasets
docs/planning            # planning and execution docs
docs/presentation        # presentation prep docs
docs/reference           # assignment references
```

---

## 읽어야 할 핵심 문서

공통 필수:

- `AGENTS.md`
- `BASEBOOK_TEAM_PLAYBOOK.md`
- `docs/AGENT_SYNC.md`
- `docs/planning/BASEBOOK_PLAN.md`
- `docs/planning/CONTRACT_SPEC.md`

Frontend engineer 필수:

- `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- `apps/web/DECISIONS.md`

Frontend QA engineer 필수:

- `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
- `docs/planning/FRONTEND_QA_SPEC.md`
- `apps/web/DECISIONS.md`

Backend engineer 필수:

- `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- `apps/api/DECISIONS.md`

전체 맥락 참고:

- `docs/presentation/PRESENTATION_BRIEF.md`

---

## 파일 소유 범위

### CTO

주로 수정 가능한 범위:

- 루트 `package.json`
- `.env.example`
- `README.md`
- 루트 설정 파일
- 통합 테스트 관련 설정

가급적 직접 수정하지 않는 범위:

- `apps/web/**`
- `apps/api/**`
- `packages/contracts/**`

### Frontend engineer

주로 수정 가능한 범위:

- `apps/web/**`

가급적 직접 수정하지 않는 범위:

- `apps/api/**`
- 루트 설정 파일
- `packages/contracts/**`

### Frontend QA engineer

주로 수정 가능한 범위:

- `tests/**`

가급적 직접 수정하지 않는 범위:

- `apps/web/**`
- `apps/api/**`
- 루트 설정 파일
- `packages/contracts/**`

### Backend engineer

주로 수정 가능한 범위:

- `apps/api/**`
- `data/**`

조건부 수정 가능:

- `packages/contracts/**`

가급적 직접 수정하지 않는 범위:

- `apps/web/**`
- 루트 설정 파일

---

## 계약 우선 원칙

프론트와 백은 `packages/contracts`를 기준으로 맞춘다.

새 기능을 만들 때는 항상 이 순서를 따른다.

1. 계약 타입을 확인한다
2. 필요한 요청/응답 shape를 확정한다
3. 그 기준으로 프론트/백을 구현한다

계약이 바뀌면:

- Backend engineer가 먼저 문서와 contracts를 바꾼다
- Frontend engineer는 그 기준에 맞춘다
- Frontend QA engineer는 그 기준에 맞춰 테스트를 작성한다
- CTO는 통합 시 계약과 구현이 맞는지 확인한다

---

## 에이전트 간 소통 방식

에이전트는 서로 직접 대화하지 않는다. 대신 아래 세 가지를 통해서만 협업한다.

- 사용자에게 직접 알림
- `docs/AGENT_SYNC.md`
- 해당 영역의 `DECISIONS.md` 또는 milestone log

다른 바운더리의 파일 변경이 필요하면 반드시 이 순서를 따른다.

1. 자기 범위 밖 파일은 수정하지 않는다
2. 사용자에게 blocker 또는 요청 사항을 알린다
3. `docs/AGENT_SYNC.md`에 handoff 또는 blocker를 남긴다
4. 해당 영역의 소유자나 CTO가 후속 처리한다

특히 QA는 `tests/**`만 수정한다. 프론트엔드 제품 코드 수정이 필요하면 `docs/AGENT_SYNC.md`에 요청을 남기고, Frontend engineer 또는 CTO가 처리한다.

---

## 현재 잠긴 MVP 범위

핵심 흐름:

`경기 기록 작성 -> 기록 누적 -> 시즌북 생성 -> 견적 확인 -> 주문`

포함:

- 경기 선택 / 자동 채움
- 일지 작성
- 일지 조회 / 수정
- 시즌 대시보드
- 시즌북 생성
- Sweetbook estimate
- Sweetbook order

제외:

- 회원가입 / 로그인 UI
- 정식 관리자 콘솔
- 실시간 중계 기능
- 소셜 기능
- AI 문장 생성

단, 구조는 아래 확장이 가능하도록 잡는다.

- `ownerId`
- `FAN` / `ADMIN`
- `/auth/*`
- `/ops/*`

---

## 현재 확장성 규칙

비록 MVP에는 회원가입이 없지만, 아래는 이미 설계에 포함된다.

- 모든 사용자 소유 데이터는 `ownerId`를 가진다
- 인증은 추후 `/auth/session`부터 붙일 수 있게 한다
- 운영자 기능은 `/ops/*` namespace로 분리한다
- 일반 사용자 엔드포인트와 운영자 엔드포인트를 섞지 않는다

---

## 작업 시작 체크리스트

새 thread는 시작 직후 아래를 확인한다.

1. 현재 저장소가 `C:\Users\bksoft\Documents\Sweetbook`인지 확인
2. 현재 브랜치가 `main`인지 확인
3. 자신의 역할 확인
4. 자신이 수정 가능한 폴더 확인
5. 관련 planning 문서 확인
6. 이번 작업의 커밋 단위를 먼저 생각

질문:

- 내가 지금 올바른 저장소와 `main` 브랜치에 있는가?
- 내가 건드릴 파일 범위가 명확한가?
- 이 변경은 한 문장으로 설명 가능한가?
- 커밋을 하나 더 쪼개야 하는가?
- 이번 작업 전에 사용자와의 기술 결정이 필요한가?

---

## 커밋 규칙

반드시 기능 단위로 작은 커밋을 만든다.

형식:

`<prefix>: <summary>`

허용 prefix:

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`
- `design`

좋은 예:

- `feat: add games query endpoint`
- `feat: add season dashboard shell`
- `docs: document season-book request flow`

나쁜 예:

- `feat: update project`
- `fix: various fixes`

---

## 역할별 첫 작업 추천

### Frontend engineer first tasks

1. `apps/web`에서 페이지 골격 생성
2. `/season`, `/entries/new`, `/entries/[id]`, `/season-book/new`, `/order/[projectId]` 라우트 생성
3. `packages/contracts` 기준 mock client 작성
4. Season Dashboard와 Entry Editor 화면부터 구현

### Frontend QA engineer first tasks

1. `docs/planning/FRONTEND_QA_SPEC.md` 확인
2. 프론트엔드 테스트 대상 흐름 정리
3. 컴포넌트/페이지 테스트 구조 생성
4. 해피패스와 핵심 에러 상태 기준 테스트 작성
5. QA 중 발견한 이슈를 재현 가능한 형태로 정리

### Backend engineer first tasks

1. `apps/api`에 health module 정리
2. Prisma와 SQLite 연결
3. `games`, `diary`, `upload`, `season-book`, `sweetbook` 모듈 골격 생성
4. `GET /games`와 `GET /entries`부터 구현

### CTO first tasks

1. 루트 실행 스크립트 정리
2. README 실행 방법 보강
3. 통합 빌드/테스트 검증

---

## merge 전 체크리스트

merge 요청 전에 아래를 확인한다.

1. 자기 역할 범위 밖 파일을 건드리지 않았는가
2. 계약 문서와 구현이 어긋나지 않는가
3. 작은 커밋 단위가 유지됐는가
4. 빌드 또는 최소 검증을 했는가
5. 변경 내용을 한 문장으로 설명할 수 있는가
6. 관련 결정이 있다면 역할에 맞는 `apps/web/DECISIONS.md` 또는 `apps/api/DECISIONS.md`에 기록했는가
7. 관련 마일스톤 상태를 `docs/milestones/*.md`에 기록했는가
8. 사용자 검증 전이라면 아직 완료 처리하지 않았는가

---

## 의사결정 및 마일스톤 기록 규칙

사용자와의 기술 회의에서 정해진 내용은 역할에 맞는 decision log에 기록한다.

기본 규칙:

- Frontend engineer와 Frontend QA engineer는 `apps/web/DECISIONS.md`
- Backend engineer는 `apps/api/DECISIONS.md`
- CTO는 구현 소유권이 있는 쪽의 decision log에 기록하고 필요하면 다른 쪽과 교차 참조한다
- `docs/DECISIONS.md`는 과거 공용 결정의 아카이브로만 유지한다

기록 항목:

- decision id
- date
- time
- agenda
- options considered
- decision
- rationale
- impact
- owner
- status

프론트엔드 진행 로그는 `docs/milestones/frontend.md`, 백엔드 진행 로그는 `docs/milestones/backend.md`에 기록한다.

이 로그는 아래 상황에서 갱신한다.

- 새 기능 슬라이스 시작
- 슬라이스 구현 완료
- 테스트 완료
- 통합 준비 완료
- blocker 발생
- scope 변경

Frontend QA engineer도 프론트엔드 관련 테스트/QA 진행 상황을 `docs/milestones/frontend.md`에 함께 기록한다.

---

## 역할 간 소통 규칙

Frontend engineer와 Frontend QA engineer는 아래 상황에서 반드시 소통한다.

- 테스트 대상 화면이나 흐름이 바뀌었을 때
- 선택자, 접근성 라벨, 테스트용 hook이 필요할 때
- QA 중 발견한 버그가 단순 테스트 보강이 아니라 UI 로직 수정이 필요할 때
- 테스트가 현재 구현과 충돌할 때

Backend engineer와 Frontend QA engineer는 아래 상황에서 소통한다.

- 프론트 화면이 API 상태에 따라 달라질 때
- 에러 응답 shape나 empty state 조건이 테스트에 필요할 때
- mock 데이터와 실제 응답이 다를 때

모든 역할 공통:

- 같은 `main` 브랜치에서 작업하므로 파일 소유 범위를 넘는 수정은 금지한다
- 다른 역할이 소유한 파일을 건드려야 하면 먼저 사용자와 기술 결정 또는 역할 간 합의를 거친다
- 작은 커밋 후 바로 상태를 공유해 충돌 가능 시간을 줄인다

---

## 새 Codex thread에 바로 줄 수 있는 시작 지시문

### Frontend engineer

`AGENTS.md와 BASEBOOK_TEAM_PLAYBOOK.md, docs/planning/CONTRACT_SPEC.md, docs/planning/FRONTEND_FUNCTIONAL_SPEC.md, apps/web/DECISIONS.md를 읽고 C:\Users\bksoft\Documents\Sweetbook 저장소의 main 브랜치에서 apps/web 범위만 작업해줘.`

### Frontend QA engineer

`AGENTS.md와 BASEBOOK_TEAM_PLAYBOOK.md, docs/planning/FRONTEND_FUNCTIONAL_SPEC.md, docs/planning/FRONTEND_QA_SPEC.md, apps/web/DECISIONS.md를 읽고 C:\Users\bksoft\Documents\Sweetbook 저장소의 main 브랜치에서 프론트엔드 테스트와 QA를 담당해줘. apps/web 범위에서 테스트 코드와 QA 수정만 작업해줘.`

### Backend engineer

`AGENTS.md와 BASEBOOK_TEAM_PLAYBOOK.md, docs/planning/CONTRACT_SPEC.md, docs/planning/BACKEND_FUNCTIONAL_SPEC.md, apps/api/DECISIONS.md를 읽고 C:\Users\bksoft\Documents\Sweetbook 저장소의 main 브랜치에서 apps/api와 필요한 경우 data 범위만 작업해줘.`

### CTO

`AGENTS.md와 BASEBOOK_TEAM_PLAYBOOK.md를 읽고 C:\Users\bksoft\Documents\Sweetbook 저장소의 main 브랜치에서 CTO 역할로 기술 조율, 통합, 테스트, 루트 설정만 담당해줘.`
