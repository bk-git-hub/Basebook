# Basebook Contract Spec

## 목적

이 문서는 `apps/web`와 `apps/api`가 병렬 개발을 할 때 공통으로 따라야 하는 API 계약과 공유 타입을 고정한다.

원칙:

- 프론트와 백엔드는 이 문서의 요청/응답 shape를 기준으로 개발한다
- 계약 변경은 백엔드 기준으로 먼저 제안하고, 프론트가 따라간다
- MVP 해피패스에 필요한 범위만 잠근다

## 공유 타입 위치

- `packages/contracts/src/common.ts`
- `packages/contracts/src/api-error.ts`
- `packages/contracts/src/auth.ts`
- `packages/contracts/src/games.ts`
- `packages/contracts/src/diary.ts`
- `packages/contracts/src/ops.ts`
- `packages/contracts/src/upload.ts`
- `packages/contracts/src/season-book.ts`

루트 export:

- `packages/contracts/src/index.ts`

## 공통 규칙

### 팀 코드

`TeamCode`

- `LG`
- `DOOSAN`
- `SSG`
- `KIWOOM`
- `KT`
- `NC`
- `KIA`
- `LOTTE`
- `SAMSUNG`
- `HANWHA`

### 경기 결과

`GameResult`

- `WIN`
- `LOSE`
- `DRAW`
- `UNKNOWN`

### 경기 상태

`GameStatus`

- `SCHEDULED`
- `IN_PROGRESS`
- `FINAL`

### 관람 형태

`WatchType`

- `STADIUM`
- `TV`
- `MOBILE`
- `OTHER`

### 역할

`ActorRole`

- `FAN`
- `ADMIN`

## 확장 원칙

현재 MVP는 회원가입과 로그인 없이 `단일 데모 사용자`로 동작할 수 있다.

하지만 아래 규칙은 지금부터 잠근다.

1. 모든 사용자 소유 데이터는 `ownerId`를 가진다
2. 추후 인증이 붙더라도 기존 도메인 엔드포인트 이름은 유지한다
3. 인증 관련 엔드포인트는 `/auth/*` namespace를 사용한다
4. 운영자 기능은 `/ops/*` namespace를 사용한다
5. 권한은 최소 `FAN` / `ADMIN` 두 단계로 시작한다

### 에러 응답 형식

모든 실패 응답은 아래 구조를 우선 사용한다.

```ts
type ApiErrorResponse = {
  error: {
    code:
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "UPLOAD_FAILED"
      | "ESTIMATE_FAILED"
      | "ORDER_FAILED"
      | "EXTERNAL_API_ERROR"
      | "INTERNAL_SERVER_ERROR";
    message: string;
    fields?: { field: string; message: string }[];
    requestId?: string;
  };
};
```

## 엔드포인트 계약

### `GET /health`

용도:

- API 서버 상태 확인

응답:

```ts
type HealthCheckResponse = {
  ok: true;
  service: "basebook-api";
};
```

### `GET /games`

용도:

- 날짜와 응원팀 기준으로 경기 후보 조회
- 기록 작성 폼의 자동 채움 기반 데이터 제공

쿼리:

```ts
type GetGamesQuery = {
  favoriteTeam: TeamCode;
  date?: string;
  seasonYear?: number;
};
```

응답:

```ts
type GetGamesResponse = {
  games: GameCandidate[];
};
```

핵심 필드:

- `id`
- `seasonYear`
- `date`
- `favoriteTeam`
- `opponentTeam`
- `stadium`
- `scoreFor`
- `scoreAgainst`
- `result`
- `status`
- `source`

### `GET /entries`

용도:

- 대시보드용 기록 목록과 시즌 요약 조회

쿼리:

```ts
type GetEntriesQuery = {
  favoriteTeam?: TeamCode;
  seasonYear?: number;
};
```

응답:

```ts
type GetEntriesResponse = {
  entries: DiaryEntry[];
  summary: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
  };
};
```

참고:

- `DiaryEntry`는 응답에 `ownerId`를 포함한다
- MVP에서는 백엔드가 고정 데모 사용자 ID를 넣어도 된다

### `GET /entries/:id`

용도:

- 기록 상세 화면 조회

응답:

```ts
type GetEntryResponse = {
  entry: DiaryEntry;
};
```

### `POST /entries`

용도:

- 경기 일지 생성

요청:

```ts
type CreateDiaryEntryInput = {
  gameId?: string;
  seasonYear: number;
  date: string;
  favoriteTeam: TeamCode;
  opponentTeam: TeamCode;
  scoreFor?: number;
  scoreAgainst?: number;
  result: GameResult;
  watchType: WatchType;
  stadium?: string;
  seat?: string;
  playerOfTheDay?: string;
  highlight: string;
  rawMemo?: string;
  photos: PhotoAsset[];
};
```

응답:

- `GetEntryResponse`와 동일 shape

### `PATCH /entries/:id`

용도:

- 기존 일지 수정

요청:

```ts
type UpdateDiaryEntryInput = Partial<CreateDiaryEntryInput>;
```

응답:

- `GetEntryResponse`와 동일 shape

### `POST /uploads/image`

용도:

- 사용자 업로드 이미지 저장

응답:

```ts
type UploadImageResponse = {
  asset: {
    id: string;
    url: string;
    fileName?: string;
  };
};
```

### `POST /season-books/estimate`

용도:

- 선택한 경기 기록으로 시즌북 구성
- Sweetbook draft/finalization/estimate 수행

요청:

```ts
type SeasonBookEstimateRequest = {
  seasonYear: number;
  title: string;
  introText?: string;
  coverPhotoUrl: string;
  selectedEntryIds: string[];
};
```

응답:

```ts
type SeasonBookEstimateResponse = {
  projectId: string;
  bookUid: string;
  pageCount: number;
  totalPrice: number;
  currency: "KRW";
  projectStatus: "DRAFT" | "ESTIMATED" | "ORDERED" | "FAILED";
  creditSufficient?: boolean;
};
```

### `POST /season-books/order`

용도:

- 배송지 입력 후 Sweetbook 주문 생성

요청:

```ts
type SeasonBookOrderRequest = {
  projectId: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address1: string;
  address2?: string;
};
```

응답:

```ts
type SeasonBookOrderResponse = {
  projectId: string;
  orderUid: string;
  totalPrice: number;
  currency: "KRW";
  projectStatus: "DRAFT" | "ESTIMATED" | "ORDERED" | "FAILED";
  orderStatus:
    | "UNPLACED"
    | "PAID"
    | "CONFIRMED"
    | "IN_PRODUCTION"
    | "SHIPPED"
    | "DELIVERED"
    | "UNKNOWN";
};
```

## 예약된 확장 엔드포인트

아래 엔드포인트는 MVP 필수는 아니지만, 추후 회원가입/로그인과 운영자 기능 확장을 위해 namespace를 먼저 고정한다.

### `GET /auth/session`

용도:

- 현재 로그인 사용자 정보 조회

응답:

```ts
type AuthSessionResponse = {
  authenticated: boolean;
  user?: {
    id: string;
    displayName: string;
    email?: string;
    role: "FAN" | "ADMIN";
  };
};
```

### `GET /ops/projects`

용도:

- 운영자용 시즌북 프로젝트 목록 조회

응답:

```ts
type OpsProjectsResponse = {
  projects: SeasonBookProjectSummary[];
};
```

## 현재 결론

- MVP에는 회원가입/로그인 UI가 없다
- MVP에는 정식 admin console이 없다
- 하지만 데이터 ownership, 역할 구분, `/auth`, `/ops` namespace는 지금부터 확장 가능한 형태로 잠근다

## 잠금 범위

현재 잠그는 것은 아래까지다.

- 엔드포인트 이름
- 요청/응답 shape
- 주요 enum
- 핵심 엔티티 필드

아직 안 잠그는 것은 아래다.

- DB 스키마 상세 컬럼 타입
- Sweetbook 템플릿 파라미터 이름
- 페이지 구성 규칙의 최종 계산식
- 크롤링/동기화 모듈 세부 구현
- 구체적인 인증 공급자 선택
