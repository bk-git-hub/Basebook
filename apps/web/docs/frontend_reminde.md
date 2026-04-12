# Frontend Reminder

다음 프론트엔드 작업을 시작하기 전에 이 문서를 먼저 읽고, 이어서 아래 원본 문서를 다시 확인한다.

## 시작 전 필수 확인

- `AGENTS.md`: 단일 저장소 `main` 기준, 프론트엔드 write scope는 `apps/web/**`만 허용된다. worktree 분리나 브랜치 전환을 전제로 작업하지 않는다.
- `BASEBOOK_TEAM_PLAYBOOK.md`: 팀 공통 진행 방식과 산출물 기준을 다시 확인한다.
- `docs/AGENT_SYNC.md`: 백엔드, QA, DevOps handoff와 blocker 상태를 먼저 확인한다. 특히 `POST /season-books/order` 상태는 다음 작업 전에 최신 로그를 다시 확인해야 한다.
- `docs/planning/CONTRACT_SPEC.md`: API contract와 request/response shape를 확인한다.
- `docs/planning/FRONTEND_FUNCTIONAL_SPEC.md`: 화면별 프론트 기능 범위와 우선순위를 확인한다.
- `apps/web/DECISIONS.md`: 프론트 기술 결정과 이전 합의사항을 확인한다.
- `docs/milestones/frontend.md`: 프론트 진행 상태와 다음 milestone 후보를 확인한다.

## 작업 방식

- 모든 의미 있는 작업은 `plan -> user technical meeting -> implementation -> test -> review -> user verification` 순서로 진행한다.
- 사용자가 최종 사용자 검증은 나중에 한 번에 하겠다고 했으므로, 기능 구현 후에는 "사용자 검증 대기" 상태로 표현한다.
- atomic한 기능 또는 개별 화면 단위로 작업하고 커밋한다.
- 커밋 전에는 staged, unstaged, untracked 파일을 모두 확인한다.
- 다른 에이전트가 `apps/api/**`, `docs/**`, `tests/**`를 작업 중일 수 있다. 프론트 커밋은 `git commit --only <apps/web 경로>`처럼 경로를 제한해 섞이지 않게 한다.
- 기술적, 설계적 분기점이 있으면 옵션별 장단점과 추천안을 먼저 사용자에게 보고한다.

## 현재 프론트 구현 상태

- `/`: 현재 제품 톤에 맞춘 Sweetbook 랜딩이 있다.
- `/season`: `GET /entries` 기반 시즌 대시보드가 있다.
- `/entries/new`: `GET /games`, `POST /uploads/image`, `POST /entries` 흐름으로 새 직관 기록을 작성한다.
- `/entries/[id]`: `GET /entries/:id` 기반 상세 화면이 있다.
- `/entries/[id]/edit`: `GET /entries/:id`로 초기값을 채우고 `PATCH /entries/:id`로 수정한다.
- `/season-book/new`: `GET /entries`로 기록을 고르고 `POST /season-books/estimate`로 견적을 생성한다.
- `/order/[projectId]`: `POST /season-books/order`를 호출하는 배송 정보 입력 화면이 있다. 백엔드 구현 상태는 반드시 `docs/AGENT_SYNC.md`에서 다시 확인한다.

## API와 백엔드 연동 주의점

- 프론트 API client는 `apps/web/src/lib/api/**`에 있다.
- API base URL은 `apps/web/src/lib/api/http.ts` 기준으로 확인한다.
- `POST /season-books/estimate`는 Sweetbook-backed estimate를 사용할 때 `coverPhotoUrl`이 외부에서 열리는 이미지 주소여야 한다. 로컬 업로드 URL은 fallback 상황에서는 가능하지만 실제 Sweetbook estimate에는 제한이 있을 수 있다.
- `POST /season-books/order`는 이전 QA 로그에서 백엔드 blocker로 올라온 적이 있다. 다음 작업 전에 최신 backend commit과 `docs/AGENT_SYNC.md`를 다시 확인한다.
- 프론트가 백엔드 영역 변경을 요구하면 `apps/api/**`를 직접 수정하지 말고 사용자에게 blocker를 보고하고 `docs/AGENT_SYNC.md`에 남긴다.

## UI 문구 기준

- 화면에 `GET /...`, `POST /...`, `PATCH /...`, `payload`, `body`, `mock`, `슬라이스`, `QA`, `백엔드`, `API 통신` 같은 구현 설명을 노출하지 않는다.
- 사용자는 제품을 보는 것이므로 화면 문구는 "기록 작성", "시즌북 견적", "주문 접수"처럼 사용자 행동과 상태 중심으로 쓴다.
- JSON request preview나 내부 ID 노출은 제품 화면에 기본으로 두지 않는다. 디버깅이 필요하면 개발 전용 방법을 따로 논의한다.
- 현재 UI 톤은 `stone` 계열의 절제된 제품 화면이다. 새 화면도 이 톤과 간격, 카드 반경, 버튼 대비를 맞춘다.

## 마지막 확인 상태

- 직전 프론트 정리 작업에서 화면별 제품 문구 정리를 마쳤고, `npm run lint`와 `npm run build`가 `apps/web`에서 통과했다.
- 이후 작업을 시작하면 다시 최신 상태에서 `git status --short`를 확인하고, 사용자의 다음 우선순위를 회의한 뒤 진행한다.
