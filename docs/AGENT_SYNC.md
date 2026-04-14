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

## SYNC-005

- Date: 2026-04-12
- Time: 22:17
- Source role: QA
- Target role: Backend
- Type: blocker
- Related area: `apps/api/src/upload/storage/r2-image-storage.service.ts`
- Summary: QA found that the latest R2 upload storage slice passes Jest tests but fails `npm run build -w apps/api` because `fetch` body receives a Node `Buffer` that is not assignable to the current `BodyInit` type.
- Required action: Backend should adjust the R2 upload request body typing or conversion so the API production build passes while preserving the passing R2 upload tests.
- User notified: yes
- Status: open

## SYNC-006

- Date: 2026-04-12
- Time: 22:23
- Source role: Backend
- Target role: QA
- Type: resolved
- Related area: `apps/api/src/upload/storage/r2-image-storage.service.ts`
- Summary: Backend verified that the R2 upload storage slice now passes `npm run build`, unit tests, and e2e tests.
- Required action: QA may treat SYNC-005 as resolved for the R2 build blocker.
- User notified: yes
- Status: resolved

## SYNC-007

- Date: 2026-04-14
- Time: 11:46
- Source role: Backend
- Target role: Frontend QA
- Type: resolved
- Related area: `POST /season-books/order`
- Summary: Backend implemented `POST /season-books/order` for local order completion and added opt-in Sweetbook sandbox order wiring behind `SWEETBOOK_ORDER_MODE=sandbox`.
- Required action: QA can verify the frontend order screen against the backend endpoint without requiring real Sweetbook order placement by default.
- User notified: yes
- Status: resolved

## SYNC-008

- Date: 2026-04-14
- Time: 12:06
- Source role: QA
- Target role: Frontend, Backend
- Type: resolved
- Related area: `POST /season-books/order`
- Summary: QA verified the browser flow from `/season-book/new` through estimate creation, `/order/[projectId]` navigation, shipping form submission, and order completion. The frontend received HTTP 201 from both `POST /season-books/estimate` and `POST /season-books/order`, and the final screen displayed `CONFIRMED` order status with `ORDERED` project status.
- Required action: Frontend and backend may treat SYNC-004 as resolved for the implemented local/R2-backed integration flow. QA still has a separate tests/web unit test maintenance issue where older assertions no longer match updated UI copy.
- User notified: yes
- Status: resolved

## SYNC-009

- Date: 2026-04-14
- Time: 12:33
- Source role: Backend
- Target role: Frontend
- Type: ready
- Related area: `GET /season-books/:projectId/status`
- Summary: Shared contract now defines the season-book order status query endpoint and its response shape, including progress timeline steps for the order-status screen.
- Required action: Frontend may begin integrating the order-progress screen against the fixed contract while backend implementation follows in the next slice.
- User notified: yes
- Status: open

## SYNC-010

- Date: 2026-04-14
- Time: 13:05
- Source role: Backend
- Target role: Frontend
- Type: ready
- Related area: `POST /season-books/:projectId/cancel`, `PATCH /season-books/:projectId/shipping`
- Summary: Shared contracts now define season-book order cancellation and shipping-update endpoints ahead of backend implementation.
- Required action: Frontend may plan or stub the related order-management UI against the fixed request and response shapes while backend implementation follows in later slices.
- User notified: yes
- Status: open

## SYNC-011

- Date: 2026-04-14
- Time: 13:23
- Source role: Backend
- Target role: Frontend
- Type: ready
- Related area: `POST /season-books/:projectId/cancel`
- Summary: Backend implemented the season-book cancel endpoint. Cancellation keeps `projectStatus` as `ORDERED` and returns terminal order history through `orderStatus` such as `CANCELLED_REFUND`.
- Required action: Frontend can wire the cancel action and render cancelled orders as terminal history, not as a reopened reorderable project.
- User notified: yes
- Status: open

## SYNC-012

- Date: 2026-04-14
- Time: 14:05
- Source role: Backend
- Target role: Frontend
- Type: ready
- Related area: `PATCH /season-books/:projectId/shipping`
- Summary: Backend implemented the season-book shipping update endpoint. The API persists shipping fields on the local project record and forwards updates to Sweetbook when the order is external and the Sandbox API key is configured.
- Required action: Frontend can wire the address-edit form against the existing contract and expect the response to return the fully merged shipping object.
- User notified: yes
- Status: open

## SYNC-013

- Date: 2026-04-14
- Time: 14:24
- Source role: Backend
- Target role: Frontend
- Type: ready
- Related area: `GET /season-books/:projectId/status`
- Summary: Shared contract is being expanded so the season-book status response can optionally include the current shipping snapshot for form prefill.
- Required action: Frontend should treat `status.shipping` as the preferred prefill source once the backend implementation lands, instead of requiring full re-entry.
- User notified: yes
- Status: open
