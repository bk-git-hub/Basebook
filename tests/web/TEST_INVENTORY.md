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
  - 시즌 대시보드는 요약 숫자, 최근 기록 링크, empty/error state가 핵심이다.
  - 이 화면은 데이터 구조와 문구 변경의 영향을 자주 받으므로 가장 기본적인 상태 렌더링을 빠르게 고정해둘 필요가 있다.
- 핵심 검증:
  - summary 숫자와 `최근 기록` heading이 보이는지
  - 최근 기록 카드 링크가 올바른 상세 주소를 가리키는지
  - empty state와 error state가 운영자 친화적인 안내 문구를 보여주는지
- 이 테스트가 통과하면 보증할 수 있는 것:
  - 대시보드 컴포넌트가 계약 형태의 데이터를 받아 핵심 UI를 그린다.
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
  - 새 기록 작성은 validation, payload 생성, 성공 후 이동까지 UI 의사결정이 많다.
  - 이 흐름은 프론트 단에서 가장 자주 깨질 수 있는 폼 로직이라 빠른 회귀망이 필요하다.
- 핵심 검증:
  - 빈 제출 시 `한 줄 감상은 비워둘 수 없습니다.` validation이 뜨는지
  - 정상 입력 후 `createEntry` 호출 payload에 바뀐 값이 포함되는지
  - 생성 성공 후 상세 화면 경로로 이동하는지
- 이 테스트가 통과하면 보증할 수 있는 것:
  - 생성 폼의 핵심 validation과 payload mapping이 유지된다.
  - 성공 시 프론트가 적절한 상세 페이지로 이동한다.
- 이 테스트만으로는 보증하지 못하는 것:
  - 실제 파일 업로드
  - 실제 `GET /games` 후보 조회
  - 실제 백엔드 생성 성공/실패

## `src/unit/entry-edit-form.test.tsx`

- 타입: Vitest component smoke
- 존재 이유:
  - 수정 폼은 "아무것도 안 바꾸면 PATCH를 보내지 않는다"와 "바뀐 필드만 보낸다"가 핵심 규칙이다.
  - 이 규칙이 깨지면 불필요한 요청이나 데이터 오염이 생길 수 있다.
- 핵심 검증:
  - 변경 없는 저장 시 안내 문구만 보이고 요청이 나가지 않는지
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
  - 가장 기본적인 라우트 진입 smoke를 하나라도 두어 빌드/렌더링 깨짐을 빨리 감지하려고 작성했다.
- 핵심 검증:
  - `/entries/new` 진입
  - `오늘의 직관 기록을 남겨보세요` heading 렌더링
  - `새 기록 저장` 버튼과 `시즌 대시보드로 돌아가기` 링크 렌더링
- 이 테스트가 통과하면 보증할 수 있는 것:
  - production build + start 기준으로 최소 라우트 셸은 정상 렌더링된다.
- 이 테스트만으로는 보증하지 못하는 것:
  - 생성 API
  - 경기 후보 조회
  - 사진 업로드
  - 실제 저장 후 이동

## `scripts/qa-api-server.cjs`

- 타입: QA helper script
- 존재 이유:
  - 통합 리포트가 기존 dev 서버 유무에 의존하면 재현성이 떨어진다.
  - 그래서 compiled API를 QA 전용으로 올리는 작은 부트 스크립트를 분리했다.
- 핵심 역할:
  - API를 `127.0.0.1:4000`에서 띄운다.
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
  - `POST /uploads/image`
  - `/season-book/new`에서 기록 선택과 견적 생성
  - `POST /season-books/estimate`
  - `/order/[projectId]`에서 배송지 입력과 주문 접수
  - `POST /season-books/order`
  - 완료 화면의 `CONFIRMED`, `ORDERED` 표시
- 산출물:
  - PNG 스크린샷
  - Markdown 리포트
  - PDF 리포트
  - 실행 로그
- 이 스크립트가 통과하면 보증할 수 있는 것:
  - 로컬 happy path 기준 프론트-백 연결이 실제로 이어진다.
  - 발표나 handoff에 쓸 수 있는 시각적 증거가 남는다.
- 이 스크립트만으로는 보증하지 못하는 것:
  - 모든 실패 케이스
  - 주문 진행 상태 조회
  - 주문 취소, 배송지 변경
  - 외부 서비스의 실주문 production 검증

## `playwright.config.ts`

- 타입: test runner configuration
- 존재 이유:
  - Playwright가 `tests/web`에서 `apps/web`를 production build 기준으로 실행하게 만든다.
  - smoke test를 실제 배포에 가까운 조건에서 돌리기 위한 설정이다.
- 핵심 역할:
  - `src/e2e`를 테스트 루트로 사용
  - Chromium 프로젝트 사용
  - `baseURL`과 `webServer` 지정

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
