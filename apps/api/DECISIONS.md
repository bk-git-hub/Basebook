# Basebook API Decision Log

이 문서는 백엔드 관련 주요 기술 결정을 기록한다.

규칙:

- Backend engineer가 갱신한다.
- 사용자와의 기술 회의 후 확정된 결정만 기록한다.
- 기존 결정을 조용히 덮어쓰지 않는다.
- 변경이 생기면 새로운 entry를 추가한다.
- 시간은 `Asia/Seoul` 기준으로 기록한다.

---

## Template

### API-XXX

- Date: `YYYY-MM-DD`
- Time: `HH:MM`
- Agenda:
- Participants:
- Options Considered:
- Decision:
- Rationale:
- Impact:
- Owner:
- Status: `proposed | approved | superseded | deprecated`
- Related Docs:
- Related Milestones:

---

## Decisions

### API-001

- Date: `2026-04-09`
- Time: `13:00`
- Agenda: Basebook backend architecture baseline
- Participants: User, Codex
- Options Considered:
  - Next.js full-stack only
  - Next.js frontend + Express API
  - Next.js frontend + Nest.js API
- Decision: Use `Nest.js` as the dedicated backend inside a monorepo with a separate Next.js web app.
- Rationale: This makes API orchestration, persistence, uploads, and Sweetbook integration explicit backend responsibilities.
- Impact:
  - `apps/api` owns API routes and domain logic
  - contracts are required for frontend/backend integration
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BASEBOOK_PLAN.md`
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-002

- Date: `2026-04-09`
- Time: `13:10`
- Agenda: Basebook MVP scope boundaries for backend
- Participants: User, Codex
- Options Considered:
  - Include LLM writing support in backend flow
  - Exclude LLM writing support from MVP
  - Depend on automatic external KBO data ingestion
  - Use manual or semi-automatic metadata enrichment
- Decision:
  - Exclude LLM text generation from MVP
  - Use manual or semi-automatic game metadata enrichment
  - Keep auth/admin future-ready in backend structure, not as MVP product scope
- Rationale: The first version should focus on stable journaling and Sweetbook ordering, not optional AI or brittle external dependencies.
- Impact:
  - backend stays focused on game data, diary persistence, upload, and Sweetbook orchestration
  - auth/admin namespaces remain reserved for future expansion
- Owner: User
- Status: `approved`
- Related Docs:
  - `docs/planning/BACKEND_FUNCTIONAL_SPEC.md`
- Related Milestones:
  - `docs/milestones/backend.md`

### API-003

- Date: `2026-04-10`
- Time: `14:40`
- Agenda: 결정 로그를 프론트엔드와 백엔드별로 분리할지 결정
- Participants: User, Codex
- Options Considered:
  - 하나의 공용 `docs/DECISIONS.md`를 계속 사용
  - 프론트엔드와 백엔드가 각자 app-owned decision log를 사용
- Decision: 백엔드 관련 결정은 앞으로 `apps/api/DECISIONS.md`에 기록한다.
- Rationale: 프론트와 백이 동시에 하나의 결정 로그 파일을 수정하면 관리가 어렵고 충돌 가능성이 커진다.
- Impact:
  - 백엔드는 이 파일만 갱신한다
  - `docs/DECISIONS.md`는 아카이브로만 남는다
- Owner: User
- Status: `approved`
- Related Docs:
  - `AGENTS.md`
  - `BASEBOOK_TEAM_PLAYBOOK.md`
  - `docs/README.md`
- Related Milestones:
  - `docs/milestones/backend.md`
