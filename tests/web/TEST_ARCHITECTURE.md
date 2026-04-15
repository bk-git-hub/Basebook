# Web QA Test Architecture

## 목적

이 QA 아키텍처의 목표는 하나다.

- `apps/web`의 핵심 사용자 흐름이 깨졌는지 빠르게 감지한다.
- 필요할 때는 실제 브라우저와 실제 API를 붙여서 증거까지 남긴다.
- 테스트가 무엇을 보증하는지 발표나 인수인계 때 바로 설명할 수 있게 한다.

## 왜 `tests/web`로 분리했는가

QA 역할의 쓰기 범위는 `tests/**`다. 그래서 제품 코드를 직접 수정하지 않고도 아래를 할 수 있어야 했다.

- 프론트 회귀 감지
- 브라우저 smoke 확인
- 프론트-백 통합 happy path 검증
- 수동 QA 시나리오 문서화
- 다음 작업자를 위한 handoff 정리

즉, 이 디렉터리는 단순한 테스트 파일 보관소가 아니라 QA 운영 레이어다.

## 레이어 개요

| 레이어 | 대표 파일 | 존재 이유 | 통과 시 보증 | 단독 한계 |
| --- | --- | --- | --- | --- |
| Fixture / Setup | `src/fixtures/entries.ts`, `src/setup/vitest.setup.tsx` | 테스트 입력을 고정하고 Next 의존성을 단순화한다 | 반복 가능한 입력과 렌더링 환경 | 실제 서버나 실제 브라우저는 보지 않는다 |
| Unit Smoke | `src/unit/*.test.tsx` | 빠르고 안정적으로 UI 의사결정 로직을 확인한다 | validation, payload, 링크, 상태 UI가 의도대로 동작함 | 네트워크, build, 실제 브라우저는 보증하지 않는다 |
| Browser Route Regression | `src/e2e/frontend-route-regression.local.spec.ts`, `src/e2e/entry-create.smoke.spec.ts` | 실제 Chromium과 production build에서 라우트 셸이 뜨는지 본다 | 홈, 시즌, 기록, 시즌북, 주문 라우트 기본 회귀 | 상세 상태 전이와 실패 케이스 전체는 보지 않는다 |
| Browser Full-Stack Flow | `src/e2e/entry-create.local-full-stack.spec.ts`, `src/e2e/entry-management.local.spec.ts`, `src/e2e/order-management.local-full-stack.spec.ts` | 실제 Chromium과 로컬 API를 붙여 생성, 수정, 삭제, 주문 상태 전이를 본다 | 업로드, 생성, 수정, 삭제, 주문 내역, 배송지 수정, 주문 취소 | 브라우저만으로 만들기 어려운 API 계약 실패는 한계가 있다 |
| Browser Failure Regression | `src/e2e/season-book-failures.local.spec.ts` | 필수값 누락과 실패 상태 UI를 실제 브라우저에서 고정한다 | 시즌북/주문 화면의 대표 실패 경로 | 백엔드 계약 자체의 모든 실패 코드 조합은 보지 않는다 |
| Scripted Integration | `scripts/order-flow-report.cjs` | 프론트-백 happy path를 실제로 검증하고 증거를 남긴다 | 로컬 업로드, 견적, 주문, 주문 상태 흐름이 이어진다 | 예외 케이스와 전체 회귀를 대신하지 않는다 |
| Manual Scenario | `MANUAL_E2E_SCENARIOS.md` | 사람이 직접 UX를 따라가며 확인할 수 있게 한다 | 탐색형 QA와 데모/발표용 설명 가능 | 반복성과 속도는 자동화보다 떨어진다 |
| Handoff / Docs | `NEXT_QA_HANDOFF.md`, `TEST_INVENTORY.md` | 다음 작업자가 왜 이런 테스트가 있는지 이해하게 한다 | 테스트의 목적과 한계를 설명 가능 | 실행 자체를 대신하지 않는다 |

## 왜 한 종류의 테스트만 쓰지 않았는가

### Unit test만으로는 부족한 이유

- 빠르고 안정적이지만 실제 브라우저나 production build 문제를 못 잡는다.
- API와 실제로 연결됐을 때의 흐름까지는 증명하지 못한다.

### E2E만으로는 부족한 이유

- 실제 브라우저 테스트는 비용이 크고 느리다.
- 실패 원인을 좁히기 어렵고, 사소한 UI 회귀까지 모두 맡기면 유지보수성이 떨어진다.

### 수동 QA만으로는 부족한 이유

- 사람마다 재현 방식이 달라진다.
- 통과 증거가 남지 않으면 발표나 handoff 때 설명력이 약해진다.

## 현재 구조의 설계 원칙

### 1. 빠른 테스트와 무거운 테스트를 분리한다

- 자주 깨질 수 있는 입력 검증과 payload 규칙은 unit smoke에 둔다.
- 실제 브라우저와 API까지 붙는 검증은 별도 스크립트로 분리한다.

### 2. 테스트는 "왜 필요한가"를 설명할 수 있어야 한다

- 테스트 파일 이름만으로는 충분하지 않다.
- 각 테스트는 어떤 회귀를 막기 위해 존재하는지 문서와 함께 설명돼야 한다.

### 3. 자동화와 수동 QA를 경쟁시키지 않는다

- 자동화는 반복 가능한 보증을 담당한다.
- 수동 QA는 사람이 봐야 하는 문장, 흐름, 인지 부담, 화면 자연스러움을 담당한다.

### 4. 증거를 남길 수 있는 흐름을 하나는 확보한다

- 단순 pass/fail 로그만으로는 발표에 약하다.
- 그래서 `order-flow-report.cjs`는 스크린샷, Markdown, PDF를 같이 생성한다.

## 보증 모델

### `test:unit`이 통과하면 말할 수 있는 것

- 주요 화면의 핵심 UI 결정 로직이 깨지지 않았다.
- 생성/수정 폼의 validation과 payload 최소 규칙이 유지되고 있다.
- 상태 카드, 링크, 안내 문구가 기대한 구조를 유지하고 있다.

### `test:e2e`가 통과하면 말할 수 있는 것

- 주요 프론트 라우트 전체가 real browser + production build 기준으로 정상 진입된다.
- 기록 생성/수정/삭제와 주문 내역/배송지 수정/주문 취소까지 로컬 풀스택 기준으로 이어진다.
- 시즌북과 주문 라우트의 대표 실패 상태가 브라우저에서 의도대로 보인다.
- 테스트 중 사용하는 API는 로컬 SQLite DB와 로컬 업로드 저장소를 강제하므로, 배포 서버나 배포 DB를 건드리지 않는다.

### `test:e2e:order-report`가 통과하면 말할 수 있는 것

- 로컬 환경에서 프론트와 백엔드가 실제로 이어져 happy path를 수행했다.
- 업로드 -> 견적 생성 -> 주문 접수 -> 주문 상태 화면까지 끊기지 않았다.
- 이 실행도 로컬 DB와 로컬 업로드 저장소를 강제하므로, 외부 배포 리소스를 건드리지 않는다.
- 이를 뒷받침하는 시각적 증거와 실행 로그가 남아 있다.

### 그래도 아직 말할 수 없는 것

- 모든 라우트가 자동 회귀망 안에 있다고 말할 수는 없다.
- 주문 상태 조회, 취소, 배송지 수정까지 완전히 자동화됐다고 말할 수는 없다.
- 데이터 품질 문제까지 프론트 테스트가 책임진다고 말할 수는 없다.

## 현재 알려진 테스트 공백

- `/order/[projectId]/status` 자동화 부재
- `POST /season-books/estimate` 실패 케이스 자동화 부재
- `POST /season-books/order` 실패 케이스 자동화 부재
- 취소/배송지 변경 플로우 자동화 부재
- 로컬 seed/demo data 자체의 인코딩 품질 검증 부재

## 발표 때 설명하기 좋은 핵심 메시지

- 이 테스트 구조는 "빠른 회귀 감지"와 "실제 흐름 증명"을 분리해서 둘 다 챙기기 위해 설계했다.
- unit smoke는 변경된 UI 결정 로직을 빠르게 잡고, scripted integration은 실제 브라우저와 실제 API happy path를 증거로 남긴다.
- 그래서 이 QA 체계는 단순 pass/fail 묶음이 아니라, 어떤 수준까지 신뢰할 수 있는지 설명 가능한 구조다.
