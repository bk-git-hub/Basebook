# Basebook

베이스북은 야구팬이 경기마다 감정, 사진, 맥락을 기록하고, 시즌이 끝나면 그 기록을 한 권의 책으로 주문할 수 있는 웹 서비스입니다.

- 배포 데모: [https://basebook-web.vercel.app/](https://basebook-web.vercel.app/)

## 서비스 소개

### 어떤 서비스인가요?

베이스북은 야구팬이 경기 단위로 일지를 남기고, 그중 원하는 기록을 골라 시즌북으로 만들 수 있게 돕습니다.

### 누구를 위한 서비스인가요?

- 특정 팀 경기를 꾸준히 챙겨보는 KBO 팬
- 직관과 집관의 기억을 함께 남기고 싶은 팬
- 먼저 기록을 쌓고, 나중에 실물 책으로 보관하고 싶은 사용자

### 주요 기능

- 더미 데이터가 포함된 시즌 대시보드
- 경기 일지 작성 / 조회 / 수정
- 경기 사진 업로드
- 시즌북 견적 생성
- 시즌북 주문
- 주문 상태 조회, 배송지 수정, 주문 취소
- 경기 후보 조회 API (`GET /games`)는 백엔드에 구현되어 있지만, 현재 제출 버전 프론트엔드 UI에는 연결하지 않았습니다.

### 현재 과제 범위에서 제외한 기능

- 회원가입과 로그인 기능은 이번 과제 범위에서 제외했습니다.
- 대신 사용자가 이미 로그인되어 있다고 가정하고, 단일 샘플 사용자 기준으로 핵심 기록/시즌북 흐름을 검증할 수 있게 구성했습니다.

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

- 일반 로컬 실행에는 필수가 아닙니다.
- 프론트엔드에서 API 주소를 직접 바꾸고 싶을 때만 선택적으로 사용합니다.

### 3. 실행 모드

#### 로컬 데모 모드

- 별도의 Sweetbook Sandbox API Key 없이도 실행 가능합니다.
- `apps/api/.env`가 없어도 `apps/api/.env.example` fallback으로 서버가 올라갑니다.
- 아래 범위는 이 모드에서 바로 확인할 수 있습니다.
  - 시즌 대시보드
  - 경기 일지 작성 / 조회 / 수정
  - 이미지 업로드
  - 로컬 시즌북 견적 / 주문 흐름

#### Sandbox 연동 모드

- 실제 Sweetbook Sandbox API를 호출하려면 별도 설정이 필요합니다.
- 이 모드에서만 실제 estimate / order와 Sweetbook 상태 연동을 검증할 수 있습니다.

#### 실행 모드별 차이

| 모드 | 필요한 설정 | 실제로 가능한 것 |
|---|---|---|
| 로컬 데모 모드 | 추가 설정 없음 | 일지 작성/조회/수정, 로컬 이미지 업로드, 로컬 시즌북 견적, 로컬 주문/상태 조회 |
| 부분 Sandbox 연동 모드 | `SWEETBOOK_API_KEY` 입력 | Sweetbook API 연결 상태와 일부 연동 확인 가능, 하지만 주문은 기본적으로 local 모드 |
| Sandbox 주문 검증 모드 | `SWEETBOOK_API_KEY` + `SWEETBOOK_ORDER_MODE=sandbox` + 공개 이미지 URL | 실제 Sweetbook Sandbox estimate / order / 상태 연동 검증 |

정리하면:

- API 키가 전혀 없어도 로컬 데모는 바로 실행됩니다.
- API 키만 넣으면 Sweetbook 연결 준비는 되지만, 주문은 기본적으로 여전히 local 모드입니다.
- 실제 Sweetbook Sandbox 주문까지 검증하려면 `SWEETBOOK_ORDER_MODE=sandbox`와 Sweetbook가 접근 가능한 공개 이미지 URL이 추가로 필요합니다.

즉, API 키만 넣으면 스위트북 연결은 됩니다. 하지만 책 이미지까지 포함한 실제 견적/주문을 끝까지 돌리려면, 이미지도 인터넷에서 접근 가능한 공개 주소여야 하고 주문 모드도 `sandbox`로 켜야 합니다.

### 4. Sandbox API Key 입력

`apps/api/.env` 파일에서 아래 값을 설정합니다.

```env
SWEETBOOK_API_KEY=your_real_sandbox_api_key
```

참고:

- `your_real_sandbox_api_key` 자리에는 `api.sweetbook.com`에서 발급받은 본인 Sandbox API Key를 넣습니다.
- 이 저장소에는 실제 키를 커밋하지 않았습니다. 로컬에서는 개인적으로 발급받은 키를 직접 입력해야 합니다.
- 로컬 데모 모드만 확인할 경우 이 값은 비워둬도 됩니다.

예시 1. 로컬 데모만 확인할 때

```env
SWEETBOOK_API_KEY=your_sandbox_api_key_here
SWEETBOOK_ESTIMATE_MODE=auto
SWEETBOOK_ORDER_MODE=local
UPLOAD_STORAGE_DRIVER=local
```

- placeholder 값을 그대로 둬도 로컬 데모는 실행됩니다.
- 이 경우 시즌북 견적/주문 흐름은 로컬 데모 기준으로 동작합니다.

예시 2. 실제 Sweetbook Sandbox 연결을 일부 확인할 때

```env
SWEETBOOK_API_KEY=your_real_sandbox_api_key
SWEETBOOK_ESTIMATE_MODE=auto
SWEETBOOK_ORDER_MODE=local
UPLOAD_STORAGE_DRIVER=local
```

- 이 경우 Sweetbook API를 호출할 수 있는 상태가 됩니다.
- 다만 주문은 여전히 local 모드라서 실제 Sandbox 주문 생성까지는 가지 않습니다.
- 다시 말해, API 키만으로는 연결 확인까지 가능하고 실제 이미지 포함 견적/주문을 끝까지 검증하는 단계는 아닙니다.

예시 3. 실제 Sweetbook Sandbox 주문까지 검증할 때

```env
SWEETBOOK_API_KEY=your_real_sandbox_api_key
SWEETBOOK_ESTIMATE_MODE=auto
SWEETBOOK_ORDER_MODE=sandbox
UPLOAD_STORAGE_DRIVER=r2
R2_ACCOUNT_ID=your_cloudflare_account_id_here
R2_ACCESS_KEY_ID=your_r2_access_key_id_here
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key_here
R2_BUCKET=your_r2_bucket_name_here
R2_PUBLIC_BASE_URL=https://your-public-r2-domain.example.com
```

- 실제 Sweetbook Sandbox 주문까지 end-to-end로 검증하려면 아래 조건이 모두 필요합니다.
  - 유효한 `SWEETBOOK_API_KEY`
  - `SWEETBOOK_ORDER_MODE=sandbox`
  - 시즌북 표지 및 업로드 이미지가 Sweetbook에서 접근 가능한 공개 URL
  - 필요 시 R2 같은 공개 이미지 저장소
- `localhost` 업로드 URL은 Sweetbook 서버에서 접근할 수 없기 때문에, 실제 Sandbox 주문 검증에는 공개 이미지 URL이 필요합니다.

### 5. 실행

```powershell
npm run dev
```

이 명령은 웹과 API 개발 서버를 함께 띄우므로, 실행한 터미널은 그대로 유지합니다.

로컬 실행 주소:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Playwright E2E 전용 Web: `http://localhost:3100`

### 6. 실행 직후 응답 확인

브라우저에서 아래 주소를 직접 열어 응답을 확인합니다.

- 웹 홈: `http://localhost:3000`
- 시즌 대시보드: `http://localhost:3000/season`
- API 헬스체크: `http://localhost:4000/health`

헬스체크는 아래와 비슷한 JSON이 보이면 정상입니다.

```json
{"ok":true,"service":"basebook-api"}
```

### 7. 수동 브라우저 검증 체크리스트

1. 한 터미널에서 `npm run dev`를 실행한 채 유지합니다.
2. 별도 브라우저 창에서 `http://localhost:3000`에 접속합니다.
3. 아래 순서로 화면을 확인합니다.

#### 1) `/season`

- 더미 경기 일지 카드가 1개 이상 보여야 합니다.
- 최근 기록 목록에서 상세 화면으로 이동할 수 있어야 합니다.

#### 2) `/entries/new`

- 날짜, 응원팀, 상대팀, 저장 버튼이 보여야 합니다.
- 로컬 데모 모드에서는 이미지 첨부와 저장 흐름이 동작해야 합니다.
- 현재 제출 버전의 프론트엔드는 수동 입력 기준으로 동작합니다.
- 경기 후보 조회 API (`GET /games`)는 백엔드에 구현되어 있지만, 이 화면에는 아직 연결하지 않았습니다.

#### 3) `/entries/[id]`

- 기존 더미 일지 상세가 열려야 합니다.
- 점수, 경기 정보, 사진, 메모가 보여야 합니다.

#### 4) `/entries/[id]/edit`

- 기존 값이 폼에 채워져 있어야 합니다.
- 수정 후 저장하면 상세 화면으로 돌아갈 수 있어야 합니다.

#### 5) `/season-book/new`

- 선택 가능한 기록 목록이 보여야 합니다.
- 시즌북 제목 입력과 견적 생성 버튼이 보여야 합니다.
- 로컬 데모 모드에서는 로컬 estimate 흐름이 동작해야 합니다.

#### 6) `/order/[projectId]` 및 `/order/[projectId]/status`

- 견적 생성 후 주문 화면으로 진입할 수 있어야 합니다.
- 로컬 데모 모드에서는 주문 완료와 상태 조회 흐름까지 확인할 수 있어야 합니다.

4. 개발 서버를 종료할 때는 `npm run dev`를 실행한 터미널에서 `Ctrl + C`를 입력합니다.

### 8. 실행 직후 확인 가능한 것

- 백엔드 실행 시 SQLite 스키마가 자동 초기화됩니다.
- 더미 경기 데이터와 일지 데이터가 바로 보입니다.
- 회원가입/로그인 구현 없이도 샘플 사용자 기준으로 시즌 대시보드와 기록 화면을 바로 확인할 수 있습니다.
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

- Playwright E2E는 개발용 `3000` 포트 대신 전용 `3100` 포트에서 Next.js 프로덕션 서버를 따로 띄워 검증합니다.
- 이미 `3100` 포트를 점유한 프로세스가 있다면 먼저 종료한 뒤 다시 실행합니다.

## 수동 검증과 자동 테스트의 차이

- 수동 브라우저 검증: 사람이 실제 화면과 해피패스를 직접 확인하는 절차입니다.
- `npm run test`: 단위 테스트와 백엔드 테스트를 실행합니다.
- `npm run test:web:e2e`: Playwright 기반 자동 회귀 검증입니다.

즉, README의 브라우저 점검 절차는 “사람이 직접 서비스가 떠 있고 흐름이 이어지는지” 확인하는 용도이고, 테스트 명령은 회귀 방지용 자동 검증입니다.

## 문제 발생 시 확인할 항목

- `http://localhost:3000`과 `http://localhost:4000`이 모두 떠 있는지 확인합니다.
- `npm run test:web:e2e` 실행 시에는 `http://localhost:3100` 포트를 다른 프로세스가 사용 중이지 않은지 확인합니다.
- `apps/api/.env`를 만들었는지 확인합니다.
- 로컬 데모 모드만 확인하려는 경우 `SWEETBOOK_API_KEY`가 비어 있어도 되는지 다시 확인합니다.
- 실제 Sandbox 주문을 기대하고 있다면 `SWEETBOOK_API_KEY`, `SWEETBOOK_ORDER_MODE=sandbox`, 공개 이미지 URL 조건을 모두 만족했는지 확인합니다.
- Playwright 실패는 수동 브라우저 점검 실패와 원인이 다를 수 있으므로 별도 자동 테스트 문제로 분리해 봅니다.

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
