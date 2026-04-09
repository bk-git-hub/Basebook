# Design: 베이스북

Generated: 2026-04-09
Status: DRAFT
Mode: Builder

## Source References

- Sweetbook workflow guide: <https://api.sweetbook.com/docs/guides/workflow/>
- Books API: <https://api.sweetbook.com/docs/api/books/>
- Orders API: <https://api.sweetbook.com/docs/api/orders/>
- Templates API: <https://api.sweetbook.com/docs/api/templates/>
- BookSpecs API: <https://api.sweetbook.com/docs/api/book-specs/>
- Credits API: <https://api.sweetbook.com/docs/api/credits/>

## Summary

`베이스북`은 야구팬이 경기 후 감정, 사진, 메모를 기록하고, 누적된 기록을 시즌이 끝난 뒤 한 권의 책으로 주문할 수 있는 웹 서비스다.

이 서비스의 핵심은 포토북 편집기가 아니라 `경기 경험 기록`이다. Sweetbook API는 그 기록을 실물 책으로 전환하는 fulfillment 인프라로 사용한다.

첫 버전의 핵심 차별점은 `포토북 제작이 편한 것`보다 `경기 메타데이터가 이미 채워진 상태에서 빠르게 일지를 남길 수 있는 것`이다.

## Why This Service

Sweetbook가 이미 직접 제공하는 서비스는 포토북 제작과 주문 자체에 가깝다. 반면 `베이스북`은 팬이 시즌 동안 꾸준히 기록을 쌓는 서비스이며, 책은 그 결과물이다.

이 차이가 중요하다.

- Sweetbook 직접 서비스: 결과물을 만드는 경험
- 베이스북: 과정을 기록하는 경험

즉, `service first, print second` 구조를 가진 새로운 파트너사 형태의 서비스로 해석할 수 있다.

## Problem Statement

야구팬의 경기 경험은 강한 감정과 추억을 남기지만, 대부분 흩어져 사라진다.

- 사진은 사진첩에 남는다
- 감상은 SNS나 메모앱에 흩어진다
- 시즌 전체의 흐름은 정리되지 않는다
- 나중에 돌아보려고 해도 경기별 기억을 다시 모으기 어렵다

야구팬은 단순히 사진을 모으는 것이 아니라 `그날의 경기 경험`을 남기고 싶다.

## Core User

첫 사용자:

- 응원팀 경기를 꾸준히 챙겨 보는 KBO 팬

확장 사용자:

- 직관을 자주 가는 팬
- 집에서 중계를 보며 감상을 남기는 팬
- 한 시즌을 기록물로 남기고 싶은 팬

핵심 정의:

이 서비스는 `직관러만을 위한 앱`이 아니라 `경기 경험을 기록하고 싶은 야구팬`을 위한 서비스다.

## Core Value

### 1. 평소에는 경기 기록 서비스로 쓴다

사용자는 경기마다 다음을 남긴다.

- 한줄 감상
- 오늘의 장면
- 응원팀과 상대팀
- 결과와 점수
- 사진
- 자유 메모

### 2. 경기 기본 정보가 자동으로 채워진다

사용자는 경기 결과와 상대팀, 날짜 같은 기본 정보를 일일이 찾지 않아도 된다.

- 경기 일정
- 상대팀
- 스코어
- 승/패
- 구장

이 정보는 공개 KBO 경기 페이지 기반으로 자동 보강하거나, 더미 데이터/관리자 데이터셋으로 제공한다.

### 3. 시즌이 끝나면 책으로 만든다

기록이 쌓이면 사용자는 일부 또는 전체 기록을 골라 시즌북을 생성하고 Sweetbook API를 통해 주문할 수 있다.

## What Makes This Different

`베이스북`의 차별점은 포토북 제작이 편한 것이 아니다.

진짜 차별점은 다음 세 가지다.

1. 야구 맥락이 있는 기록 UX
2. 경기 메타데이터 자동 보강
3. 시즌 단위 누적 구조
4. 기록을 책으로 전환하는 자연스러운 프리미엄 경험

Sweetbook에서 바로 해결되는 문제는 `책 제작`이고, 베이스북이 해결하는 문제는 `기록 축적과 정리`다.

## Service Positioning

한 줄 설명:

`응원 경기를 보고 사진과 감상을 남기면, 경기 기록이 자동으로 정리되고 시즌이 끝나면 나만의 야구 일지북으로 보관할 수 있는 웹 서비스`

서비스 포지션:

- 기록 앱
- 팬 경험 아카이브
- 시즌 리캡북 서비스

포토북 앱 포지션은 아니다.

## MVP Scope

첫 버전에서는 한 가지 흐름만 완성한다.

`경기 기록 작성 -> 기록 누적 -> 시즌북 생성 -> 견적 확인 -> 주문`

### In Scope

- 팀 선택
- 경기 선택 또는 경기 정보 자동 불러오기
- 경기별 기록 작성
- 사진 업로드
- 경기 메타데이터 자동 보강
- 기록 리스트 / 상세 보기
- 시즌북 만들기
- Sweetbook 책 생성
- Sweetbook 주문 견적
- Sweetbook 주문 생성

### Out of Scope

- 실시간 문자중계 수준의 라이브 기능
- 공식 KBO API 의존
- 소셜 피드, 팔로우, 댓글
- 복수 사용자 협업
- 자유 편집기
- 복수 상품군 지원
- 웹훅 기반 상태 동기화
- 자체 결제 시스템
- AI 자동 문장 생성 기능

## Sweetbook API Integration Plan

`베이스북`이 실제로 사용하는 Sweetbook API는 아래 흐름으로 제한한다.

### 1. 판형 조회

- `GET /v1/book-specs`

역할:

- 사용할 판형 후보 확인
- 페이지 최소/최대/증분 규칙 확인
- 가격 구조 확인

문서 근거:

- BookSpecs 문서는 판형별 `pageMin`, `pageMax`, `pageIncrement`와 가격 정보를 제공한다고 설명한다.
- 예시로 `SQUAREBOOK_HC`는 `24~130페이지`, `2페이지 단위 증가` 규칙을 가진다.

현재 판단:

- 첫 버전은 `SQUAREBOOK_HC` 또는 `PHOTOBOOK_A4_SC` 중 하나로 고정하는 것이 안정적이다.

### 2. 템플릿 조회

- `GET /v1/templates`
- `GET /templates/{templateUid}`

역할:

- 선택한 판형에 맞는 표지/내지 템플릿 조회
- 템플릿 변수명과 파라미터 구조 확인
- 실제 페이지 매핑 규칙 확인

문서 근거:

- Templates 문서는 `templateKind`를 `cover`, `content`, `divider`, `publish`로 구분한다.
- `GET /templates`는 `bookSpecUid`, `templateKind`, `category`, `theme` 기준 필터링을 지원한다.
- `GET /templates/{templateUid}`는 파라미터 정의와 레이아웃 정보를 제공한다.

현재 판단:

- 첫 버전은 표지 템플릿 1개, 내지 템플릿 1~2개만 선택해 고정하는 것이 좋다.
- 내지는 `content` 템플릿만 써도 충분하다.

### 3. 책 생성

- `POST /v1/books`

역할:

- 시즌북 draft 생성

문서 근거:

- Books 문서에 따르면 책은 draft 상태로 생성되고, 이후 표지와 내지를 추가한다.
- `Idempotency-Key`를 지원하므로 재시도 시 중복 생성 방지가 가능하다.

현재 판단:

- 시즌북 생성 버튼을 누르면 서버가 `title`, `bookSpecUid`, `externalRef`를 이용해 draft를 만든다.

### 4. 사진 업로드

- `POST /v1/books/{bookUid}/photos`

역할:

- 사용자가 업로드한 사진을 Sweetbook 서버 파일명으로 저장
- 이후 내지 구성 시 재사용 가능

문서 근거:

- Books 문서는 업로드 후 반환되는 `fileName`을 contents API에서 사용할 수 있다고 명시한다.
- 지원 포맷과 파일 크기 제한도 명확하다.

현재 판단:

- 첫 버전에서는 반드시 필요한 API는 아니지만, 업로드 이미지를 안정적으로 재사용하려면 포함하는 편이 좋다.
- 사진 수가 적다면 URL 방식으로도 구성 가능하지만, 로컬 샘플 이미지/사용자 업로드를 생각하면 photo upload가 더 안전하다.

### 5. 표지 생성

- `POST /v1/books/{bookUid}/cover`

역할:

- 표지 템플릿에 대표 사진, 시즌 제목, 응원팀명 등을 바인딩

문서 근거:

- Cover API는 multipart/form-data 기반이며, 템플릿 변수명과 필드명이 정확히 일치해야 한다.
- URL, 업로드 파일, 서버 파일명을 혼용할 수 있다.

현재 판단:

- 표지는 시즌 대표 사진 + 제목 + 팀명 정도로 단순하게 구성한다.

### 6. 내지 생성

- `POST /v1/books/{bookUid}/contents?breakBefore=page`

역할:

- 경기별 일지 페이지를 반복 생성

문서 근거:

- Contents API는 템플릿과 파라미터로 페이지를 추가한다.
- `breakBefore=page`로 경기 기록 하나를 새 페이지 단위로 시작시킬 수 있다.
- 필수 파라미터 누락 시 400 에러가 발생한다.

현재 판단:

- 경기 기록 1개를 1 spread 또는 1 block으로 매핑하는 단순 구조가 적합하다.
- 페이지 규칙을 맞추기 위해 시즌북 포함 경기 수를 제한하거나, 서문/목차/마무리 페이지를 추가하는 방식이 필요하다.

### 7. 최종화

- `POST /v1/books/{bookUid}/finalization`

역할:

- draft를 주문 가능한 finalized 상태로 전환

문서 근거:

- Finalization은 draft 상태에서만 가능하다.
- 판형별 최소/최대/증분 페이지 규칙을 만족해야 한다.
- 재호출 시 멱등적으로 동작한다.

현재 판단:

- 시즌북 생성 로직은 이 API가 성공할 수 있도록 페이지 수를 먼저 계산해야 한다.
- 이 제약이 실제 구현의 핵심이다.

### 8. 견적 조회

- `POST /v1/orders/estimate`

역할:

- 주문 전 예상 금액 확인
- 충전금 부족 여부 확인

문서 근거:

- Workflow와 Quickstart는 finalization 후 `POST /orders/estimate`를 호출하는 순서를 명시한다.
- Quickstart는 `creditSufficient` 확인을 언급한다.

현재 판단:

- 사용자는 주문 전에 가격을 반드시 보게 해야 한다.
- 이 API는 시즌북 생성 성공 직후 호출한다.

### 9. 주문 생성

- `POST /v1/orders`

역할:

- 배송지와 수량 정보를 포함해 주문 생성

문서 근거:

- Orders 문서는 `FINALIZED` 상태의 책만 주문 가능하다고 설명한다.
- `recipientName`, `recipientPhone`, `postalCode`, `address1` 등의 배송 정보가 필요하다.
- 충전금이 즉시 차감되므로 `Idempotency-Key`를 반드시 포함하라고 명시한다.

현재 판단:

- 첫 버전은 1권 주문만 지원해도 충분하다.
- 주문 성공 후 orderUid를 저장해 주문 완료 화면에 보여준다.

### 10. 충전금 조회

- `GET /v1/credits`

역할:

- Sandbox 테스트 시 잔액 확인

문서 근거:

- Credits 문서는 현재 파트너 계정의 잔액을 조회한다고 설명한다.

현재 판단:

- 사용자 기능으로 노출할 필요는 없다.
- 서버나 관리자/개발용 체크에만 쓴다.

## Selected API Surface

첫 버전에서 실제로 제품 플로우에 넣는 API는 다음으로 제한한다.

- `GET /v1/book-specs`
- `GET /v1/templates`
- `GET /templates/{templateUid}`
- `POST /v1/books`
- `POST /v1/books/{bookUid}/photos`
- `POST /v1/books/{bookUid}/cover`
- `POST /v1/books/{bookUid}/contents?breakBefore=page`
- `POST /v1/books/{bookUid}/finalization`
- `POST /v1/orders/estimate`
- `POST /v1/orders`

보조적으로 확인만 하는 API:

- `GET /v1/credits`

## Technical Stack

### Recommended Stack

- Frontend: `Next.js` + `React` + `TypeScript`
- Styling: `Tailwind CSS`
- UI primitives: `shadcn/ui`
- Backend: `Nest.js` + `TypeScript`
- Backend validation: `ValidationPipe` + `class-validator`
- Data: `SQLite` + `Prisma`
- Image storage: `Vercel Blob`
- Sweetbook integration: official `bookprintapi-nodejs-sdk`
- Forms/uploads: browser `FormData` + Nest multipart endpoints
- Testing: frontend `Vitest` + `React Testing Library`, backend `Jest` + `Supertest`, end-to-end `Playwright`
- Deployment target: frontend `Vercel`, backend `Render` or `Railway`

### Why This Stack

이 조합이 첫 버전에 가장 적합한 이유는 다음과 같다.

1. 프론트엔드와 백엔드 책임이 명확하게 분리된다
2. Sweetbook API Key와 주문 파이프라인을 별도 API 서버에서 안전하게 다룰 수 있다
3. Node.js SDK를 Nest 서비스 계층에 자연스럽게 넣을 수 있다
4. 풀스택 포지션 관점에서 backend 전문성을 더 분명하게 보여줄 수 있다
5. SQLite로 더미 데이터와 로컬 실행을 단순하게 유지할 수 있다

### Opinionated Recommendation

`Next.js + Nest.js + Prisma + SQLite + Node SDK`를 선택하는 것이 가장 안정적이다.

이유:

- boring-by-default에 가깝다
- 웹과 API 책임이 명확하게 나뉜다
- Sweetbook orchestration 로직을 backend 서비스 계층으로 분리하기 좋다
- 사진 업로드, 서버 API, 도메인 검증, 외부 연동을 백엔드에서 일관되게 다룰 수 있다
- 발표나 코드 리뷰에서 "프론트가 있는 서비스"가 아니라 "프론트와 백엔드를 설계한 서비스"로 보이기 쉽다

## Stack Alternatives

### Approach A: Next.js + Nest.js

구성:

- Next.js
- Nest.js
- TypeScript
- Tailwind
- Prisma + SQLite
- Sweetbook Node SDK

장점:

- 프론트와 백엔드 책임이 가장 선명하다
- 컨트롤러, 서비스, DTO 구조로 서버 전문성을 보여주기 좋다
- Sweetbook orchestration, 이미지 처리, 향후 동기화 로직을 백엔드에 모으기 좋다

단점:

- 앱이 두 개로 나뉘어 로컬 실행과 배포 구성이 조금 늘어난다
- 초기 설정 파일이 더 많아진다

### Approach B: Next.js Full-stack

구성:

- Next.js
- TypeScript
- Tailwind
- Prisma + SQLite
- Sweetbook Node SDK

장점:

- 가장 빠르게 구현할 수 있다
- 한 앱 안에서 페이지와 서버 로직을 같이 다룰 수 있다

단점:

- backend 구조가 상대적으로 덜 분명하게 보일 수 있다
- 외부 연동과 도메인 로직이 커질수록 route handler가 비대해질 위험이 있다

### Approach C: React + Express

구성:

- React + Vite
- Express
- TypeScript
- Prisma + SQLite
- Sweetbook Node SDK

장점:

- API 서버 구조가 단순하고 익숙하다
- Next의 서버 개념과 분리되어 혼동이 적다

단점:

- SSR과 앱 라우팅, 이미지 최적화 같은 웹앱 장점을 포기하게 된다
- 프론트는 Next보다 한 단계 더 수동 세팅이 필요하다

### Recommendation Summary

추천안은 `Approach A`다.

완성도:

- A: 10/10
- B: 8/10
- C: 7/10

## Runtime Architecture

```text
+------------------+        HTTPS        +-----------------------------+
|   Browser UI     | -----------------> |  Next.js Web App            |
|                  |                    |                             |
| - season pages   | <----------------- | - React pages/components    |
| - entry editor   |   HTML / JSON      | - client-side data fetching |
| - book builder   |                    | - upload forms              |
+------------------+                    +-------------+---------------+
                                                      |
                                                      | HTTPS / JSON / multipart
                                                      v
                                         +---------------------------+
                                         | Nest.js API               |
                                         | - controllers             |
                                         | - services                |
                                         | - dto validation          |
                                         | - Sweetbook orchestration |
                                         +------+------+-------------+
                                                |      |
                                      Prisma    |      | SDK / HTTPS
                                                |      v
                                                |  +------------------+
                                                |  | Sweetbook API    |
                                                |  | - book-specs     |
                                                |  | - templates      |
                                                |  | - books          |
                                                |  | - orders         |
                                                |  +------------------+
                                                v
                                     +---------------------------+
                                     | SQLite                    |
                                     | - diary entries           |
                                     | - season book projects    |
                                     | - seeded demo data        |
                                     +---------------------------+
                                                |
                                                | object storage
                                                v
                                     +---------------------------+
                                     | Vercel Blob               |
                                     | - uploaded photos         |
                                     +---------------------------+
```

## Request Flow

```text
[User writes game diary]
        |
        v
[Next.js form submit]
        |
        v
[Nest controller receives request]
        |
        v
[DTO validation + service layer]
        |
        +--> [Upload image to Vercel Blob if needed]
        |
        +--> [Save diary entry to SQLite]
        |
        v
[User clicks "Create season book"]
        |
        v
[Nest service loads selected diary entries]
        |
        v
[Sweetbook book creation pipeline]
  -> book-specs/templates lookup
  -> create draft book
  -> upload photos
  -> create cover
  -> create contents
  -> finalization
  -> estimate
  -> order
        |
        v
[Persist bookUid / orderUid / estimate]
        |
        v
[Return order complete screen]
```

## Data and Storage Decisions

### Metadata Storage

`SQLite`를 선택한다.

저장 대상:

- DiaryEntry
- SeasonBookProject
- sample seed data

이유:

- 로컬 실행이 가장 쉽다
- 과한 인프라가 필요 없다
- 데모 데이터와 함께 관리하기 좋다

### Image Storage

첫 버전은 두 단계 전략을 쓴다.

1. 샘플 이미지는 레포에 포함한다
2. 사용자 업로드 이미지는 `Vercel Blob`에 저장한다

선택 이유:

- Vercel에 배포할 때 추가 서버 설정 없이 붙이기 쉽다
- 로컬 개발과 배포 환경의 차이를 줄이기 좋다
- 이미지 URL을 서버에서 안정적으로 재사용할 수 있다

주의:

- Vercel의 기본 파일시스템은 영구 저장소가 아니다
- 따라서 배포 환경에서는 외부 오브젝트 스토리지가 필요하다

현재 판단:

- 첫 버전부터 `Vercel Blob`을 사용한다
- 로컬 샘플 데이터는 레포 이미지로 유지한다
- 사용자가 새로 올리는 사진은 Blob에 저장한다
- 이 선택이 가장 무난하고, 별도 인프라 지식이 많지 않아도 운영하기 쉽다

## Test Stack

- Unit: `Vitest`
- UI component: `React Testing Library`
- End-to-end: `Playwright`

필수 테스트 대상:

- 경기 기록 생성/수정
- 시즌북 포함 경기 선택
- Sweetbook 요청 전 payload 검증
- finalization 이전 페이지 수 계산
- estimate/order 성공 및 실패 처리

## Observability for MVP

첫 버전은 간단하게 시작한다.

- server log: Sweetbook 요청/응답 요약
- request id: 책 생성/주문 시 상관관계 ID 기록
- stored status: `bookUid`, `orderUid`, `estimate`
- error surfacing: 사용자에게 단계별 실패 메시지 노출

## NOT in Scope for Stack

- microservices 분리
- message queue
- Redis
- background worker infrastructure
- real-time subscriptions
- managed Postgres
- webhook-driven async architecture

이들은 지금 단계에서 구현 복잡도만 높이고 핵심 가치에는 직접 기여하지 않는다.

## User Flow

### 1. 시작

사용자는 서비스에 들어와 응원팀을 선택하고 데모 또는 내 기록으로 시작한다.

### 2. 경기 기록

사용자는 `오늘 경기 기록하기` 화면에서 다음을 입력한다.

필수 필드:

- 날짜
- 응원팀
- 상대팀
- 한줄 감상
- 오늘의 장면

선택 필드:

- 점수
- 승/패
- 관람 형태
- 장소
- 좌석
- 오늘의 선수
- 자유 메모
- 사진 1~5장

추천 입력 방식:

- 사용자가 날짜와 응원팀을 고르면 후보 경기 목록이 뜬다
- 사용자가 해당 경기를 선택하면 경기 기본 정보가 자동으로 채워진다
- 사용자는 감상과 사진만 채우면 된다

### 3. 기록 누적

경기 기록은 시즌 타임라인에 쌓인다.

- 경기 수
- 승/패 요약
- 최근 기록
- 사진 썸네일

### 4. 시즌북 생성

사용자는 시즌북에 포함할 기록을 선택하고 다음을 정한다.

- 책 제목
- 대표 표지 사진
- 시즌 소개 문구 입력

### 5. 주문

백엔드가 Sweetbook API를 통해 책을 만들고 가격 견적을 가져온다.

사용자는 배송지를 입력하고 주문을 생성한다.

## Screens

### 1. Landing

- 서비스 소개
- 샘플 시즌북 이미지
- 데모로 시작하기

### 2. Season Dashboard

- 응원팀 정보
- 누적 경기 수
- 최근 기록
- 시즌북 만들기 CTA

### 3. Entry Editor

- 경기 정보 입력
- 경기 자동 선택 / 자동 채움
- 사진 업로드
- 메모 입력

### 4. Entry Detail

- 원본 메모
- 경기 정보
- 수정 / 저장

### 5. Season Book Builder

- 포함할 경기 선택
- 표지 설정
- 책 요약

### 6. Estimate / Order

- 책 정보 요약
- 예상 가격
- 배송지 입력
- 주문 완료

## Game Data Autofill

이 서비스에서 더 중요한 자동화는 `경기 정보 자동 보강`이다.

### Why It Matters

사용자가 매번 직접 입력해야 한다면 일지 작성의 진입장벽이 높다.

하지만 아래 정보가 자동으로 채워지면 기록 작성은 훨씬 쉬워진다.

- 날짜
- 응원팀 / 상대팀
- 스코어
- 승/패
- 구장

### Planned Strategy

첫 버전은 외부 데이터에 완전 의존하지 않는다.

1. 레포에 데모용 경기 데이터 JSON을 포함한다
2. 백엔드에서 경기 선택 UI를 제공한다
3. 추가 확장으로 공개 KBO 페이지 기반 동기화 모듈을 붙인다

이 전략의 장점:

- 데모 환경이 외부 사이트 상태에 의해 깨지지 않는다
- 추후 자동화 가능성은 보여줄 수 있다
- 초기 MVP는 안정적으로 구현 가능하다

### Caution

2026-04-09 기준, KBO 공식 사이트에는 경기 일정/결과, 게임센터, 기록실 등 공개 페이지가 존재하는 것은 확인했다.

- KBO 메인: <https://www.koreabaseball.com/>
- 게임센터: <https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx>

다만 `크롤링이 허용된다`는 정책 문구 자체는 이번 검토에서 공식 문서로 직접 확인하지 못했다.

따라서 MVP에서는:

- 외부 크롤링을 필수 의존성으로 두지 않고
- 공개 페이지 기반 동기화는 확장 가능성으로 취급하며
- 실제 구현 시에는 robots.txt, 이용약관, 요청 빈도 제한을 별도 점검한다

## Sweetbook API Role

Sweetbook API는 기록을 책으로 전환하고 주문 처리하는 인프라다.

### Required APIs

- `POST /books`
- `POST /books/{bookUid}/cover`
- `POST /books/{bookUid}/contents`
- `POST /books/{bookUid}/finalization`
- `POST /orders/estimate`
- `POST /orders`

### Supporting APIs

- `GET /book-specs`
- `GET /templates`
- `POST /books/{bookUid}/photos`
- `GET /credits`

### Planned Flow

1. 백엔드가 책 스펙과 템플릿을 선택한다
2. 시즌북 draft를 생성한다
3. 표지와 경기별 페이지를 채운다
4. 최종화한다
5. 견적을 가져온다
6. 주문을 생성한다

## Why Sweetbook API Is Necessary

이 서비스는 기록만으로도 존재 가치가 있지만, `한 시즌의 기억을 실물로 보관할 수 있다`는 순간 제품 경험이 완성된다.

Sweetbook API는 이 마지막 단계를 자동화한다.

- 책 생성
- 견적 계산
- 주문 생성
- 추후 배송/상태 관리 확장 가능

즉, 베이스북은 팬 경험을 만들고, Sweetbook는 그 경험을 물리적 결과물로 마무리한다.

## Data Model

### DiaryEntry

- `id`
- `date`
- `favoriteTeam`
- `opponentTeam`
- `scoreFor`
- `scoreAgainst`
- `result`
- `watchType`
- `stadium`
- `seat`
- `playerOfTheDay`
- `highlight`
- `rawMemo`
- `photos`

### SeasonBookProject

- `id`
- `seasonYear`
- `title`
- `coverPhoto`
- `introText`
- `selectedEntryIds`
- `sweetbookBookUid`
- `estimate`
- `orderUid`

## Dummy Content Plan

처음 접속한 사용자가 서비스 흐름을 바로 이해할 수 있도록 실행 직후 확인 가능한 더미 콘텐츠가 필요하다.

샘플 데이터 구성:

- 한 명의 팬 계정
- 한 시즌 일부인 8~12경기 기록
- 직관 사진과 집관 기록 혼합
- 응원팀 중심의 누적 기록
- 경기 메타데이터 포함

이 더미 데이터 덕분에 사용자는 로그인 없이도 서비스 흐름과 시즌북 생성 과정을 바로 볼 수 있다.

## Business Potential

이 서비스는 단순 포토북 판매가 아니라 `팬 경험의 프리미엄화`를 노린다.

확장 가능성:

- 시즌 종료 기념 한정판 책
- 플레이오프 특집북
- 친구/커플 공동 응원 기록
- 팀별 팬 커뮤니티 확장
- 향후 경기 데이터 자동 연동
- 경기 후 자동 리마인드
- 팀별 시즌 통계 요약

핵심 수익 모델:

- 시즌북 주문
- 특별 에디션 책

## Main Risk

가장 큰 위험은 서비스가 `야구 데이터 앱`처럼 보이거나 `야구 테마 포토북 편집기`처럼 보이는 것이다.

따라서 MVP 전반에서 계속 지켜야 할 원칙은 다음과 같다.

- 중심은 경기 결과가 아니라 경기 경험
- 중심은 편집이 아니라 기록
- 외부 경기 데이터는 보조 정보이지 서비스 본체가 아니다

## Next Steps

1. 첫 버전의 페이지 목록 확정
2. 입력 필드 최소화
3. 샘플 경기 기록 + 경기 메타데이터 데이터셋 작성
4. 경기 선택 / 자동 채움 UX 확정
5. Sweetbook Sandbox에서 실제 템플릿/책 스펙 확인
6. 시즌북 페이지 구성 규칙 확정
