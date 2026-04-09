# Book Print API Analysis

Generated: 2026-04-08
Status: Docs-based technical analysis for project planning

## Purpose

This document summarizes the documented surface area of the Sweetbook Book Print API so future agents can plan and implement against one shared reference.

It is intentionally focused on technical facts:

- documented endpoints
- workflow and state transitions
- hard constraints that affect product scope
- SDK surface and implementation implications

It does not store submission-answer drafts or subjective writeup notes.

## Sources

- Official docs overview: <https://api.sweetbook.com/docs/>
- Docs version observed: `v1.0.2 (2026-04-03)`
- Workflow guide: <https://api.sweetbook.com/docs/guides/workflow/>
- Auth: <https://api.sweetbook.com/docs/authentication/>
- Common API rules: <https://api.sweetbook.com/docs/api/common/>
- Books: <https://api.sweetbook.com/docs/api/books/>
- Orders: <https://api.sweetbook.com/docs/api/orders/>
- Templates: <https://api.sweetbook.com/docs/api/templates/>
- BookSpecs: <https://api.sweetbook.com/docs/api/book-specs/>
- Credits: <https://api.sweetbook.com/docs/api/credits/>
- Webhooks: <https://api.sweetbook.com/docs/api/webhooks/>
- Webhook Events: <https://api.sweetbook.com/docs/api/webhook-events/>
- Error codes: <https://api.sweetbook.com/docs/api/errors/>
- Idempotency concept: <https://api.sweetbook.com/docs/concepts/idempotency/>
- Order status operations guide: <https://api.sweetbook.com/docs/operations/order-status/>
- SDK overview: <https://api.sweetbook.com/docs/sdk/>
- Demo apps: <https://api.sweetbook.com/docs/demo-apps/>
- Node.js SDK repo: <https://github.com/sweet-book/bookprintapi-nodejs-sdk>
- Python SDK repo: <https://github.com/sweet-book/bookprintapi-python-sdk>

## Executive Summary

The API is best understood as a template-driven book production pipeline, not a freeform page editor.

Core implication:

- A product should assemble a book from structured content plus images.
- The backend must orchestrate a strict state machine: choose spec -> choose templates -> create book -> attach cover/contents -> finalize -> estimate -> order.
- `Books API` and `Orders API` are the hard center of the assignment.
- The biggest implementation risk is not authentication; it is page-count validity, template parameter mapping, and safe retry/idempotency around create/order requests.

## Mental Model

Think in these domain objects:

| Entity | What it means | Why it matters |
|---|---|---|
| `BookSpec` | Physical product spec: size, binding, page min/max/increment | Determines valid template set and final page rules |
| `Template` | Predefined layout for cover or content pages | The API expects template-based rendering, not arbitrary canvas editing |
| `Book` | A draft or finalized printable artifact | Main object edited before order |
| `Photo` | Uploaded reusable asset tied to a book | Needed for gallery-style pages or local file uploads |
| `Cover` | The one cover attached to a book | Separate endpoint and separate template kind |
| `Content page(s)` | Repeated interior pages created from content templates | Built one request at a time |
| `Order` | Purchase request for one or more finalized books | Requires shipping info and immediately touches credits |
| `Credit` | Prepaid balance used for payment | Must be sufficient before order creation |
| `Webhook config` | Delivery target for async lifecycle updates | Useful for production, optional for MVP |

## Environments and Authentication

### Environments

| Environment | Base URL | Notes |
|---|---|---|
| Sandbox | `https://api-sandbox.sweetbook.com/v1` | Test-only, real printing and shipping do not happen |
| Live | `https://api.sweetbook.com/v1` | Real production environment |

Important documented differences:

- Sandbox and Live API keys are separate.
- Sandbox and Live data are fully separated.
- Sandbox uses separate credits.
- Sandbox orders stop at `PAID` and do not proceed through manufacturing or shipping.
- Webhooks still fire in Sandbox.

### Authentication

- All requests require `Authorization: Bearer {API_KEY}`.
- Keys start with `SB` and include a `.` separator.
- Keys never belong in the browser.
- Optional IP allowlisting is supported according to the auth guide.

## Common Protocol Rules

### Content types

| Content-Type | Where used |
|---|---|
| `application/json` | Orders, Webhooks, most non-file endpoints |
| `multipart/form-data` | Cover, Contents, Photos |

### Pagination

Documented list endpoints use `limit` and `offset`.

- default limit: usually `20` or `50`, endpoint-specific
- max limit: usually `100`
- common response shape includes `total`, `limit`, `offset`, `hasNext` or endpoint-local variants

### Error model

Documented HTTP status codes:

- `200` success
- `201` resource created
- `400` validation error
- `401` auth failure
- `402` insufficient credit
- `403` forbidden
- `404` not found
- `409` conflict
- `429` rate limited
- `500` server error

Validation failures may include `fieldErrors`.

### Idempotency and retry safety

Documented guidance strongly implies that create-like POST operations must be treated as retry-sensitive.

Relevant facts:

- `POST /books` supports `Idempotency-Key`.
- `POST /orders` should include `Idempotency-Key`.
- `POST /credits/sandbox/charge` and `POST /credits/sandbox/deduct` support `Idempotency-Key`.
- The idempotency concept doc also describes a Redis lock with `TTL 30s` for duplicate in-flight requests.

Practical rule:

- Always generate a unique request key for book creation, order creation, and sandbox credit mutations.

## End-to-End Workflow

Documented high-level sequence:

1. `GET /book-specs`
2. `GET /templates`
3. `POST /books`
4. `POST /books/{bookUid}/photos` if needed
5. `POST /books/{bookUid}/cover`
6. `POST /books/{bookUid}/contents` repeatedly
7. `POST /books/{bookUid}/finalization`
8. `POST /orders/estimate`
9. `POST /orders`
10. Optional webhook handling

The workflow guide presents two especially relevant product patterns:

- User-selected album flow
- Server-generated diary/notice flow

That distinction is important for planning:

- user-selected apps lean on photo upload
- structured-content apps can often skip photo pre-upload and pass image URLs directly

## Core Hard Constraints

These constraints should directly shape the product concept and MVP scope.

### 1. Editing only happens in `DRAFT`

- `DRAFT` books can receive cover, contents, and photo uploads.
- `FINALIZED` books can no longer be edited.
- Orders and estimates only make sense after finalization.

### 2. Finalization is a hard gate

Finalization checks page rules:

- `actualPageCount >= pageMin`
- `actualPageCount <= pageMax`
- `(actualPageCount - pageMin) % pageIncrement == 0`

This is the single most important technical constraint for MVP design.

### 3. Cover is singular

- One cover per book.
- Wrong template kind cannot be used on the wrong endpoint.

### 4. Template compatibility is strict

- `template.bookSpecUid` must match the book's `bookSpecUid`.
- `templateKind` must be `cover` for cover and `content` for interior pages.

### 5. Shipping data is required at order time

An order requires shipping fields such as:

- `recipientName`
- `recipientPhone`
- `postalCode`
- `address1`

### 6. Credits are a real part of the flow

- Orders immediately deduct credits.
- Insufficient balance returns `402`.
- Sandbox offers charge and deduct endpoints for testing scenarios.

### 7. Sandbox is not a full production simulator

- Sandbox stops at `PAID`.
- Post-payment manufacturing states do not advance automatically there.

## API Inventory

### Books Area

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/books` | List books or filter to one via `bookUid` query | Docs use query filters rather than a separately documented detail path |
| `POST` | `/v1/books` | Create empty draft book | Supports `Idempotency-Key` |
| `POST` | `/v1/books/{bookUid}/cover` | Apply or update cover | `multipart/form-data`; files, URLs, and uploaded file names can be mixed |
| `POST` | `/v1/books/{bookUid}/photos` | Upload reusable book photos | Supports duplicate detection by MD5 |
| `GET` | `/v1/books/{bookUid}/photos` | List uploaded photos | Returns server file names for later reference |
| `DELETE` | `/v1/books/{bookUid}/photos/{fileName}` | Delete one uploaded photo | Not allowed once book is finalized |
| `POST` | `/v1/books/{bookUid}/contents` | Add or update interior content pages | `breakBefore=page` controls layout grouping |
| `DELETE` | `/v1/books/{bookUid}/contents` | Clear all interior pages | Explicitly described as development/test utility |
| `POST` | `/v1/books/{bookUid}/finalization` | Lock draft into finalized printable book | Validates page count rules |
| `DELETE` | `/v1/books/{bookUid}` | Soft-delete book | Status becomes `9 (deleted)` |

Books-specific notes:

- Documented book statuses: `0 draft`, `2 finalized`, `9 deleted`
- Photo upload supports `jpg`, `jpeg`, `png`, `gif`, `bmp`, `webp`, `heic`, `heif`
- Unsupported examples include `svg`, `tiff`, `pdf`, `ai`, `psd`
- File size limit is documented as `50MB`
- Upload processing performs conversion and EXIF cleanup

### Orders Area

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `POST` | `/v1/orders/estimate` | Price estimate before payment | Used in quickstart and SDKs; should be shown to user before order |
| `GET` | `/v1/orders` | List orders | Supports period and status filters |
| `GET` | `/v1/orders/{orderUid}` | Order detail | Returns item details and shipping summary |
| `POST` | `/v1/orders` | Create order | Requires finalized books and shipping object |
| `POST` | `/v1/orders/{orderUid}/cancel` | Cancel eligible order | Only `PAID` or `PDF_READY` partner cancellation |
| `PATCH` | `/v1/orders/{orderUid}/shipping` | Update shipping before shipment | Allowed through `CONFIRMED` but not after shipment |

Order-specific facts:

- Orders can include multiple items.
- Each item references a finalized `bookUid`.
- Shipping fee is documented as `3,000 KRW` per order.
- Orders are paid using credits, not card checkout through this API.
- `Idempotency-Key` is strongly recommended for order creation.

### Templates Area

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/templates` | List templates | Filter by `bookSpecUid`, `category`, `templateKind`, `theme`, `templateName` |
| `GET` | `/v1/templates/{templateUid}` | Fetch template details | Includes parameter definitions and layout metadata |
| `GET` | `/v1/template-categories` | List categories | Categories documented on template guide page |

Useful documented categories:

- `diary`
- `notice`
- `album`
- `yearbook`
- `wedding`
- `baby`
- `travel`
- `etc`

Parameter model:

- parameter metadata lives under `parameters.definitions`
- binding types include `text`, `file`, and gallery-like bindings
- placeholder syntax uses `$$variableName$$`

### BookSpecs Area

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/book-specs` | List physical book specs | Core starting point for valid product choice |
| `GET` | `/v1/book-specs/{bookSpecUid}` | Detail view | Listed in overview docs |

Documented example specs:

| `bookSpecUid` | Notes |
|---|---|
| `PHOTOBOOK_A4_SC` | A4 softcover, `24~130`, increment `2` |
| `PHOTOBOOK_A5_SC` | A5 softcover, `50~200`, increment `2` |
| `SQUAREBOOK_HC` | Square hardcover, `24~130`, increment `2` |

### Credits Area

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/credits` | Current balance | Environment-scoped |
| `GET` | `/v1/credits/transactions` | Credit ledger | Useful for debug and order-payment traceability |
| `POST` | `/v1/credits/sandbox/charge` | Add sandbox credits | Test-only helper |
| `POST` | `/v1/credits/sandbox/deduct` | Deduct sandbox credits | Useful to simulate insufficient-funds paths |

Credits-specific facts:

- Currency is always `KRW`.
- Sandbox and Live balances are separate.
- Sandbox charge/deduct always apply to test credits.

### Webhooks Area

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `PUT` | `/v1/webhooks/config` | Create or update webhook configuration | First registration returns full `secretKey` |
| `GET` | `/v1/webhooks/config` | Inspect current config | Mentioned in docs text |
| `DELETE` | `/v1/webhooks/config` | Disable webhook delivery | Leaves existing delivery history intact |
| `POST` | `/v1/webhooks/test` | Send test event | Mentioned across docs and operations guide |

Documented headers on webhook deliveries:

- `X-Webhook-Signature`
- `X-Webhook-Timestamp`
- `X-Webhook-Event`
- `X-Webhook-Delivery`

Signature formula:

- payload string is `{timestamp}.{JSON body}`
- expected signature is `sha256=` + HMAC-SHA256(secretKey, payload)

### Webhook Event Surface

Documented webhook payload docs and order-status docs together indicate these event families:

- `order.created`
- `order.cancelled`
- `order.restored`
- `order.paid`
- `order.confirmed`
- `order.status_changed`
- `order.shipped`
- production-related events in workflow guide:
  - `production.confirmed`
  - `production.started`
  - `production.completed`
  - `shipping.departed`
  - `shipping.delivered`

Implementation takeaway:

- Treat event naming as something to verify in Sandbox before hardcoding production logic.
- For take-home scope, webhook handling can be optional unless the chosen story needs status sync.

## State Machines

### Book state

| Code | State | Meaning |
|---|---|---|
| `0` | `draft` | Editable |
| `2` | `finalized` | Locked and orderable |
| `9` | `deleted` | Soft-deleted |

### Order state

| Code | State | Meaning |
|---|---|---|
| `20` | `PAID` | Credits deducted |
| `25` | `PDF_READY` | PDF generated |
| `30` | `CONFIRMED` | Production confirmed |
| `40` | `IN_PRODUCTION` | Printing/manufacturing in progress |
| `50` | `PRODUCTION_COMPLETE` | Production complete |
| `60` | `SHIPPED` | Shipped |
| `70` | `DELIVERED` | Delivered |
| `80` | `CANCELLED` | Cancelled |
| `81` | `CANCELLED_REFUND` | Cancelled with refund |

Partner actions by state:

- cancel: `PAID`, `PDF_READY`
- shipping update: `PAID`, `PDF_READY`, `CONFIRMED`

Sandbox behavior:

- order remains at `PAID`

## SDK Surface Summary

### Node.js SDK

Documented characteristics:

- designed for server-side Node environments
- requires Node `18+`
- includes webhook signature verification utility
- fits Express or similar backends

Documented resource clients:

- `client.books`: `list`, `create`, `get`, `finalize`, `delete`
- `client.photos`: `upload`, `list`, `delete`
- `client.covers`: `create`, `get`, `delete`
- `client.contents`: `insert`, `clear`
- `client.orders`: `estimate`, `create`, `list`, `get`, `cancel`, `updateShipping`
- `client.credits`: `getBalance`, `transactions`, `sandboxCharge`

### Python SDK

Documented characteristics:

- broadest written examples and CLI walkthrough
- shows full create -> estimate -> order -> cancel loop
- documents status map and example price calculation

Additional helpful notes from Python SDK README:

- example price model shown as:
  - item subtotal
  - `+ 3,000 KRW` shipping
  - `+ VAT 10%`
  - rounded down below `10 KRW`
- includes CLI examples for:
  - credits
  - books
  - orders

## Product-Planning Implications

### Best-fit product shapes

The API is especially well matched to these service patterns:

1. Structured records -> book
2. User-curated photo selection -> album
3. Repeatable periodic print product

Examples that fit the API naturally:

- parenting monthly growth book
- classroom/monthly notice book
- travel memory album
- pet growth album
- journal or newsletter compilation

### Product shapes to avoid for a 1-week MVP

- full WYSIWYG page editor
- unconstrained drag-and-drop publishing tool
- highly dynamic consumer checkout platform with complex payment logic
- flows that require live delivery-state realism in Sandbox

### Architecture implication

For a take-home web service, the backend should own:

- API key usage
- spec/template lookup
- book assembly orchestration
- idempotency keys
- estimate and order calls

The frontend should focus on:

- content intake
- previewable flow state
- estimate display
- shipping form
- order confirmation

## Risks to Validate Early with a Sandbox Key

These are the first real-world checks to run once the key is available:

1. Which `bookSpecUid` and template UIDs are actually available in the account
2. Which categories/themes exist in Sandbox for the chosen use case
3. Exact parameter definitions for the chosen cover/content templates
4. How many interior pages each template call produces in practice
5. Whether image URL ingestion works reliably for the chosen asset source
6. Exact response shape of `POST /orders/estimate`
7. Actual webhook event names emitted by Sandbox test deliveries

## Recommended Reading Order for Future Agents

If another agent joins the project, read in this order:

1. This file
2. `ASSIGNMENT_GUIDE.md`
3. official workflow guide
4. templates + book-specs docs
5. books + orders docs
6. SDK README for the selected language

## Bottom Line

The safest interpretation of the platform is:

- Sweetbook is a server-side, template-driven book manufacturing API
- the product should help users transform structured content into a valid finalized book
- success depends more on choosing the right content model than on building a complex editor
- for a one-week assignment, scope should optimize for deterministic book assembly and a smooth estimate -> order flow
