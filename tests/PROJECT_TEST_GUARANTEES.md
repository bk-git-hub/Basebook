# Project Test Guarantees

이 문서는 Sweetbook 저장소에서 현재 운영 중인 프론트엔드/백엔드 테스트를 한곳에 모아, 각 테스트가 무엇을 보장하는지 설명하는 총괄 문서다.

발표나 handoff에서는 이 문서를 기준으로 아래 질문에 답하면 된다.

- 어떤 테스트 레이어가 있는가
- 각 테스트 파일은 왜 존재하는가
- 모든 테스트가 통과하면 무엇까지 자신 있게 말할 수 있는가
- 아직 남아 있는 테스트 공백은 무엇인가

## 빠른 지도

| 구분 | 위치 | 종류 | 목적 |
| --- | --- | --- | --- |
| 프론트 단위 테스트 | `tests/web/src/unit/*.test.tsx` | Vitest | UI 의사결정, validation, payload mapping, 링크 구조 보증 |
| 프론트 브라우저 E2E | `tests/web/src/e2e/*.spec.ts` | Playwright | 실제 Chromium + production build 기준 사용자 흐름 보증 |
| 프론트 통합 리포트 | `tests/web/scripts/order-flow-report.cjs` | Scripted browser integration | 스크린샷/PDF 증거를 남기는 주문 happy path 검증 |
| 백엔드 단위/서비스 테스트 | `apps/api/src/**/*.spec.ts` | Jest | 설정, 서비스 로직, 외부 API 어댑터, 스토리지, 웹훅 처리 보증 |
| 백엔드 API E2E | `apps/api/test/*.e2e-spec.ts` | Jest + Supertest | HTTP 계약, 상태 코드, 로컬 저장/조회 흐름 보증 |

## 실행 명령과 의미

| 명령 | 범위 | 통과 시 의미 |
| --- | --- | --- |
| `npm run test` | `tests/web` unit + `apps/api` Jest | 프론트 핵심 UI 로직과 백엔드 서비스/API 계약이 기본적으로 유지됨 |
| `npm run test:web:e2e` | `tests/web` Playwright | 주요 프론트 라우트와 로컬 풀스택 사용자 흐름이 실제 브라우저에서 유지됨 |
| `npm run test:e2e:order-report -w tests/web` | 주문 통합 브라우저 스크립트 | 견적 생성부터 주문 상태 화면까지 실제 흐름을 증거물과 함께 재현함 |

## 프론트엔드 테스트 보증

### Unit: `tests/web/src/unit/season-dashboard.test.tsx`

- 존재 이유:
  시즌 홈 성격을 띠는 대시보드는 요약 카드, 직관 승률, 최근 기록 링크, empty/error state가 핵심이라 문구나 구조 회귀가 잦다.
- 보증하는 것:
  - 최신 시즌 기준 요약 UI가 렌더링된다.
  - 직관 승률/시즌 기록/전체 기록 같은 핵심 정보 위계가 유지된다.
  - empty state와 error state 셸이 사라지지 않는다.
  - 최근 기록 링크가 상세 주소로 연결된다.
- 보증하지 않는 것:
  - 실제 `GET /entries` 네트워크 성공 여부
  - 서버 기준 최신 정렬의 진실값

### Unit: `tests/web/src/unit/entry-detail.test.tsx`

- 존재 이유:
  기록 상세는 읽기 화면의 중심이고, 수정 CTA와 사진 원본 링크가 틀리면 다음 흐름이 바로 끊긴다.
- 보증하는 것:
  - 경기 정보와 감상 텍스트가 상세 화면에 표시된다.
  - 수정 CTA가 올바른 edit 경로를 가리킨다.
  - 사진 원본 링크가 payload의 URL을 유지한다.
  - 에러 상태 카드가 기본 안내를 렌더링한다.
- 보증하지 않는 것:
  - 실제 `GET /entries/:id` 404/500 응답 처리
  - 이미지 파일 실제 유효성

### Unit: `tests/web/src/unit/entry-create-form.test.tsx`

- 존재 이유:
  새 기록 작성은 모바일 제어, 팀 중복 방지, 직관/비직관 분기, validation, 업로드, payload 생성까지 가장 복잡한 폼이다.
- 보증하는 것:
  - 기본 결과값이 `미정`으로 시작한다.
  - 응원팀/상대팀 중복 선택 방지가 유지된다.
  - 관람 형태에 따라 경기장/좌석 필드 노출 규칙이 유지된다.
  - 점수, 경기장, 한 줄 감상 관련 validation이 동작한다.
  - 업로드 중 저장 버튼 비활성화와 업로드 후 개별 제외 동작이 유지된다.
  - 생성 payload가 폼 상태와 업로드된 사진을 올바르게 반영한다.
  - 저장 성공 시 상세 페이지로 이동하고, 실패 시 입력값이 유지된다.
- 보증하지 않는 것:
  - 실제 업로드 네트워크 성공
  - 실제 백엔드 저장 결과

### Unit: `tests/web/src/unit/entry-edit-form.test.tsx`

- 존재 이유:
  수정 폼의 핵심 규칙은 "바뀐 것만 PATCH"다.
- 보증하는 것:
  - 변경 없는 저장 시 PATCH를 보내지 않는다.
  - 변경된 필드만 payload에 포함된다.
  - 저장 성공 후 상세 페이지로 복귀한다.
- 보증하지 않는 것:
  - 서버의 patch merge 결과
  - 모든 복합 수정 케이스

### E2E: `tests/web/src/e2e/entry-create.smoke.spec.ts`

- 존재 이유:
  `/entries/new`가 실제 브라우저와 production build에서 뜨는지 빠르게 감지한다.
- 보증하는 것:
  - `/entries/new` 기본 셸 렌더링
  - 모바일 팀 선택 dropdown 노출
  - 원격 시청 전환 시 경기장/좌석 숨김
- 보증하지 않는 것:
  - 실제 저장/업로드 완료

### E2E: `tests/web/src/e2e/entry-create.local-full-stack.spec.ts`

- 존재 이유:
  새 기록 작성이 로컬 DB, 로컬 업로드, 로컬 API와 실제로 이어지는지 증명한다.
- 보증하는 것:
  - `POST /uploads/image`와 `POST /entries`가 로컬 풀스택에서 연결된다.
  - 업로드 자산 URL이 로컬 자산 경로로 저장된다.
  - 생성 후 상세 화면에서 같은 감상/사진을 볼 수 있다.
- 보증하지 않는 것:
  - 수정/삭제/주문 흐름

### E2E: `tests/web/src/e2e/frontend-route-regression.local.spec.ts`

- 존재 이유:
  주요 프론트 라우트가 production build 기준으로 죽지 않았는지 한 번에 확인한다.
- 보증하는 것:
  - `/`, `/about`, `/season`, `/entries/[id]`, `/entries/[id]/edit`, `/season-book/new`, `/order/[projectId]` 진입 가능
  - 홈/소개/시즌/주문 라우트의 대표 CTA와 요약 카드 유지
  - 상세 not-found 상태 셸 유지
- 보증하지 않는 것:
  - 상태 변경까지 포함한 전 흐름

### E2E: `tests/web/src/e2e/entry-management.local.spec.ts`

- 존재 이유:
  기록은 생성만 되는 것이 아니라 수정/삭제까지 자연스럽게 이어져야 한다.
- 보증하는 것:
  - 상세에서 수정 진입 후 저장, 다시 상세 복귀
  - 상세에서 삭제 후 시즌 화면 success notice 복귀
- 보증하지 않는 것:
  - 삭제 실패나 권한 오류 같은 예외 흐름

### E2E: `tests/web/src/e2e/order-management.local-full-stack.spec.ts`

- 존재 이유:
  사용자 피드백상 약했던 주문 내역, 배송지 수정, 주문 취소 회귀망을 보강한다.
- 보증하는 것:
  - `/order` empty/populated 상태 렌더링
  - 주문 카드에서 상태 페이지 이동
  - `/order/[projectId]/status`에서 배송지 수정
  - `/order/[projectId]/status`에서 주문 취소
- 보증하지 않는 것:
  - 외부 Sweetbook sandbox 후속 상태 변화

### E2E: `tests/web/src/e2e/season-book-failures.local.spec.ts`

- 존재 이유:
  시즌북/주문 플로우의 대표 실패 상태를 브라우저에서 고정한다.
- 보증하는 것:
  - 시즌북 필수값 누락 validation
  - 커버 추천 실패 메시지
  - 주문 요약 누락 fallback
  - 알 수 없는 프로젝트의 상태 조회 에러 셸
- 보증하지 않는 것:
  - 브라우저에서 일부러 만들기 어려운 API 계약 오류 전부

### Scripted Integration: `tests/web/scripts/order-flow-report.cjs`

- 존재 이유:
  단순 pass/fail이 아니라 발표 가능한 증거까지 남기는 풀플로우 검증이 필요하다.
- 보증하는 것:
  - 로컬 서버를 QA 전용 포트에서 직접 띄운다.
  - `POST /uploads/image` -> `POST /season-books/estimate` -> `POST /season-books/order` -> `/order/[projectId]/status` 흐름이 이어진다.
  - 스크린샷, Markdown, PDF, 로그를 남긴다.
- 보증하지 않는 것:
  - 주문 실패 경로 전반
  - 외부 웹훅 이후 장기 상태 전이

## 백엔드 테스트 보증

### Unit: `apps/api/src/app.config.spec.ts`

- 보증하는 것:
  - 로컬 프론트 포트 `3000`~`3010` 범위가 CORS 허용된다.
  - 배포 프론트 origin이 허용된다.
  - origin 헤더가 없는 요청도 허용된다.

### Unit: `apps/api/src/games/games.service.spec.ts`

- 보증하는 것:
  - 경기 후보 목록이 favorite team으로 필터링된다.
  - 날짜/시즌 연도 조건이 함께 적용된다.

### Unit: `apps/api/src/health/health.controller.spec.ts`

- 보증하는 것:
  - `/health` 응답 shape이 계약과 일치한다.

### Unit: `apps/api/src/season-books/estimate/season-book-estimator.service.spec.ts`

- 보증하는 것:
  - sandbox order mode에서는 Sweetbook estimate를 강제한다.
  - local order mode에서는 Sweetbook readiness 실패 시 로컬 estimator로 폴백한다.

### Unit: `apps/api/src/season-books/season-books.service.spec.ts`

- 보증하는 것:
  - estimate 상태 프로젝트의 progress 계산
  - 외부 주문 존재 시 Sweetbook 상세와 저장 shipping을 합친 status 구성
  - 존재하지 않는 프로젝트 404 처리
  - 주문 내역 최신순 정렬과 estimate-only 프로젝트 제외
  - 주문 취소 시 ordered history 유지
  - 배송지 수정 시 병합 저장
- 보증하지 않는 것:
  - 실제 HTTP 요청/응답

### Unit: `apps/api/src/sweetbook/sweetbook-pricing.spec.ts`

- 보증하는 것:
  - Sweetbook 응답에서 청구 금액 계산 규칙
  - VAT 포함 합산 계산
  - 사용할 수 있는 금액 필드가 없을 때 예외 처리

### Unit: `apps/api/src/sweetbook/sweetbook.client.spec.ts`

- 보증하는 것:
  - Sweetbook API 호출에 bearer auth가 실린다.
  - readiness 확인이 필요한 read API를 점검한다.
  - 주문 생성 시 idempotency key와 shipping payload가 포함된다.
  - 주문 조회, 주문 취소, 배송지 수정 요청 payload와 endpoint가 맞다.
  - sandbox API key 미설정 시 안전하게 실패한다.

### Unit: `apps/api/src/upload/storage/r2-image-storage.service.spec.ts`

- 보증하는 것:
  - R2 업로드 시 올바른 PUT 요청과 서명 헤더를 만든다.
  - 공개 URL을 기대 형태로 반환한다.
  - R2 미설정 시 명확하게 실패한다.

### Unit: `apps/api/src/upload/storage/upload-storage.config.spec.ts`

- 보증하는 것:
  - 기본 업로드 드라이버가 local이다.
  - R2 설정이 완전하면 configured 상태를 올바르게 계산한다.

### Unit: `apps/api/src/webhooks/sweetbook-webhooks.service.spec.ts`

- 보증하는 것:
  - `shipping.delivered` 웹훅이 해당 주문의 상태를 `DELIVERED`로 반영한다.
  - webhook secret 설정 시 잘못된 서명은 거부된다.

### API E2E: `apps/api/test/app.e2e-spec.ts`

- 보증하는 것:
  - `/health`, `/games`, `/entries` CRUD, `/uploads/image`, `/season-books/estimate`, `/season-books/order`, `/season-books/:projectId/status`, `/season-books/:projectId/cancel`, `/season-books/:projectId/shipping`, `/webhooks/sweetbook`가 실제 HTTP 계층에서 동작한다.
  - demo seed reset 이후에도 로컬 환경에서 엔드포인트들이 재현 가능하다.
  - 로컬 업로드 이미지를 다시 읽어올 수 있다.
  - season-book order duplicate submission이 같은 주문을 재사용한다.
  - 존재하지 않는 project/order 요청이 적절히 실패한다.

### API E2E: `apps/api/test/season-books-orders.e2e-spec.ts`

- 보증하는 것:
  - `/season-books/orders`가 최신순 주문 내역만 반환한다.
  - estimate-only 프로젝트는 주문 내역에서 제외된다.
  - 취소된 주문도 ordered history 안에서 유지된다.
  - 주문 카드 렌더링에 필요한 기본 필드가 내려온다.

## 모든 테스트가 통과하면 말할 수 있는 것

- 프론트 핵심 화면의 UI 의사결정 로직이 유지된다.
- 주요 사용자 라우트는 실제 Chromium + production build 기준으로 진입 가능하다.
- 새 기록 작성/수정/삭제가 로컬 풀스택 기준으로 이어진다.
- 시즌북 견적 생성, 주문 생성, 주문 내역, 배송지 수정, 주문 취소가 로컬 브라우저 기준으로 이어진다.
- 백엔드 핵심 서비스 로직과 HTTP 계약이 Jest/Supertest로 고정돼 있다.
- 테스트는 로컬 DB와 로컬 업로드 저장소를 쓰는 형태로 재현 가능하며, 배포 서버나 배포 DB를 건드리지 않아도 된다.

## 아직 남은 공백

- 브라우저에서 자연스럽게 만들기 어려운 비정상 API payload 전체
  - 예: duplicate `selectedEntryIds`, 존재하지 않는 `selectedEntryIds`
- 외부 Sweetbook sandbox 환경에서 실제 시간이 흐르며 변하는 주문 후반 상태
- seed/demo data 품질 자체에 대한 별도 품질 검사
- 프론트 시각적 polish를 수치화한 디자인 자동화

## 발표용 요약 문장

- 이 프로젝트의 테스트는 "빠른 UI 회귀 감지", "실제 브라우저 흐름 검증", "백엔드 계약 검증", "증거가 남는 통합 시연"으로 역할을 나눠 설계했다.
- 그래서 단순히 테스트가 많다는 말이 아니라, 각 테스트가 어떤 리스크를 막고 어디까지 신뢰할 수 있는지 설명할 수 있다.
