# Basebook Web

Basebook의 Next.js 프론트엔드 앱입니다. 경기 기록 작성, 시즌 요약, 최근 일지 조회, 기록 상세와 수정 흐름을 담당합니다.

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
- 경기 사진 업로드

## 주요 라우트

| 경로 | 설명 |
| --- | --- |
| `/` | 홈. 응원 팀, 직관 승무패, 최근 일지, 주요 진입 링크를 보여줍니다. |
| `/about` | 서비스 소개 페이지입니다. |
| `/season` | 시즌 기록 전체 목록과 시즌 요약을 보여줍니다. |
| `/entries/new` | 새 경기 기록 작성 화면입니다. |
| `/entries/[id]` | 기록 상세 화면입니다. |
| `/entries/[id]/edit` | 기록 수정 화면입니다. |

## 로컬 실행

루트에서 실행하는 방식을 권장합니다.

```bash
npm install
npm run dev:web
```

웹 앱은 기본적으로 `http://localhost:3000`에서 실행됩니다.

백엔드도 함께 띄우려면 저장소 루트에서 다음을 사용합니다.

```bash
npm run dev
```

## 환경 변수

프론트엔드는 `NEXT_PUBLIC_API_BASE_URL`을 사용합니다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

별도 값을 주지 않으면 기본값은 `http://localhost:4000`입니다.

## 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
```

프론트 전용 E2E/단위 테스트는 `tests/web` 워크스페이스에서 관리합니다.

## API 연동 메모

- `entries.ts`: 일지 조회, 생성, 수정, 삭제
- `uploads.ts`: 이미지 업로드
- `games.ts`: 경기 데이터 조회
- `http.ts`: API base URL과 오류 정규화
