# Basebook API

`apps/api`는 스위트북 과제용 Basebook 백엔드입니다.

야구 직관/집관 기록을 저장하고, 기록을 바탕으로 시즌북 견적과 주문 흐름을 처리합니다. 현재 구현은 인증 없는 `단일 데모 사용자` 기준으로 동작하며, 프론트엔드가 바로 붙을 수 있도록 NestJS API 형태로 정리되어 있습니다.

## 현재 역할

- 경기 후보 조회
- 일지 목록/상세/생성/수정/삭제
- 이미지 업로드
- 시즌북 견적 생성
- 시즌북 주문 생성
- 주문 내역 조회
- 주문 상태 조회
- 주문 취소
- 배송지 수정
- Sweetbook 웹훅 수신

## 기술 구성

- NestJS
- Prisma
- SQLite
- Sweetbook HTTP API 직접 연동
- Cloudflare R2 또는 local 파일 업로드
- Railway 배포 대응

## 현재 동작 방식

- 인증/회원가입 없음
- 고정 데모 사용자 기준 데이터 처리
- 로컬 기본 포트는 `4000`
- DB가 비어 있으면 앱 시작 시 데모 엔트리를 자동 시드할 수 있음
- 이미지 업로드는 환경에 따라 `local` 또는 `r2` 저장소를 사용
- 프론트 연동 편의를 위해 현재 CORS는 전면 허용 상태

## 빠른 시작

저장소 루트에서 실행합니다.

```powershell
npm install
Copy-Item apps/api/.env.example apps/api/.env
npm run start:dev -w apps/api
```

개발 서버 기본 주소:

- `http://localhost:4000`

권장 확인:

- 헬스 체크: `GET /health`
- 정적 API 문서: [API_REFERENCE.md](./docs/API_REFERENCE.md)

## 자주 쓰는 명령어

저장소 루트 기준:

```powershell
npm run start:dev -w apps/api
npm run build -w apps/api
npm test -w apps/api -- --runInBand
npm run test:e2e -w apps/api -- --runInBand
npm run db:init -w apps/api
npm run db:reset-demo-entries -w apps/api
npm run sweetbook:check -w apps/api
npm run r2:check -w apps/api
```

## 환경 변수

실제 값은 `apps/api/.env`에 넣고, 템플릿은 `apps/api/.env.example`을 기준으로 사용합니다.

중요 변수:

- `PORT`
  - 로컬 API 포트
- `DATABASE_URL`
  - SQLite 연결 문자열
- `SWEETBOOK_API_BASE_URL`
  - Sweetbook Sandbox/운영 API 기본 주소
- `SWEETBOOK_API_KEY`
  - Sweetbook API 키
- `SWEETBOOK_ESTIMATE_MODE`
  - 시즌북 견적 모드
- `SWEETBOOK_ORDER_MODE`
  - 주문 처리 모드
- `SWEETBOOK_WEBHOOK_SECRET`
  - Sweetbook 웹훅 서명 검증용 시크릿
- `UPLOAD_STORAGE_DRIVER`
  - `local`, `r2`, `auto`
- `R2_ACCOUNT_ID`
  - Cloudflare 계정 ID
- `R2_ACCESS_KEY_ID`
  - R2 액세스 키 ID
- `R2_SECRET_ACCESS_KEY`
  - R2 시크릿 액세스 키
- `R2_BUCKET`
  - R2 버킷 이름
- `R2_PUBLIC_BASE_URL`
  - 업로드 파일의 공개 URL 베이스

배포 환경에서는 `.env.example` fallback에 의존하지 말고, 실제 서비스 변수를 직접 넣는 것을 기준으로 합니다.

## 데이터와 저장소

### 로컬

- DB: `apps/api/prisma/dev.db`
- 업로드: `UPLOAD_STORAGE_DRIVER=local`이면 앱 로컬 경로 사용

### 배포

- DB: Railway 볼륨에 마운트된 SQLite 파일 사용
- 업로드: Cloudflare R2 public URL 사용 권장

## 구현된 엔드포인트

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

엔드포인트별 요청/응답은 [API_REFERENCE.md](./docs/API_REFERENCE.md)를 기준으로 확인합니다.

## 문서 위치

- 빠른 API 레퍼런스: [API_REFERENCE.md](./docs/API_REFERENCE.md)
- 공유 계약 문서: [../../docs/planning/CONTRACT_SPEC.md](../../docs/planning/CONTRACT_SPEC.md)
- 백엔드 기능 문서: [../../docs/planning/BACKEND_FUNCTIONAL_SPEC.md](../../docs/planning/BACKEND_FUNCTIONAL_SPEC.md)
- 백엔드 결정 로그: [DECISIONS.md](./DECISIONS.md)

## 과제 기준에서 중요한 점

- 필수는 로컬에서 빌드 후 실행 가능한 구조입니다
- 배포는 보조 시연 경로로 유지합니다
- 현재 구현은 실제 사용자 계정 시스템 없이도 시즌북 해피패스를 검증할 수 있게 설계되어 있습니다
- Sweetbook Sandbox는 운영과 완전히 같지 않으므로, 일부 상태는 로컬 보강 또는 웹훅 동기화를 함께 사용합니다
