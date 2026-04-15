# Next QA Handoff

Last updated: 2026-04-15 KST

이 문서는 다음 QA 작업을 시작하기 전에 먼저 읽는 인수인계 노트다. `AGENTS.md`와 `docs/AGENT_SYNC.md`가 최상위 규칙이고, 이 문서는 `tests/web` 관점의 실행 메모만 담는다.

## 먼저 읽을 파일

1. `AGENTS.md`
2. `BASEBOOK_TEAM_PLAYBOOK.md`
3. `docs/AGENT_SYNC.md`
4. `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
5. `docs/planning/FRONTEND_QA_SPEC.md`
6. `apps/web/DECISIONS.md`
7. `tests/web/README.md`
8. `tests/web/TEST_ARCHITECTURE.md`
9. `tests/web/TEST_INVENTORY.md`
10. `tests/web/MANUAL_E2E_SCENARIOS.md`

## QA 역할과 쓰기 범위

- QA의 기본 쓰기 범위는 `tests/**`다.
- `apps/web/**`, `apps/api/**`, `packages/**`, `data/**`, `docs/**`는 원칙적으로 읽기 전용으로 취급한다.
- 단, cross-agent blocker나 handoff는 협업 규칙에 따라 `docs/AGENT_SYNC.md`에 append-only로 남길 수 있다.
- 제품 코드 수정이 필요하면 직접 고치기보다 실패 조건, 재현 절차, 기대 동작을 기록하고 사용자 또는 담당 역할에 넘긴다.

## 현재 `tests/web` 구성

- `src/unit`
  - 시즌 대시보드, 기록 상세, 기록 생성, 기록 수정 smoke test
- `src/e2e`
  - `/entries/new` real browser route smoke
- `scripts/order-flow-report.cjs`
  - 업로드 -> 견적 -> 주문 happy path와 증거물 생성
- `scripts/qa-api-server.cjs`
  - report script용 API 부트 helper
- `MANUAL_E2E_SCENARIOS.md`
  - 사람이 직접 따라 하는 수동 QA 시나리오
- `TEST_ARCHITECTURE.md`
  - 왜 테스트를 이렇게 나눴는지 설명하는 문서
- `TEST_INVENTORY.md`
  - 테스트 파일별 존재 이유와 보증 범위 문서

## 현재 확인된 상태

- `tests/web` unit smoke는 현재 기준으로 4 files / 13 tests 통과 상태다.
- `tests/web` Playwright smoke는 현재 기준으로 2 tests 통과 상태다.
- 루트의 `npm run test:web:e2e` 명령은 현재 다시 통과하며, `tests/web/playwright.config.ts`는 `localhost:3000` 기준으로 production build 서버를 직접 올리도록 맞춰져 있다.
- `test:e2e:order-report`는 최근 기준으로 아래 happy path를 실제 브라우저에서 통과했다.
  - `POST /uploads/image`
  - `/season-book/new`
  - `POST /season-books/estimate`
  - `/order/[projectId]`
  - `POST /season-books/order`
  - 완료 화면 `CONFIRMED`, `ORDERED`
- 증거물은 `tests/web/test-results/order-flow-report/` 아래에 생성된다.
- `POST /season-books/order` 관련 과거 blocker는 `docs/AGENT_SYNC.md`의 `SYNC-008` 기준으로 해소됐다.

## 아직 자동화가 부족한 영역

- `/order/[projectId]/status` 자동화 회귀 테스트
- 주문 취소와 배송지 변경 흐름
- 시즌북 견적/주문 실패 케이스 전체
- 샘플 데이터 품질 자체에 대한 검증

## 다음 작업 시작 체크리스트

1. `git status --short`로 다른 에이전트의 진행 중 변경을 먼저 확인한다.
2. `docs/AGENT_SYNC.md`의 open 항목을 읽고, resolved 여부를 최신 코드와 비교한다.
3. `tests/web/TEST_INVENTORY.md`를 보고 이번에 건드릴 테스트가 왜 있는지 먼저 파악한다.
4. 프론트나 백엔드가 새 라우트나 계약을 추가했다면, 어느 레이어에 테스트를 추가할지 먼저 정한다.
5. 사람이 봐야 하는 UX인지, 반복 가능한 로직인지, 실제 통합 happy path인지에 따라 아래 셋 중 하나를 고른다.
   - `src/unit`
   - `src/e2e`
   - `scripts/*`

## 권장 검증 명령

Codex가 WSL/bash 경로에서 실행될 때 Linux `node`와 Windows용 `node_modules`가 섞이면 optional dependency 오류가 날 수 있다. 그 경우 bash 안에서 Windows npm을 명시해 실행한다.

```bash
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test -w tests/web
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test:e2e -w tests/web
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test:e2e:order-report -w tests/web
```

API와 web 자체 빌드/테스트를 함께 보고 싶으면 루트에서 아래도 같이 본다.

```bash
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run build -w apps/web
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run build -w apps/api
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test -w apps/api
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test:e2e -w apps/api
```

## 수동 통합 테스트 우선순위

1. `/season`
2. `/entries/new`
3. `/entries/[id]/edit`
4. `/season-book/new`
5. `/order/[projectId]`
6. `/order/[projectId]/status`

자세한 단계는 `MANUAL_E2E_SCENARIOS.md`를 본다.

## 보고 방식

- 통과/실패는 실행한 명령과 결과를 함께 남긴다.
- 사용자에게 전달할 때는 아래를 구분한다.
  - 테스트 코드 통과
  - 브라우저 smoke 통과
  - 프론트-백 happy path 통과
  - 수동 시나리오 통과
- 제품 코드 수정이 필요한 실패는 `docs/AGENT_SYNC.md`에 blocker나 request로 남기고, 사용자에게 같은 사이클 안에서 알린다.
- QA가 만든 테스트/문서는 가능한 한 `tests/**`만 커밋한다.
