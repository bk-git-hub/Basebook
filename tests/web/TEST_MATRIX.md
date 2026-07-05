# Test Matrix

| Area | Coverage | Main Files |
| --- | --- | --- |
| Home | 시즌 요약, 최근 기록, 주요 링크 | `frontend-route-regression.local.spec.ts` |
| About | 서비스 소개 문구와 시작 링크 | `frontend-route-regression.local.spec.ts` |
| Season | 시즌 요약과 전체 기록 목록 | `season-dashboard.test.tsx`, `frontend-route-regression.local.spec.ts` |
| Entry Create | 폼 기본값, validation, 이미지 업로드, 저장 payload | `entry-create-form.test.tsx`, `entry-create.local-full-stack.spec.ts`, `entry-create.smoke.spec.ts` |
| Entry Detail | 상세 정보, 사진, 수정/삭제 액션 | `entry-detail.test.tsx`, `frontend-route-regression.local.spec.ts` |
| Entry Edit | 변경 감지, patch payload, 저장 후 이동 | `entry-edit-form.test.tsx`, `entry-management.local.spec.ts` |
| Entry Delete | 삭제 후 목록 반영 | `entry-management.local.spec.ts` |

## Not Covered

- 로그인과 계정별 데이터 분리
- 외부 커머스 연동
- 대량 데이터 성능 테스트
