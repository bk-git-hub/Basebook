# Basebook Web Tests

프론트엔드 단위 테스트와 브라우저 E2E 테스트를 모아 둔 워크스페이스입니다.

## 실행

```bash
npm run test -w tests/web
npm run test:e2e -w tests/web
```

## 현재 테스트 범위

- 홈, 소개, 시즌, 기록 상세, 기록 수정 라우트 회귀
- 새 경기 기록 작성 smoke
- 기록 생성, 수정, 삭제 로컬 풀스택 흐름
- 시즌 대시보드와 기록 상세/수정 컴포넌트 단위 테스트
- 이미지 업로드 후 기록에 첨부되는 흐름

## 로컬 E2E 포트

- Web: `http://127.0.0.1:3100`
- API: `http://127.0.0.1:4100`

Playwright 설정은 `tests/web/playwright.config.ts`에서 전용 API DB와 로컬 업로드 저장소를 사용합니다.
