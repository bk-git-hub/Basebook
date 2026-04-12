# Agent Sync Log

이 문서는 병렬로 작업 중인 에이전트들이 공통으로 읽는 handoff / blocker / readiness 로그다.

규칙:

- 모든 에이전트는 작업 시작 전에 이 문서를 먼저 읽는다.
- 다른 바운더리의 변경이 필요하면, 그 바운더리를 직접 수정하지 말고 이 문서에 남긴다.
- blocker 또는 handoff를 남길 때는 같은 작업 사이클 안에서 사용자에게도 바로 알린다.
- 기존 항목을 조용히 덮어쓰지 말고, 새 항목을 추가하거나 상태 업데이트를 명시한다.
- 항목은 factual 하게 쓴다. 의견이나 긴 토론은 넣지 않는다.

템플릿:

```md
## SYNC-XXX
- Date:
- Time:
- Source role:
- Target role:
- Type: handoff | blocker | request | ready | resolved
- Related area:
- Summary:
- Required action:
- User notified: yes | no
- Status: open | in_progress | resolved
```

---

## SYNC-001
- Date: 2026-04-10
- Time: 00:00
- Source role: CTO
- Target role: All agents
- Type: ready
- Related area: repository-wide
- Summary: Shared coordination log introduced as the single place for cross-agent handoff and blocker tracking.
- Required action: All agents must read this file at the start of work and use it for cross-boundary requests.
- User notified: yes
- Status: resolved

## SYNC-002
- Date: 2026-04-11
- Time: 16:16
- Source role: Backend
- Target role: Frontend
- Type: ready
- Related area: `POST /season-books/estimate`
- Summary: Backend season-book estimate endpoint is available with local deterministic estimate and project persistence.
- Required action: Frontend can integrate against `POST /season-books/estimate` using `seasonYear`, `title`, optional `introText`, `coverPhotoUrl`, and `selectedEntryIds`.
- User notified: yes
- Status: open

## SYNC-003
- Date: 2026-04-12
- Time: 15:28
- Source role: Backend
- Target role: Frontend
- Type: ready
- Related area: `POST /season-books/estimate`
- Summary: Backend now supports Sweetbook-backed estimate assembly in `auto` mode when Sandbox API key is configured and `coverPhotoUrl` is publicly fetchable.
- Required action: Frontend may keep using local upload URLs for local fallback, but real Sweetbook estimates require a public image URL or a future backend multipart handoff path.
- User notified: yes
- Status: open

## SYNC-004
- Date: 2026-04-12
- Time: 22:14
- Source role: QA
- Target role: Backend
- Type: blocker
- Related area: `POST /season-books/order`
- Summary: QA found that the frontend order form calls `POST /season-books/order`, but the backend `SeasonBooksController` currently exposes only `POST /season-books/estimate`.
- Required action: Backend should either implement `POST /season-books/order` or confirm the frontend order screen is ahead of the backend slice and should remain in a known-blocked state.
- User notified: yes
- Status: open
