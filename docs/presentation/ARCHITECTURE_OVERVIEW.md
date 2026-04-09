# 베이스북 아키텍처 개요

## 기술 스택

### Frontend

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`

### Backend

- `Nest.js`
- `TypeScript`
- `ValidationPipe`
- `class-validator`
- `Prisma`
- `SQLite`

### External Services

- `Sweetbook Book Print API`
- `Vercel Blob`

## 레포 구조

```text
Sweetbook/
├─ apps/
│  ├─ web/
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  ├─ components/
│  │  │  ├─ features/
│  │  │  └─ lib/
│  │  └─ public/
│  └─ api/
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ app.module.ts
│     │  ├─ common/
│     │  └─ modules/
│     │     ├─ diary/
│     │     ├─ games/
│     │     ├─ season-book/
│     │     ├─ sweetbook/
│     │     └─ upload/
│     └─ prisma/
├─ data/
├─ docs/
├─ .env.example
└─ README.md
```

## 시스템 역할 분리

### Next.js Web

- 사용자 화면 렌더링
- 폼 입력
- 이미지 업로드 요청
- 대시보드/상세/시즌북 생성 UI

### Nest.js API

- 일지 CRUD
- 경기 메타데이터 조회
- 입력 검증
- 이미지 업로드 처리
- Sweetbook API orchestration
- 주문/견적 처리

### Prisma + SQLite

- DiaryEntry 저장
- SeasonBookProject 저장
- 더미 데이터 시딩

### Vercel Blob

- 사용자 업로드 이미지 저장
- Sweetbook 업로드 전에 이미지 URL 재사용

### Sweetbook API

- 책 생성
- 표지 생성
- 내지 생성
- 최종화
- 견적 조회
- 주문 생성

## 전체 데이터 흐름

```text
[Browser]
   |
   v
[Next.js Web]
   |
   | JSON / multipart
   v
[Nest.js API]
   | \
   |  \--> [Vercel Blob]
   |
   +----> [SQLite via Prisma]
   |
   \----> [Sweetbook API]
```

## 핵심 유스케이스 흐름

### 1. 경기 기록 작성

```text
[User selects game]
      |
      v
[Web asks API for candidate game data]
      |
      v
[API returns date/team/score/stadium]
      |
      v
[User adds memo and photos]
      |
      v
[API stores entry + uploads image if needed]
```

### 2. 시즌북 생성

```text
[User selects diary entries]
      |
      v
[API loads entries from DB]
      |
      v
[API checks page rules]
      |
      v
[API creates Sweetbook draft]
      |
      v
[API uploads photos and fills cover/contents]
      |
      v
[API finalizes book]
      |
      v
[API requests estimate]
      |
      v
[API creates order]
```

## Sweetbook API 사용 계획

### 필수 사용 API

- `POST /v1/books`
- `POST /v1/books/{bookUid}/cover`
- `POST /v1/books/{bookUid}/contents`
- `POST /v1/books/{bookUid}/finalization`
- `POST /v1/orders/estimate`
- `POST /v1/orders`

### 보조 API

- `GET /v1/book-specs`
- `GET /v1/templates`
- `GET /templates/{templateUid}`
- `POST /v1/books/{bookUid}/photos`
- `GET /v1/credits`

## 백엔드 모듈 제안

### `diary`

- 경기 일지 생성/조회/수정

### `games`

- 날짜/팀 기준 경기 후보 조회
- 더미 데이터 및 반자동 보강 처리

### `upload`

- 이미지 업로드
- Blob URL 관리

### `sweetbook`

- SDK 래핑
- 공통 요청/응답 처리
- 멱등성 키 관리

### `season-book`

- 시즌북 생성 유스케이스
- 페이지 수 계산
- 견적/주문 파이프라인

## 데이터 모델 초안

### DiaryEntry

- `id`
- `date`
- `favoriteTeam`
- `opponentTeam`
- `scoreFor`
- `scoreAgainst`
- `result`
- `watchType`
- `stadium`
- `seat`
- `playerOfTheDay`
- `highlight`
- `rawMemo`
- `photos`

### SeasonBookProject

- `id`
- `seasonYear`
- `title`
- `coverPhoto`
- `introText`
- `selectedEntryIds`
- `sweetbookBookUid`
- `estimate`
- `orderUid`

## 발표 때 강조할 기술 포인트

1. 프론트와 백엔드를 의도적으로 분리했다
2. 백엔드가 단순 프록시가 아니라 도메인 로직과 외부 연동 파이프라인을 책임진다
3. Sweetbook API는 backend service layer에서 orchestration한다
4. 경기 기록 데이터가 구조화되어 있어 책 생성으로 자연스럽게 이어진다
5. 이미지 저장과 주문 생성을 각각 안정적인 외부 서비스로 분리했다

## 엔지니어링 리스크

### 1. 페이지 수 규칙

Sweetbook finalization은 판형별 최소/최대/증분 규칙을 만족해야 한다.

대응:

- 시즌북 생성 전에 페이지 수 계산
- 부족한 경우 소개/구분 페이지 추가
- 너무 많은 경우 선택 경기 수 제한

### 2. 외부 경기 데이터 의존성

KBO 공개 페이지 동기화를 필수 전제로 두면 데모 안정성이 낮아진다.

대응:

- 더미 JSON 내장
- 반자동 보강 중심
- 크롤링은 확장 포인트로만 처리

### 3. 이미지 업로드

배포 환경에서 로컬 디스크 저장을 쓰면 깨질 수 있다.

대응:

- 샘플 이미지는 레포 포함
- 사용자 업로드는 Vercel Blob 사용
