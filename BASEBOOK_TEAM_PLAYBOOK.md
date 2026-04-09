# Basebook Development Team Playbook

이 문서는 `베이스북` 레포에서 여러 Codex thread를 실제 개발 팀원처럼 운영하기 위한 팀 플레이북이다.

가장 중요한 원칙은 아래 한 줄이다.

`한 Codex thread = 한 팀원 = 한 worktree = 한 branch`

새 thread는 이 문서를 읽고 자신이 어떤 팀원인지, 어떤 폴더를 열어야 하는지, 어디까지 수정할 수 있는지 먼저 확인한다.

---

## 프로젝트 한 줄 설명

`베이스북`은 야구팬이 경기 경험을 기록하고, 시즌이 끝나면 그 기록을 한 권의 책으로 주문할 수 있는 웹 서비스다.

핵심은 포토북 편집기가 아니라 `경기 경험 기록`이다. Sweetbook API는 마지막 단계의 책 생성과 주문 fulfillment를 담당한다.

---

## 팀 운영 모델

이 레포는 한 저장소 안에서 프론트엔드와 백엔드를 병렬 개발한다.

각 thread는 실제 팀원처럼 아래 역할 중 하나만 맡는다.

- Integration engineer
- Frontend engineer
- Backend engineer

새 thread는 여러 역할을 동시에 맡지 않는다. 역할이 섞이면 통합 비용이 커지고 충돌이 생긴다.

---

## Worktree Assignment

아래 worktree와 branch 조합을 기본 규칙으로 사용한다.

### 1. Integration engineer

- Worktree: `C:\Users\bksoft\Documents\Sweetbook`
- Branch: `main`
- 역할:
  - 머지
  - 통합 테스트
  - 루트 설정 관리
  - 공통 실행 검증

### 2. Frontend engineer

- Worktree: `C:\Users\bksoft\Documents\Basebook-web`
- Branch: `codex/web`
- 역할:
  - 사용자 화면 개발
  - 폼/상태/UX 구현
  - API client 연결

### 3. Backend engineer

- Worktree: `C:\Users\bksoft\Documents\Basebook-api`
- Branch: `codex/api`
- 역할:
  - API 엔드포인트
  - DB/Prisma
  - 업로드
  - Sweetbook SDK orchestration

새 thread는 자신에게 할당된 worktree에서만 작업한다. 잘못된 worktree를 열었으면 바로 멈추고 맞는 폴더로 이동한다.

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
- `docs/planning/BASEBOOK_PLAN.md`
- `docs/planning/CONTRACT_SPEC.md`

Frontend engineer 필수:

- `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`

Backend engineer 필수:

- `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`

전체 맥락 참고:

- `docs/presentation/PRESENTATION_BRIEF.md`

---

## 파일 소유 범위

### Integration engineer

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
- Integration engineer는 통합 시 계약과 구현이 맞는지 확인한다

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

1. 현재 worktree 경로 확인
2. 현재 브랜치 확인
3. 자신의 역할 확인
4. 자신이 수정 가능한 폴더 확인
5. 관련 planning 문서 확인
6. 이번 작업의 커밋 단위를 먼저 생각

질문:

- 내가 지금 올바른 worktree를 열었는가?
- 내가 건드릴 파일 범위가 명확한가?
- 이 변경은 한 문장으로 설명 가능한가?
- 커밋을 하나 더 쪼개야 하는가?

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

### Backend engineer first tasks

1. `apps/api`에 health module 정리
2. Prisma와 SQLite 연결
3. `games`, `diary`, `upload`, `season-book`, `sweetbook` 모듈 골격 생성
4. `GET /games`와 `GET /entries`부터 구현

### Integration engineer first tasks

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

---

## 새 Codex thread에 바로 줄 수 있는 시작 지시문

### Frontend engineer

`AGENTS.md와 BASEBOOK_TEAM_PLAYBOOK.md, docs/planning/CONTRACT_SPEC.md, docs/planning/FRONTEND_FUNCTIONAL_SPEC.md를 읽고 C:\Users\bksoft\Documents\Basebook-web worktree의 codex/web 브랜치에서 apps/web 범위만 작업해줘.`

### Backend engineer

`AGENTS.md와 BASEBOOK_TEAM_PLAYBOOK.md, docs/planning/CONTRACT_SPEC.md, docs/planning/BACKEND_FUNCTIONAL_SPEC.md를 읽고 C:\Users\bksoft\Documents\Basebook-api worktree의 codex/api 브랜치에서 apps/api와 필요한 경우 data 범위만 작업해줘.`

### Integration engineer

`AGENTS.md와 BASEBOOK_TEAM_PLAYBOOK.md를 읽고 C:\Users\bksoft\Documents\Sweetbook worktree의 main 브랜치에서 통합, 테스트, 루트 설정만 담당해줘.`
