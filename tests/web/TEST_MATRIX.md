# Web QA Test Matrix

이 문서는 "어떤 라우트를 어떤 테스트가 보증하는가"를 한눈에 보기 위한 표다.

## 라우트 기준 매트릭스

| Route | 주요 사용자 목적 | 현재 자동화 | 실패 경로 포함 여부 | 비고 |
| --- | --- | --- | --- | --- |
| `/` | 사용자 홈에서 직관 승률과 최근 일지 확인 | `frontend-route-regression.local.spec.ts` | 일부 없음 | 홈이 소개 랜딩이 아니라 사용자 홈처럼 읽히는지 확인 |
| `/about` | 서비스 소개 확인 | `frontend-route-regression.local.spec.ts` | 일부 없음 | 소개 hero와 CTA 확인 |
| `/season` | 최신 시즌 요약과 전체 기록 확인 | `frontend-route-regression.local.spec.ts`, unit `season-dashboard.test.tsx` | empty/error는 unit 중심 | 브라우저에서는 대표 summary 렌더링 확인 |
| `/entries/new` | 새 기록 작성 | `entry-create.smoke.spec.ts`, `entry-create.local-full-stack.spec.ts`, unit `entry-create-form.test.tsx` | 일부 포함 | 모바일 제어, validation, 업로드, 생성, 상세 진입 포함 |
| `/entries/[id]` | 기록 상세 확인 | `frontend-route-regression.local.spec.ts`, unit `entry-detail.test.tsx` | not-found 포함 | 사진 링크와 CTA 확인 |
| `/entries/[id]/edit` | 기록 수정 | `frontend-route-regression.local.spec.ts`, `entry-management.local.spec.ts`, unit `entry-edit-form.test.tsx` | 일부 없음 | 실제 수정 후 상세 복귀 포함 |
| `/season-book/new` | 기록 선택, 커버 설정, 견적 생성 | `frontend-route-regression.local.spec.ts`, `season-book-failures.local.spec.ts`, `order-flow-report.cjs` | 포함 | 필수값 누락, 커버 추천 실패, happy path 모두 있음 |
| `/order` | 주문 내역 확인 | `order-management.local-full-stack.spec.ts` | empty 포함 | empty/populated 둘 다 브라우저 확인 |
| `/order/[projectId]` | 배송지 입력과 주문 접수 | `frontend-route-regression.local.spec.ts`, `season-book-failures.local.spec.ts`, `order-flow-report.cjs` | 일부 포함 | 요약 누락 fallback과 실제 주문 접수 둘 다 있음 |
| `/order/[projectId]/status` | 주문 상태, 배송지 수정, 취소 확인 | `order-management.local-full-stack.spec.ts`, `season-book-failures.local.spec.ts`, `order-flow-report.cjs` | 포함 | 상태 조회 실패, 배송지 수정, 주문 취소 포함 |

## 아직 브라우저 자동화가 직접 다루지 않는 것

- duplicate `selectedEntryIds` 같은 API 계약 오류
- 존재하지 않는 `selectedEntryIds` 입력
- Sweetbook sandbox / webhook 이벤트 후반부 상태 변화
- seed/demo data 품질 그 자체

## 발표용 한 줄 요약

- 현재 `tests/web`는 주요 프론트 라우트 전체를 로컬 전용 풀스택 조건에서 자동화하고 있다.
- 성공 흐름뿐 아니라 시즌북과 주문 화면의 대표 실패 경로도 같이 고정했다.
- 단, 브라우저에서 만들 수 없는 순수 API 계약 오류와 외부 Sweetbook 연동 후반부는 아직 별도 보강 영역이다.
