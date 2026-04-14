# Basebook Backend Functional Spec

## 소유 범위

- `apps/api/**`
- `data/**`
- `packages/contracts/**` 초안 리드

백엔드는 도메인 로직과 외부 연동을 책임진다.

백엔드가 해야 하는 일:

- 입력 검증
- 경기 후보 데이터 조회
- 일지 저장/조회/수정
- 이미지 업로드 처리
- 시즌북 생성 파이프라인
- Sweetbook API 호출
- 주문/견적 처리
- 추후 인증과 권한 구조를 붙일 수 있는 도메인 경계 유지

## 핵심 원칙

1. 프론트에 비즈니스 규칙을 넘기지 않는다
2. 모든 요청/응답은 `packages/contracts` 기준으로 맞춘다
3. Sweetbook 연동은 별도 서비스 계층에 모은다
4. MVP는 해피패스 + 주요 실패 메시지까지 책임진다
5. 회원가입이 없어도 모든 소유 데이터는 지금부터 `ownerId`를 가진다

## 확장 원칙

현재 MVP에는 회원가입/로그인이 없다.

하지만 아래 구조는 지금부터 반영한다.

1. `DiaryEntry`, `SeasonBookProject`는 모두 `ownerId`를 가진다
2. 인증이 붙으면 `current actor`를 컨트롤러에서 주입하는 방식으로 확장한다
3. 운영자 조회 기능은 `/ops/*` namespace로 분리한다
4. 일반 사용자 엔드포인트와 운영자 엔드포인트를 섞지 않는다

## 추천 모듈 구조

### `health`

역할:

- 서버 상태 확인

### `games`

역할:

- 더미 경기 데이터 조회
- 날짜/응원팀 기준 후보 게임 필터링

### `diary`

역할:

- 일지 생성/조회/수정
- 시즌 요약 집계

### `upload`

역할:

- 이미지 업로드
- Blob URL 반환

### `season-book`

역할:

- 기록 선택 기반 시즌북 생성
- 페이지 수 계산
- 견적/주문 유스케이스
- 주문 진행 상태 조회
- 주문 취소
- 배송지 수정

### `sweetbook`

역할:

- SDK 래핑
- BookSpecs/Templates 조회
- books/cover/contents/finalization/estimate/order 처리
- webhook event 수신 동기화

### `auth` (reserved)

역할:

- 추후 세션 확인
- 현재 사용자 주입

현재 상태:

- MVP에서는 필수 구현 아님

### `ops` (reserved)

역할:

- 운영자용 프로젝트/주문 조회

현재 상태:

- MVP에서는 필수 구현 아님

## 엔드포인트 구현 범위

### `GET /health`

- 고정 응답 반환

### `GET /games`

입력:

- `favoriteTeam`
- `date?`
- `seasonYear?`

역할:

- 더미 경기 데이터에서 후보 경기 조회

완료 기준:

- 프론트의 경기 자동 채움 UI가 이 응답만으로 동작 가능

### `GET /entries`

역할:

- 기록 목록 반환
- 시즌 집계 반환
- 내부적으로는 `ownerId` 기준 필터 가능 구조 유지

완료 기준:

- 대시보드 화면에 필요한 데이터가 한 번에 내려감

### `GET /entries/:id`

역할:

- 기록 상세 반환

### `POST /entries`

역할:

- 일지 생성

검증 포인트:

- `favoriteTeam`
- `opponentTeam`
- `date`
- `highlight`
- `watchType`

### `PATCH /entries/:id`

역할:

- 일지 수정

### `POST /uploads/image`

역할:

- 업로드 파일을 Vercel Blob에 저장
- URL과 파일명 반환

### `POST /season-books/estimate`

역할:

- 선택 기록 로드
- 페이지 수 계산
- Sweetbook draft 생성
- 사진 업로드
- 표지/내지 생성
- finalization
- estimate 조회

완료 기준:

- `projectId`, `bookUid`, `pageCount`, `totalPrice`가 반환됨

### `POST /season-books/order`

역할:

- 배송지 검증
- Sweetbook order 생성
- `orderUid` 저장

### `GET /season-books/:projectId/status`

역할:

- 저장된 시즌북 프로젝트와 주문 상태 조회
- 필요 시 Sweetbook order 상태를 다시 읽어와 진행 단계로 변환
- 프론트 주문 진행 화면용 타임라인 데이터 반환

### `POST /season-books/:projectId/cancel`

역할:

- 취소 가능 상태의 주문 취소
- 환불 결과와 주문 상태 반영

### `PATCH /season-books/:projectId/shipping`

역할:

- 발송 전 주문의 배송지 정보 수정

### `POST /webhooks/sweetbook`

역할:

- Sweetbook 웹훅 이벤트 수신
- 우리 DB의 주문 상태와 진행 단계를 비동기 업데이트

### `GET /auth/session` (reserved)

역할:

- 추후 세션 사용자 확인

현재 상태:

- MVP에서는 stub 또는 미구현 가능

### `GET /ops/projects` (reserved)

역할:

- 운영자용 시즌북 프로젝트 목록 조회

현재 상태:

- MVP에서는 optional

## 기능 단위 구현 순서

### Phase B1. 기본 서버 골격

- Nest bootstrap
- global validation pipe
- Prisma 연결
- health endpoint

완료 기준:

- `GET /health` 동작

### Phase B2. 경기 후보 조회

- 더미 경기 JSON 로더
- games module/service/controller
- 팀/날짜 필터

완료 기준:

- `GET /games` 동작

### Phase B3. 일지 CRUD

- diary model/schema
- list/detail/create/update
- 시즌 요약 계산

완료 기준:

- `GET /entries`
- `GET /entries/:id`
- `POST /entries`
- `PATCH /entries/:id`

### Phase B4. 이미지 업로드

- upload controller/service
- Blob 저장
- asset response shape 고정

완료 기준:

- `POST /uploads/image` 동작

### Phase B5. Sweetbook 읽기 API

- `book-specs`
- `templates`
- `credits`

역할:

- 실제 시즌북 생성 전에 파라미터와 판형 검증

### Phase B6. 시즌북 견적 파이프라인

- season-book service
- 선택 기록 로드
- 페이지 수 계산
- create draft
- photos
- cover
- contents
- finalization
- estimate

완료 기준:

- `POST /season-books/estimate` 동작

### Phase B7. 주문 파이프라인

- 주소 검증
- order 생성
- order status 조회
- 결과 저장

완료 기준:

- `POST /season-books/order` 동작
- `GET /season-books/:projectId/status` 동작

### Phase B8. 주문 관리 및 상태 동기화

- order cancel
- shipping update
- webhook signature verification
- webhook event persistence or status sync

완료 기준:

- `POST /season-books/:projectId/cancel` 동작
- `PATCH /season-books/:projectId/shipping` 동작
- `POST /webhooks/sweetbook` 동작
- 주문 상태가 polling 없이도 갱신될 수 있는 구조가 문서와 코드에 반영됨

### Phase B9. auth/admin 확장 포인트 정리

- ownerId 필드 반영
- current actor 개념 도입
- `/auth` / `/ops` namespace 예약

완료 기준:

- 실제 인증 공급자가 없어도 추후 확장이 가능한 구조가 문서와 코드에 반영됨

## 백엔드가 먼저 잠가야 할 규칙

### 1. 페이지 수 계산 규칙

- 선택한 기록 수에서 예상 페이지 수 계산
- 최소/최대/증분 규칙 검증
- 부족하면 intro/divider/outro 페이지 추가 전략 적용

### 2. 사진 업로드 규칙

- 프론트는 URL만 받는다
- Sweetbook 업로드용 서버 파일명은 백엔드가 관리한다

### 3. 주문 멱등성

- order 생성 시 idempotency key를 반드시 사용한다

### 4. 에러 응답

- 모든 실패는 `ApiErrorResponse` 형식 유지

### 5. 권한 경계

- 일반 사용자 도메인과 운영자 도메인을 분리한다
- 운영자 전용 조회는 `/ops/*` 아래로 모은다
- 인증이 붙더라도 기존 엔드포인트 계약은 유지한다

## 백엔드가 건드리지 말아야 하는 것

- 프론트 레이아웃 세부 조정
- 화면별 카피라이팅
- 표시용 상태 조합 로직

## 완료 정의

백엔드 MVP 완료 기준:

- 프론트가 필요한 모든 엔드포인트가 존재한다
- 더미 데이터 기반으로 해피패스가 가능하다
- Sweetbook estimate/order까지 이어진다
- 주요 실패 케이스에 명시적 에러 응답이 있다
- 추후 auth/admin을 붙여도 엔드포인트와 도메인 구조를 갈아엎지 않아도 된다
