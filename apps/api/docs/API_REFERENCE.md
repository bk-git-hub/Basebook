# Basebook API Reference

이 문서는 현재 구현된 `apps/api` 엔드포인트를 빠르게 확인하기 위한 정적 레퍼런스다.

기준:

- 계약 기준 타입: `packages/contracts/src/*`
- 계획/기능 문서: `docs/planning/CONTRACT_SPEC.md`, `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- 실제 구현 확인: `apps/api/src/**/*.controller.ts`

기본 주소:

- local: `http://localhost:4000`
- deployed demo: `https://api-production-3c1c.up.railway.app`

공통 규칙:

- 현재 MVP는 인증 없이 단일 데모 사용자 기준으로 동작한다
- 기본 요청/응답은 `application/json`이다
- 이미지 업로드만 `multipart/form-data`를 사용한다
- 실패 응답은 기본적으로 `ApiErrorResponse` 형식을 따른다

## Health

### `GET /health`

- 용도: 서버 생존 확인
- 응답: `{ ok: true, service: "basebook-api" }`

## Games

### `GET /games`

- 용도: 기록 작성 전에 경기 후보 조회
- query: `favoriteTeam` required, `date?`, `seasonYear?`
- 응답: `GetGamesResponse`

## Entries

### `GET /entries`

- 용도: 기록 목록과 시즌 요약 조회
- query: `favoriteTeam?`, `seasonYear?`
- 응답: `GetEntriesResponse`

### `GET /entries/:id`

- 용도: 기록 상세 조회
- 응답: `GetEntryResponse`

### `POST /entries`

- 용도: 새 기록 생성
- body: `CreateDiaryEntryInput`
- 응답: `GetEntryResponse`

### `PATCH /entries/:id`

- 용도: 기존 기록 수정
- body: `UpdateDiaryEntryInput`
- 응답: `GetEntryResponse`

### `DELETE /entries/:id`

- 용도: 기존 기록 삭제
- 응답: `DeleteEntryResponse`
- 참고: 삭제 성공 시 삭제 직전 엔트리를 반환하고, 이후 같은 id 조회는 `404`

## Upload

### `POST /uploads/image`

- 용도: 이미지 업로드
- content-type: `multipart/form-data`
- field: `file`
- 응답: `UploadImageResponse`
- 참고: 저장 위치는 환경에 따라 local 또는 Cloudflare R2이며, 응답 URL은 public 접근 가능해야 한다

## Season Book

### `POST /season-books/estimate`

- 용도: 시즌북 초안 생성과 견적 계산
- body: `SeasonBookEstimateRequest`
- 응답: `SeasonBookEstimateResponse`

### `POST /season-books/order`

- 용도: 배송지 입력 후 주문 생성
- body: `SeasonBookOrderRequest`
- 응답: `SeasonBookOrderResponse`

### `GET /season-books/orders`

- 용도: 주문 내역 목록 조회
- 응답: `GetSeasonBookOrdersResponse`
- 참고: `updatedAt desc` 최신순

### `GET /season-books/:projectId/status`

- 용도: 주문 진행 상태 조회
- 응답: `GetSeasonBookStatusResponse`
- 참고: `progress`는 타임라인 렌더링용, `shipping`은 배송지 수정 폼 prefill용

### `POST /season-books/:projectId/cancel`

- 용도: 주문 취소
- body: `CancelSeasonBookOrderRequest`
- 응답: `CancelSeasonBookOrderResponse`

### `PATCH /season-books/:projectId/shipping`

- 용도: 배송지 수정
- body: `UpdateSeasonBookShippingRequest`
- 응답: `UpdateSeasonBookShippingResponse`

## Webhook

### `POST /webhooks/sweetbook`

- 용도: Sweetbook 이벤트 수신 후 상태 동기화
- body: `SweetbookWebhookRequest`
- 응답: `SweetbookWebhookAckResponse`
- 참고: `SWEETBOOK_WEBHOOK_SECRET`가 있으면 서명 검증을 수행한다

## 구현된 엔드포인트 요약

- `GET /health`
- `GET /games`
- `GET /entries`
- `GET /entries/:id`
- `POST /entries`
- `PATCH /entries/:id`
- `DELETE /entries/:id`
- `POST /uploads/image`
- `POST /season-books/estimate`
- `POST /season-books/order`
- `GET /season-books/orders`
- `GET /season-books/:projectId/status`
- `POST /season-books/:projectId/cancel`
- `PATCH /season-books/:projectId/shipping`
- `POST /webhooks/sweetbook`
