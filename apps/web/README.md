# Basebook Web

Basebook의 프론트엔드 앱입니다.  
야구 직관 기록을 남기고, 시즌 기록을 다시 보고, 시즌북 견적과 주문까지 이어지는 사용자 흐름을 담당합니다.

## 개요

- 프레임워크: Next.js 16 App Router
- 언어: TypeScript
- UI: React 19, Tailwind CSS 4
- 계약 타입: `@basebook/contracts`
- 기본 API 서버: `http://localhost:4000`

현재 앱은 다음 사용자 흐름을 포함합니다.

- 홈에서 이번 시즌 기록 요약과 최근 일지 확인
- 시즌 기록 목록 조회
- 엔트리 생성, 상세 조회, 수정, 삭제
- 시즌북 견적 생성
- 시즌북 주문 입력, 주문 상태 조회, 주문 취소, 배송지 수정
- 시즌북 주문 내역 조회

## 주요 라우트

| 경로 | 설명 |
| --- | --- |
| `/` | 홈. 응원 팀, 직관 승무패, 최근 일지, 주요 진입 링크를 보여줍니다. |
| `/about` | 서비스 소개 페이지입니다. |
| `/season` | 시즌 기록 전체 목록과 시즌 요약을 보여줍니다. |
| `/entries/new` | 새 경기 기록 작성 화면입니다. |
| `/entries/[id]` | 기록 상세 화면입니다. |
| `/entries/[id]/edit` | 기록 수정 화면입니다. |
| `/season-book/new` | 시즌북 견적 생성 화면입니다. |
| `/order` | 시즌북 주문 내역 목록입니다. |
| `/order/[projectId]` | 시즌북 주문 입력 화면입니다. |
| `/order/[projectId]/status` | 시즌북 주문 상태 화면입니다. |

## 로컬 실행

### 1. 저장소 루트에서 실행

모노레포 기준으로 가장 권장되는 방식입니다.

```bash
npm install
npm run dev:web
```

웹 앱은 기본적으로 `http://localhost:3000`에서 실행됩니다.

백엔드도 함께 띄우려면 저장소 루트에서 다음을 사용합니다.

```bash
npm run dev
```

### 2. `apps/web`에서만 실행

```bash
cd apps/web
npm install
npm run dev
```

## 환경 변수

프론트엔드는 `NEXT_PUBLIC_API_BASE_URL`을 사용합니다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

별도 값을 주지 않으면 기본값은 `http://localhost:4000`입니다.  
즉, 로컬 심사 환경에서는 백엔드를 `localhost:4000`으로 띄우면 그대로 동작하도록 맞춰져 있습니다.

## 스크립트

`apps/web/package.json` 기준 스크립트입니다.

```bash
npm run dev
npm run build
npm run start
npm run lint
```

참고:

- 프론트 전용 E2E/단위 테스트는 `tests/web` 워크스페이스에서 관리합니다.
- 저장소 루트에서 `npm run test:web`, `npm run test:web:e2e`로 실행합니다.

## API 연동 메모

프론트는 `apps/web/src/lib/api` 아래 API 클라이언트를 통해 백엔드와 통신합니다.

- `entries.ts`: 일지 조회/생성/수정/삭제
- `season-books.ts`: 시즌북 견적, 주문, 상태, 주문 내역, 취소, 배송지 수정
- `uploads.ts`: 이미지 업로드
- `games.ts`: 경기 데이터 조회

실패 응답은 `ApiClientError`로 정규화해 화면에서 메시지를 처리합니다.

## 배포 메모

현재 웹 앱은 Vercel 기준으로 다음 전제를 사용합니다.

- 프로젝트명: `basebook-web`
- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- 프로덕션 주소: [basebook-web.vercel.app](https://basebook-web.vercel.app)

배포 시에도 로컬 기본 실행 조건은 유지합니다.

- 로컬 기본 API는 계속 `http://localhost:4000`
- 배포 환경에서는 `NEXT_PUBLIC_API_BASE_URL`만 별도로 주입

## 관련 파일

- 앱 진입: [src/app/page.tsx](./src/app/page.tsx)
- 홈 API 기본 설정: [src/lib/api/http.ts](./src/lib/api/http.ts)
- 엔트리 API: [src/lib/api/entries.ts](./src/lib/api/entries.ts)
- 시즌북 API: [src/lib/api/season-books.ts](./src/lib/api/season-books.ts)
- 프론트 결정 로그: [DECISIONS.md](./DECISIONS.md)

## 문서 업데이트 원칙

이 README는 `apps/web`의 현재 사용자 기능과 실행 방식을 설명하는 문서입니다.

- Next.js 기본 템플릿 문구는 남기지 않습니다.
- 실제 구현된 라우트와 실행 방식만 기록합니다.
- 배포 방식이 바뀌면 Root Directory, 환경 변수, 프로덕션 주소를 함께 갱신합니다.
