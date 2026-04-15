# Basebook

베이스북은 야구팬이 경기마다 감정, 사진, 맥락을 기록하고, 시즌이 끝나면 그 기록을 한 권의 책으로 주문할 수 있는 웹 서비스입니다.

## 서비스 소개

### 어떤 서비스인가요?

베이스북은 야구팬이 경기 단위로 일지를 남기고, 그중 원하는 기록을 골라 시즌북으로 만들 수 있게 돕습니다.

### 누구를 위한 서비스인가요?

- 특정 팀 경기를 꾸준히 챙겨보는 KBO 팬
- 직관과 집관의 기억을 함께 남기고 싶은 팬
- 먼저 기록을 쌓고, 나중에 실물 책으로 보관하고 싶은 사용자

### 주요 기능

- 더미 데이터가 포함된 시즌 대시보드
- 날짜와 응원팀 기준 경기 후보 조회
- 경기 일지 작성 / 조회 / 수정
- 경기 사진 업로드
- 시즌북 견적 생성
- 시즌북 주문
- 주문 상태 조회, 배송지 수정, 주문 취소

## 기술 스택

| Area | Stack |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Nest.js, TypeScript |
| Database | Prisma, SQLite |
| Shared contracts | workspace package in `packages/contracts` |
| Testing | Vitest, Playwright, Jest, Supertest |
| External integration | Sweetbook Book Print API |

## 레포 구조

- `apps/web` - Next.js 프론트엔드
- `apps/api` - Nest.js 백엔드
- `packages/contracts` - 프론트/백엔드 공용 타입
- `data` - 로컬 실행용 더미 데이터
- `tests/web` - 프론트엔드 QA 워크스페이스
- `docs` - 기획, 참고, 발표 준비 문서

## 실행 방법

### 1. 의존성 설치

```powershell
npm install
```

### 2. 환경변수 준비

베이스북은 `apps/api/.env.example`의 기본값만으로도 로컬 데모 모드 실행이 가능하지만, 실행 전에 실제 `.env` 파일을 만들어두는 것을 권장합니다.

PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

macOS / Linux:

```bash
cp apps/api/.env.example apps/api/.env
```

프론트엔드용 선택 설정:

```powershell
Copy-Item .env.example .env
```

### 3. Sandbox API Key 입력

`apps/api/.env` 파일에서 아래 값을 설정합니다.

```env
SWEETBOOK_API_KEY=your_real_sandbox_api_key
```

참고:

- 로컬 개발에서는 `apps/api/.env`가 없을 경우 `apps/api/.env.example`을 fallback으로 사용합니다.
- 기본 설정은 `UPLOAD_STORAGE_DRIVER=local`, `SWEETBOOK_ORDER_MODE=local`이라서 외부 스토리지가 없어도 앱 자체는 바로 실행됩니다.
- 실제 Sweetbook Sandbox 주문까지 end-to-end로 검증하려면 아래 조건이 필요합니다.
  - 유효한 `SWEETBOOK_API_KEY`
  - `SWEETBOOK_ORDER_MODE=sandbox`
  - 시즌북 표지 및 업로드 이미지가 Sweetbook에서 접근 가능한 공개 URL
  - 필요 시 R2 같은 공개 이미지 저장소

### 4. 실행

```powershell
npm run dev
```

로컬 실행 주소:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

### 5. 실행 직후 확인 가능한 것

- 백엔드 실행 시 SQLite 스키마가 자동 초기화됩니다.
- 더미 경기 데이터와 일지 데이터가 바로 보입니다.
- 로그인 없이 시즌 대시보드와 기록 화면을 확인할 수 있습니다.
- 실제 Sandbox 주문 모드를 켜지 않아도 로컬 견적/주문 흐름은 확인할 수 있습니다.

## 테스트 실행

### 단위 테스트 및 백엔드 테스트

```powershell
npm run test
```

### 프론트엔드 Playwright E2E

Playwright 브라우저가 아직 설치되지 않았다면:

```powershell
npx playwright install
```

그 다음 실행:

```powershell
npm run test:web:e2e
```

## 주요 화면 경로

- `/` - 랜딩 페이지
- `/season` - 시즌 대시보드
- `/entries/new` - 새 경기 일지 작성
- `/entries/[id]` - 일지 상세
- `/entries/[id]/edit` - 일지 수정
- `/season-book/new` - 시즌북 견적 생성
- `/order/[projectId]` - 주문 진입
- `/order/[projectId]/status` - 주문 상태 조회

## 사용한 Book Print API

백엔드는 아래 Sweetbook API 엔드포인트를 사용합니다.

| API | Usage in Basebook |
|---|---|
| `GET /book-specs` | 시즌북 제작에 사용할 판형 정보 조회 |
| `GET /templates` | 템플릿 사용 가능 여부 및 준비 상태 확인 |
| `GET /credits` | Sandbox 사용 가능 여부와 크레딧 상태 확인 |
| `POST /books` | 시즌북 draft 생성 |
| `POST /books/{bookUid}/cover` | 시즌북 표지 생성 |
| `POST /books/{bookUid}/contents?breakBefore=page` | 기록 페이지 삽입 |
| `POST /books/{bookUid}/finalization` | 책 최종화 |
| `POST /orders/estimate` | 시즌북 주문 예상 금액 조회 |
| `POST /orders` | 시즌북 주문 생성 |
| `GET /orders/{orderUid}` | 주문 상태 조회 |
| `POST /orders/{orderUid}/cancel` | 주문 취소 |
| `PATCH /orders/{orderUid}/shipping` | 배송지 수정 |

## AI 도구 사용 내역

| AI tool | How it was used |
|---|---|
| Codex | API 분석, 제품 기획, React/Nest 구현 보조, 테스트 작성, QA 보조 |

## 설계 의도

### 왜 이 서비스를 선택했는가

Sweetbook는 이미 책 제작과 fulfillment에 강점이 있습니다. 베이스북은 그 이전 단계, 즉 팬이 시즌 동안 의미 있는 경기 기록을 쌓는 경험에 초점을 맞췄습니다.

야구 팬 경험은 아래처럼 구조화하기 쉬운 기록 단위를 자연스럽게 만듭니다.

- 경기 날짜
- 응원팀과 상대팀
- 점수와 승패
- 구장과 좌석 맥락
- 사진
- 개인적인 하이라이트와 감정

이 점 때문에 야구 일지 서비스는 `service first, print second` 구조에 잘 맞는다고 판단했습니다.

### 비즈니스 가능성

첫 번째 수익화 포인트는 시즌북 주문입니다.

확장 가능성:

- 플레이오프/원정 직관 특집 에디션
- 팬 커뮤니티 기반 공동 기록
- 공개 야구 데이터 기반 자동 보강
- 팬덤 의식에 맞는 프리미엄 실물 상품

### 시간이 더 있었다면 추가했을 기능

- 더 강한 비주얼 완성도와 브랜딩
- 실제 Sandbox 주문에 맞춘 공개 이미지 업로드 경로
- 주문 이력과 webhook 기반 상태 동기화 강화
- 시즌북/주문 실패 케이스까지 포함하는 E2E 자동화 확대
- 팀/구장별 탐색 기능
