# Web QA Test Inventory

이 문서는 `tests/web` 안에 있는 테스트 코드와 운영 스크립트가 각각 왜 존재하는지 설명한다. 발표나 handoff 때는 이 문서를 기준으로 "무슨 이유로 작성됐고 무엇을 보증하는가"를 설명하면 된다.

## `src/fixtures/entries.ts`

- 타입: fixture helper
- 존재 이유:
  - 시즌 대시보드, 상세, 수정 폼 테스트에서 반복되는 entry payload를 매번 손으로 쓰지 않기 위해 만들었다.
  - 계약 형태가 바뀌면 fixture가 먼저 깨지므로, 테스트 입력의 기준점 역할을 한다.
- 보증하는 것:
  - 단위 테스트가 항상 동일한 shape의 `DiaryEntry`, `GetEntriesResponse`, `GetEntryResponse`를 사용한다.
- 보증하지 않는 것:
  - 실제 API 응답 내용
  - 실제 DB 데이터 정합성

## `src/setup/vitest.setup.tsx`

- 타입: test environment setup
- 존재 이유:
  - JSDOM 환경에서 `next/link`를 직접 쓰면 단위 테스트가 불필요하게 복잡해진다.
  - 그래서 테스트는 링크 이동 로직이 아니라 `href` 결과만 검증하도록 환경을 단순화한다.
- 보증하는 것:
  - 컴포넌트 렌더링과 링크 속성 검증이 안정적으로 수행된다.
- 보증하지 않는 것:
  - Next 라우터의 실제 동작

## `src/unit/season-dashboard.test.tsx`

- 타입: Vitest component smoke
- 존재 이유:
  - 시즌 대시보드는 최신 시즌 기준 요약 카드, 직관 승률, 기록 리스트, empty/error state가 핵심이다.
  - 이 화면은 데이터 구조와 문구 변경의 영향을 자주 받으므로 가장 기본적인 상태 렌더링을 빠르게 고정해둘 필요가 있다.
- 핵심 검증:
  - 최신 시즌 팀 헤더, `직관 승률`, `시즌 기록`, `전체 기록`이 보이는지
  - 최근 기록 카드 링크가 올바른 상세 주소를 가리키는지
  - empty state와 error state가 현재 대시보드 셸의 문구를 보여주는지
- 이 테스트가 통과하면 보증할 수 있는 것:
  - 대시보드 컴포넌트가 최신 시즌 기준으로 핵심 요약 UI를 그린다.
  - 최소한 empty/error UI가 사라지거나 엉뚱한 문구로 바뀌지 않았다.
- 이 테스트만으로는 보증하지 못하는 것:
  - 실제 `GET /entries` 호출 성공 여부
  - 실제 최신 정렬이 서버 응답 기준으로 맞는지 여부

## `src/unit/entry-detail.test.tsx`

- 타입: Vitest component smoke
- 존재 이유:
  - 기록 상세 화면은 사용자가 작성한 감상과 사진 링크를 확인하는 핵심 읽기 화면이다.
  - 수정 버튼과 원본 링크가 잘못되면 다음 흐름 전체가 끊긴다.
- 핵심 검증:
  - 경기 제목, 감상 텍스트가 보이는지
  - `이 기록 수정하기` 링크가 올바른 edit 경로를 가리키는지
  - `원본 열기` 링크가 사진 URL을 그대로 가리키는지
  - 에러 상태 카드가 적절한 안내를 보여주는지
- 이 테스트가 통과하면 보증할 수 있는 것:
  - 상세 payload 표시와 핵심 CTA 구조가 유지된다.
- 이 테스트만으로는 보증하지 못하는 것:
  - 실제 `GET /entries/:id` 404/500 처리
  - 이미지 파일 자체의 유효성

## `src/unit/entry-create-form.test.tsx`

- 타입: Vitest component smoke
- 존재 이유:
  - 새 기록 작성은 모바일 팀 선택, 직관/비직관 분기, validation, 사진 업로드 상태, payload 생성, 성공 후 이동까지 UI 의사결정이 많다.
  - 이 흐름은 프론트 단에서 가장 자주 깨질 수 있는 폼 로직이라 빠른 회귀망이 필요하다.
- 핵심 검증:
  - 기본 결과값이 `미정`이고 고정 경기장 목록이 보이는지
  - 응원 팀과 상대 팀 중복 선택이 막히는지
  - `관람 형태` 변경 시 경기장/좌석 노출과 카피가 맞게 바뀌는지
  - 빈 제출 시 경기장/한 줄 감상 validation이 뜨는지
  - 점수를 한쪽만 입력하면 저장이 막히는지
  - 사진 업로드 중 저장 버튼이 비활성화되고, 업로드 후 개별 제외가 가능한지
  - 정상 입력 후 `createEntry` 호출 payload에 현재 폼 값과 업로드된 사진이 포함되는지
  - 생성 성공 후 상세 화면 경로로 이동하는지
  - 생성 실패 시 에러가 보이고 입력값이 유지되는지
- 이 테스트가 통과하면 보증할 수 있는 것:
  - 생성 폼의 핵심 validation, 모바일 선택 구조, 조건부 필드, payload mapping이 유지된다.
  - 성공 시 프론트가 적절한 상세 페이지로 이동한다.
- 이 테스트만으로는 보증하지 못하는 것:
  - 실제 파일 업로드 네트워크 성공 여부
  - 실제 백엔드 생성 성공/실패

## `src/unit/entry-edit-form.test.tsx`

- 타입: Vitest component smoke
- 존재 이유:
  - 수정 폼은 "아무것도 안 바꾸면 PATCH를 보내지 않는다"와 "바뀐 필드만 보낸다"가 핵심 규칙이다.
  - 이 규칙이 깨지면 불필요한 요청이나 데이터 오염이 생길 수 있다.
- 핵심 검증:
  - 변경 없는 저장 시 요청이 나가지 않고 편집 화면에 그대로 머무는지
  - 감상 한 줄만 수정했을 때 changed field만 PATCH payload에 들어가는지
  - 성공 후 원래 상세 페이지로 돌아가는지
- 이 테스트가 통과하면 보증할 수 있는 것:
  - 수정 폼의 최소 PATCH 전략이 유지된다.
- 이 테스트만으로는 보증하지 못하는 것:
  - 실제 서버 patch merge 결과
  - 사진 변경이나 복합 수정 시나리오

## `src/e2e/entry-create.smoke.spec.ts`

- 타입: Playwright browser smoke
- 존재 이유:
  - 단위 테스트만으로는 production build와 real browser에서 페이지가 실제로 뜨는지 알 수 없다.
  - 가장 기본적인 라우트 진입과 모바일 전용 제어가 실제 브라우저에서 살아 있는지 빨리 감지하려고 작성했다.
- 핵심 검증:
  - `/entries/new` 진입
  - `오늘의 직관 기록을 남겨보세요` heading 렌더링
  - `새 기록 저장` 버튼과 `홈으로 돌아가기` 링크 렌더링
  - 기본 결과값이 `미정`인지
  - 모바일에서 팀 선택이 dropdown으로 보이는지
  - `관람 형태`를 원격 시청으로 바꾸면 경기장/좌석이 사라지는지
- 이 테스트가 통과하면 보증할 수 있는 것:
  - production build + start 기준으로 최소 라우트 셸과 모바일 핵심 제어는 정상 렌더링된다.
- 이 테스트만으로는 보증하지 못하는 것:
  - 생성 API
  - 사진 업로드
  - 실제 저장 후 이동

## `src/e2e/entry-create.local-full-stack.spec.ts`

- 타입: Playwright full-stack smoke
- 존재 이유:
  - 사용자가 가장 자주 체감하는 `/entries/new` 흐름은 단순 렌더링이 아니라 "사진 업로드 -> 기록 저장 -> 상세 진입"까지 이어져야 의미가 있다.
  - 게다가 시험관 기준 검증에서는 배포 서버가 아니라 로컬 API, 로컬 DB, 로컬 업로드 저장소만 써야 하므로 그 조건을 자동화로 고정할 필요가 있었다.
- 핵심 검증:
  - Playwright가 `apps/api`와 `apps/web` production build를 직접 띄우는지
  - 테스트용 `DATABASE_URL`, `UPLOAD_STORAGE_DRIVER=local`이 적용된 API에서 `/uploads/image`가 호출되는지
  - 업로드된 이미지 URL이 `localhost:4000/uploads/local/...` 형태의 로컬 자산인지
  - 업로드한 사진이 `POST /entries` payload 결과와 상세 화면에 그대로 이어지는지
  - 생성 후 `/entries/[id]` 상세 화면과 `GET /entries/:id` 응답이 같은 사진 URL과 감상 문구를 보여주는지
- 이 테스트가 통과하면 보증할 수 있는 것:
  - `/entries/new`는 로컬 풀스택 환경에서도 실제로 저장 가능한 상태다.
  - 테스트 중 배포 DB나 외부 이미지 저장소를 건드리지 않고도 업로드/생성 흐름을 재현할 수 있다.
- 이 테스트만으로는 보증하지 못하는 것:
  - 수정 흐름
  - 주문 흐름
  - 각종 실패 케이스 전체

## `scripts/qa-api-server.cjs`

- 타입: QA helper script
- 존재 이유:
  - 통합 리포트가 기존 dev 서버 유무에 의존하면 재현성이 떨어진다.
  - 그래서 compiled API를 QA 전용으로 올리는 작은 부트 스크립트를 분리했다.
- 핵심 역할:
  - API를 `127.0.0.1:4000`에서 띄운다.
  - 로컬 estimate/order 모드와 로컬 업로드 드라이버를 강제한다.
  - 필요 시 `db:init`을 먼저 수행해 테스트용 DB가 비어 있어도 부팅 가능하게 만든다.
- report script가 독립적으로 API readiness를 기다릴 수 있게 한다.
- 이 스크립트가 있으면 좋은 점:
  - 통합 테스트가 "누가 미리 서버를 띄워놨는가"에 덜 의존한다.

## `scripts/order-flow-report.cjs`

- 타입: scripted Playwright integration
- 존재 이유:
  - 단순 pass/fail 로그만으로는 주문 흐름 검증을 설명하기 어렵다.
  - 실제 happy path를 돌리고, 스크린샷과 PDF 증거를 같이 남기기 위해 만들었다.
- 핵심 검증:
  - API와 웹 production build
  - 로컬 전용 DB / 로컬 업로드 저장소 / 로컬 주문 모드 강제
  - `/season-book/new`에서 기록 선택과 브라우저 기반 커버 이미지 업로드
  - `POST /uploads/image`
  - `POST /season-books/estimate`
  - `/order/[projectId]`에서 배송지 입력과 주문 접수
  - `POST /season-books/order`
  - `/order/[projectId]/status`에서 `주문 확인`, `주문 완료` 표시
- 산출물:
  - PNG 스크린샷
  - Markdown 리포트
  - PDF 리포트
  - 실행 로그
- 이 스크립트가 통과하면 보증할 수 있는 것:
  - 로컬 happy path 기준 프론트-백 연결이 실제로 이어진다.
  - 업로드된 커버가 외부 공개 URL이 아니라 로컬 API 자산 URL이어도 주문 흐름이 이어진다.
  - 발표나 handoff에 쓸 수 있는 시각적 증거가 남는다.
- 이 스크립트만으로는 보증하지 못하는 것:
  - 모든 실패 케이스
  - 주문 취소, 배송지 변경
  - 외부 서비스의 실주문 production 검증

## `playwright.config.ts`

- 타입: test runner configuration
- 존재 이유:
  - Playwright가 `tests/web`에서 `apps/web`를 production build 기준으로 실행하게 만든다.
  - smoke test를 실제 배포에 가까운 조건에서 돌리되, 로컬 Windows 환경에서도 `localhost` 기준으로 안정적으로 뜨게 하기 위한 설정이다.
- 핵심 역할:
  - `src/e2e`를 테스트 루트로 사용
  - Chromium 프로젝트 사용
  - `apps/api`와 `apps/web` production build를 함께 올린다
  - `DATABASE_URL`, `UPLOAD_STORAGE_DRIVER`, 시즌북 모드를 로컬 전용 값으로 강제한다
  - 테스트 결과가 남는 전용 SQLite DB 디렉터리를 준비한 뒤 실행한다

## `vitest.config.ts`

- 타입: test runner configuration
- 존재 이유:
  - `apps/web/src`와 `packages/contracts` 경로 alias를 단위 테스트에서 그대로 쓰기 위함이다.
  - 프론트 컴포넌트 테스트가 실제 import 구조와 최대한 비슷하게 동작하게 한다.
- 핵심 역할:
  - JSDOM 환경 설정
  - setup file 지정
  - alias 경로 연결

## 현재 인벤토리로 설명할 수 있는 QA 메시지

- 이 테스트 셋은 "폼 로직과 링크 구조"를 빠르게 잡는 smoke unit test와, "실제 happy path 증명"을 남기는 Playwright integration을 분리해 운영한다.
- 그래서 테스트가 통과했다는 말의 의미를 레이어별로 나눠 설명할 수 있다.
- 반대로 아직 자동화가 없는 영역도 문서상에서 명확히 구분할 수 있다.
