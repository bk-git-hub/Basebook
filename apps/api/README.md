# Basebook API

Basebook의 Nest.js 백엔드입니다. 현재 API 범위는 경기 후보, 경기 일지, 이미지 업로드, 헬스체크입니다.

## 주요 기능

- `GET /health`
- `GET /games`
- `GET /entries`
- `GET /entries/:id`
- `POST /entries`
- `PATCH /entries/:id`
- `DELETE /entries/:id`
- `POST /uploads/image`
- `GET /uploads/local/:fileName`

## 로컬 실행

루트에서 전체 앱을 함께 실행합니다.

```bash
npm run dev
```

API만 실행하려면:

```bash
npm run dev:api
```

기본 주소는 `http://localhost:4000`입니다.

## 환경 변수

`apps/api/.env.example`을 참고합니다.

- `PORT`: API 포트
- `WEB_ORIGIN`: 선택적 프론트엔드 origin
- `DATABASE_URL`: SQLite 파일 경로
- `UPLOAD_STORAGE_DRIVER`: `local` 또는 `r2`
- `R2_*`: R2 업로드를 사용할 때 필요한 선택 설정

## 데이터베이스

개발 서버와 테스트는 실행 전 `npm run db:init -w apps/api`를 통해 SQLite 스키마를 준비합니다. 스키마는 경기 일지와 사진 테이블만 포함합니다.

## 테스트

```bash
npm run test -w apps/api
npm run test:e2e -w apps/api
```
