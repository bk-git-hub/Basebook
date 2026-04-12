# Next QA Handoff

Last updated: 2026-04-13 KST

이 문서는 다음 QA 작업을 시작하기 전에 먼저 읽는 인수인계 노트다. `AGENTS.md`와 `docs/AGENT_SYNC.md`가 최상위 규칙이고, 이 문서는 `tests/web` 관점의 실행 메모만 담는다.

## 먼저 읽을 파일

1. `AGENTS.md`
2. `BASEBOOK_TEAM_PLAYBOOK.md`
3. `docs/AGENT_SYNC.md`
4. `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`
5. `docs/planning/FRONTEND_QA_SPEC.md`
6. `apps/web/DECISIONS.md`
7. `tests/web/MANUAL_E2E_SCENARIOS.md`

## QA 역할과 쓰기 범위

- QA의 기본 쓰기 범위는 `tests/**`다.
- `apps/web/**`, `apps/api/**`, `packages/**`, `data/**`, `docs/**`는 원칙적으로 읽기 전용으로 취급한다.
- 단, cross-agent blocker나 handoff는 협업 규칙에 따라 `docs/AGENT_SYNC.md`에 append-only로 남길 수 있다.
- 제품 코드 수정이 필요하면 직접 고치기보다 실패 조건, 재현 절차, 기대 동작을 기록하고 사용자 또는 담당 역할에 넘긴다.

## 현재 확인된 상태

- `POST /season-books/estimate`는 백엔드 e2e에서 happy path와 missing entry 404가 검증되어 있다.
- `GET /entries`, `GET /games`, `POST /entries`, `PATCH /entries/:id`, `POST /uploads/image`는 기존 API e2e 범위에 포함되어 있다.
- 프론트 빌드는 최근 확인 시 `/order/[projectId]`, `/season-book/new`, `/season`, `/entries/*` 라우트를 포함해 통과했다.
- R2 upload storage 변경은 한때 build blocker였지만, `docs/AGENT_SYNC.md`의 `SYNC-006` 기준으로 백엔드가 resolved 처리했다. 다음 QA 때는 다시 빌드와 e2e로 재확인한다.
- `POST /season-books/order`는 `SYNC-004` 기준으로 아직 주의가 필요하다. 프론트 주문 화면은 이 API를 호출하지만, 백엔드가 해당 라우트를 구현했는지는 다음 작업 시작 시 반드시 재확인한다.

## 다음 작업 시작 체크리스트

1. `git status --short`로 다른 에이전트의 진행 중 변경을 먼저 확인한다.
2. `docs/AGENT_SYNC.md`의 open 항목을 읽고, resolved 여부를 최신 코드와 비교한다.
3. 백엔드가 추가 구현을 끝냈다면 `POST /season-books/order` 컨트롤러, DTO, service, e2e 테스트가 생겼는지 확인한다.
4. `apps/web/src/lib/api/season-books.ts`와 `packages/contracts/src/season-book.ts`의 요청/응답 타입이 백엔드 구현과 맞는지 확인한다.
5. 로컬 서버가 떠 있지 않으면 먼저 빌드와 e2e로 정적/계약 검증을 끝낸 뒤, 사용자가 원할 때 dev 서버 통합 테스트를 진행한다.

## 권장 검증 명령

Codex가 WSL/bash 경로에서 실행될 때 Linux `node`와 Windows용 `node_modules`가 섞이면 `lightningcss` 또는 `ts-jest` optional dependency 오류가 날 수 있다. 그 경우 bash 안에서 Windows npm을 명시해 실행한다.

```bash
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run build -w apps/web
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run build -w apps/api
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test -w apps/api
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test:e2e -w apps/api
```

프론트 전용 QA workspace는 다음 명령으로 확인한다.

```bash
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test -w tests/web
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test:e2e -w tests/web
```

## 수동 통합 테스트 우선순위

1. `/season`에서 `GET /entries` 요약, 최근 기록, 상세 링크를 확인한다.
2. `/entries/new`에서 경기 후보 조회, 사진 업로드, 생성 payload, 생성 후 상세 이동을 확인한다.
3. `/entries/[id]/edit`에서 변경된 필드만 PATCH payload에 들어가는지 확인한다.
4. `/season-book/new`에서 기록 선택, 커버 사진 URL, 견적 생성, estimate result를 확인한다.
5. `/order/[projectId]`에서 필수 배송 정보 validation과 `POST /season-books/order` 결과를 확인한다. 이 단계는 백엔드 order API 구현 여부에 따라 blocked일 수 있다.

## 보고 방식

- 통과/실패는 실행한 명령과 결과를 함께 남긴다.
- 사용자에게 전달할 때는 “테스트 코드 통과”, “e2e 통과”, “브라우저 수동 통합 테스트 통과”를 구분한다.
- 제품 코드 수정이 필요한 실패는 `docs/AGENT_SYNC.md`에 blocker로 남기고, 사용자에게 같은 사이클 안에서 알린다.
- QA가 만든 테스트/문서는 가능한 한 `tests/**`만 커밋한다.
