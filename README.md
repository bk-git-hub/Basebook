# Basebook

Basebook은 야구팬이 경기마다 점수, 감정, 사진, 관람 맥락을 남기고 시즌 단위로 다시 돌아볼 수 있는 팬 저널 서비스입니다.

- 배포 데모: [https://basebook-web.vercel.app/](https://basebook-web.vercel.app/)

## 서비스 소개

### 어떤 서비스인가요?

경기 직후의 기억을 한 경기 단위로 저장하고, 홈과 시즌 화면에서 최근 기록과 직관 흐름을 한눈에 확인하는 웹 서비스입니다.

### 누구를 위한 서비스인가요?

- 특정 팀 경기를 꾸준히 챙겨보는 KBO 팬
- 직관과 집관의 기억을 사진, 점수, 감상과 함께 남기고 싶은 팬
- 시즌이 지나도 경기별 감정과 맥락을 다시 찾아보고 싶은 사용자

### 주요 기능

- 더미 데이터가 포함된 시즌 대시보드
- 경기 일지 작성, 조회, 수정, 삭제
- 경기 사진 업로드
- 경기 후보 조회 API (`GET /games`)
- 로컬 이미지 저장소와 선택적 R2 업로드 저장소

### 현재 범위에서 제외한 기능

- 회원가입과 로그인 기능은 아직 구현하지 않았습니다.
- 샘플 사용자가 이미 로그인되어 있다고 가정하고 기록 흐름을 검증합니다.
- 외부 커머스형 상품화 흐름은 현재 범위에 포함하지 않습니다.

## 기술 스택

| Area | Stack |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Backend | Nest.js, TypeScript |
| Database | Prisma, SQLite |
| Shared contracts | workspace package in `packages/contracts` |
| Testing | Vitest, Playwright, Jest, Supertest |

## 레포 구조

- `apps/web` - Next.js 프론트엔드
- `apps/api` - Nest.js 백엔드
- `packages/contracts` - 프론트/백엔드 공용 타입
- `data` - 로컬 실행용 더미 데이터
- `tests/web` - 프론트엔드 QA 워크스페이스
- `docs` - 현재 문서 구조 안내

## 실행 방법

### 1. 의존성 설치

```powershell
npm install
```

### 2. 환경변수 준비

API는 `apps/api/.env.example`의 기본값만으로도 로컬 실행이 가능합니다. 로컬에서 명시적으로 `.env`를 만들고 싶다면 아래 명령을 사용합니다.

PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

macOS / Linux:

```bash
cp apps/api/.env.example apps/api/.env
```

프론트엔드 API 주소를 직접 바꾸고 싶을 때만 루트 `.env`를 선택적으로 만듭니다.

```powershell
Copy-Item .env.example .env
```

### 3. 실행

```powershell
npm run dev
```

로컬 실행 주소:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Playwright E2E 전용 Web: `http://127.0.0.1:3100`
- Playwright E2E 전용 API: `http://127.0.0.1:4100`

### 4. 실행 직후 응답 확인

- 웹 홈: `http://localhost:3000`
- 시즌 대시보드: `http://localhost:3000/season`
- API 헬스체크: `http://localhost:4000/health`

헬스체크는 아래 JSON이 보이면 정상입니다.

```json
{"ok":true,"service":"basebook-api"}
```

## 수동 브라우저 검증 체크리스트

1. 한 터미널에서 `npm run dev`를 실행한 채 유지합니다.
2. 브라우저에서 `http://localhost:3000`에 접속합니다.
3. 홈에서 시즌 요약, 최근 일지, 새 일지 작성 링크가 보이는지 확인합니다.
4. `/season`에서 시즌 기록 목록과 요약 카드가 보이는지 확인합니다.
5. `/entries/new`에서 경기 정보를 입력하고 사진 업로드 후 저장합니다.
6. `/entries/[id]`에서 저장된 상세 내용과 사진을 확인합니다.
7. `/entries/[id]/edit`에서 값을 수정하고 상세 화면으로 돌아오는지 확인합니다.
8. 상세 화면에서 기록 삭제 후 시즌 화면에 반영되는지 확인합니다.

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

- `/` - 사용자 홈
- `/about` - 서비스 소개 페이지
- `/season` - 시즌 대시보드
- `/entries/new` - 새 경기 일지 작성
- `/entries/[id]` - 일지 상세
- `/entries/[id]/edit` - 일지 수정

## AI 도구 사용 내역

| AI tool | How it was used |
| --- | --- |
| Codex | API 분석, 제품 기획, React/Nest 구현 보조, 테스트 작성, QA 보조 |
