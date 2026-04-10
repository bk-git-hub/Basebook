# Basebook Frontend Milestones

이 문서는 프론트엔드 마일스톤과 주요 상태 변화를 기록한다.

규칙:

- 시작, 완료, blocker, scope change, integration ready 상태를 기록한다.
- 길게 서술하지 말고 사실 중심으로 적는다.
- 사용자 검증 전에는 `done`으로 표기하지 않는다.

---

## Template

### FE-MILESTONE-XXX

- Date: `YYYY-MM-DD`
- Time: `HH:MM`
- Milestone:
- Status: `planned | in_progress | blocked | ready_for_review | verified`
- Summary:
- Related Decision IDs:
- Blocking Items:
- Next Step:

---

## Log

### FE-MILESTONE-001

- Date: `2026-04-09`
- Time: `13:40`
- Milestone: Frontend functional specification and contract-aligned page scope locked
- Status: `verified`
- Summary:
  - page list for MVP locked
  - frontend role boundary documented
  - contract-driven development path defined
- Related Decision IDs:
  - `DECISION-001`
  - `DECISION-002`
  - `DECISION-003`
- Blocking Items:
  - worktree creation pending
- Next Step:
  - scaffold frontend worktree and start page shell implementation

### FE-MILESTONE-002

- Date: `2026-04-10`
- Time: `09:15`
- Milestone: Frontend QA role and testing ownership added
- Status: `verified`
- Summary:
  - dedicated frontend QA role added to team playbook
  - frontend QA onboarding spec added
  - frontend QA will share the frontend milestone log for progress updates
- Related Decision IDs:
  - `DECISION-004`
- Blocking Items:
  - frontend QA worktree creation pending
- Next Step:
  - create QA worktree and start smoke tests for dashboard and entry form

### FE-MILESTONE-003

- Date: `2026-04-10`
- Time: `12:09`
- Milestone: `/season` `GET /entries` API integration baseline implemented
- Status: `ready_for_review`
- Summary:
  - `entries` API client 계층 추가
  - `/season`이 `GET /entries`를 서버에서 호출하도록 전환
  - loading, error, empty 상태를 최소 범위로 추가
- Related Decision IDs:
  - `DECISION-005`
- Blocking Items:
  - backend `GET /entries` 구현 및 실제 응답 확인 필요
  - 별도 QA thread에서 통합 테스트 예정
- Next Step:
  - user validation 후 `/entries/[id]` 조회 API 연동으로 이동
