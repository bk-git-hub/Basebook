# Web QA Workspace

이 디렉터리는 `apps/web/**`를 직접 수정하지 않고 프론트엔드 QA 자산을 관리하는 공간이다. 테스트 코드를 모아두는 것에 그치지 않고, 왜 이 테스트가 존재하는지와 무엇을 보증하는지까지 함께 설명하는 것을 목표로 한다.

## 먼저 읽을 문서

1. `TEST_ARCHITECTURE.md`
2. `TEST_INVENTORY.md`
3. `MANUAL_E2E_SCENARIOS.md`
4. `NEXT_QA_HANDOFF.md`

## 디렉터리 구성

- `src/unit`
  - Vitest 기반 컴포넌트 smoke test
  - 빠른 회귀 확인과 payload/validation 검증 담당
- `src/e2e`
  - Playwright 기반 브라우저 smoke test
  - 실제 브라우저에서 라우트가 production build 기준으로 뜨는지 확인
- `src/fixtures`
  - 테스트 전용 fixture
  - UI가 받는 계약 형태를 반복 가능하게 만든다
- `src/setup`
  - Vitest 공통 설정
  - Next `Link` 같은 브라우저 외부 의존성을 테스트 친화적으로 바꾼다
- `scripts`
  - 스크린샷과 PDF까지 남기는 실행형 QA 스크립트
- `test-results`
  - 실행 산출물 보관 위치
  - 커밋 대상이 아니라 로컬 증거물이다

## 현재 테스트 레이어

- `test:unit`
  - 폼 validation, payload 생성, 링크/문구 렌더링 같은 UI 의사결정 로직을 빠르게 확인한다.
- `test:e2e`
  - 실제 Chromium에서 페이지 셸이 깨지지 않고 뜨는지 확인한다.
- `test:e2e:order-report`
  - `POST /uploads/image` -> `POST /season-books/estimate` -> `POST /season-books/order` happy path를 실제 브라우저로 검증하고 스크린샷, Markdown, PDF 증거를 남긴다.
- `MANUAL_E2E_SCENARIOS.md`
  - 사람 손으로 봐야 하는 UX와 탐색형 QA를 담당한다.

## 자주 쓰는 명령

Windows + bash 혼합 환경에서는 Windows npm을 명시해 실행하는 편이 안전하다.

```bash
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test -w tests/web
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test:e2e -w tests/web
cmd.exe /d /s /c C:/Progra~1/nodejs/npm.cmd --prefix C:/Users/bksoft/Documents/Sweetbook run test:e2e:order-report -w tests/web
```

## 산출물 위치

- 주문 흐름 PDF 리포트:
  - `tests/web/test-results/order-flow-report/order-flow-report.pdf`
- 주문 흐름 Markdown 리포트:
  - `tests/web/test-results/order-flow-report/order-flow-report.md`
- 주문 흐름 스크린샷:
  - `tests/web/test-results/order-flow-report/*.png`
- 빌드/서버 로그:
  - `tests/web/test-results/order-flow-report/*.log`

## 이 워크스페이스가 현재 보증하는 것

- 시즌 대시보드, 기록 상세, 기록 생성, 기록 수정 화면의 핵심 UI 결정 로직
- `/entries/new` 라우트가 실제 브라우저와 production build 기준으로 뜨는지 여부
- 시즌북 견적 생성부터 주문 완료 화면까지의 로컬 happy path
- 통합 흐름에 대한 시각적 증거와 재검토 가능한 보고서

## 아직 따로 보강해야 하는 것

- 주문 진행 상태 조회, 주문 취소, 배송지 수정의 자동화 회귀 테스트
- 시즌북 관련 실패 케이스 전체 자동화
- 백엔드 seed/demo data 품질 자체에 대한 검증
- 프론트 전체 라우트에 대한 종단간 회귀망

## 발표할 때 이 문서를 쓰는 방법

- 먼저 `TEST_ARCHITECTURE.md`로 왜 테스트를 여러 층으로 나눴는지 설명한다.
- 다음으로 `TEST_INVENTORY.md`에서 각 테스트 파일의 존재 이유와 보증 범위를 설명한다.
- 마지막으로 `test-results/order-flow-report` 산출물을 보여주며 실제 증거를 제시한다.
