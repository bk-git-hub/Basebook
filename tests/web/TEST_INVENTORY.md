# Test Inventory

## Unit

### `src/unit/season-dashboard.test.tsx`

- 시즌 요약 카드와 기록 목록 렌더링
- empty/error 상태

### `src/unit/entry-detail.test.tsx`

- 저장된 기록 payload 렌더링
- 사진 원본 링크
- API 오류 안내 카드

### `src/unit/entry-edit-form.test.tsx`

- 변경 사항이 없을 때 patch 미전송
- 변경된 필드만 patch 전송
- 저장 후 상세 화면 이동

### `src/unit/entry-create-form.test.tsx`

- 기본 폼 상태
- 관람 형태별 필드 표시
- validation
- 이미지 업로드
- 저장 payload
- API 오류 표시

## E2E

### `src/e2e/frontend-route-regression.local.spec.ts`

- 홈, 소개, 시즌, 상세, 수정 라우트의 기본 표시 확인

### `src/e2e/entry-create.smoke.spec.ts`

- production build 기준 새 기록 작성 화면 smoke

### `src/e2e/entry-create.local-full-stack.spec.ts`

- 실제 API와 로컬 업로드 저장소를 붙인 기록 생성 흐름

### `src/e2e/entry-management.local.spec.ts`

- 기록 수정과 삭제가 브라우저에서 API까지 이어지는지 확인
