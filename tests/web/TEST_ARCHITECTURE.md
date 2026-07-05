# Test Architecture

## Unit Tests

Vitest와 Testing Library로 핵심 컴포넌트의 렌더링, 폼 검증, API 호출 payload를 고정합니다.

- `entry-create-form.test.tsx`
- `entry-edit-form.test.tsx`
- `entry-detail.test.tsx`
- `season-dashboard.test.tsx`

## Browser Route Regression

Playwright로 production build에 가까운 환경에서 주요 라우트가 뜨는지 확인합니다.

- `/`
- `/about`
- `/season`
- `/entries/[id]`
- `/entries/[id]/edit`

## Browser Full-Stack Flow

전용 SQLite DB, 로컬 업로드 저장소, 로컬 API 서버를 사용해 브라우저에서 실제 생성, 수정, 삭제 흐름을 검증합니다.

- 새 기록 작성
- 이미지 업로드
- 기록 상세 조회
- 기록 수정
- 기록 삭제

## Out Of Scope

- 인증과 사용자별 권한
- 외부 커머스 흐름
