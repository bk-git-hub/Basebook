# Basebook Frontend Functional Spec

## 소유 범위

- `apps/web/**`

프론트는 사용자 화면과 상호작용을 책임진다.

프론트가 하지 않는 일:

- Sweetbook SDK 직접 호출
- DB 접근
- 경기 데이터 원본 가공
- 주문 파이프라인 orchestration

## 핵심 원칙

1. 프론트는 `packages/contracts` 기준으로만 API를 사용한다
2. API가 없더라도 mock 데이터로 화면 개발이 가능해야 한다
3. 디자인 꾸미기보다 해피패스 완성이 우선이다
4. 프론트는 상태를 보여주고, 비즈니스 규칙은 서버에 위임한다
5. 인증이 붙더라도 화면 구조를 크게 뒤엎지 않게 설계한다

## 확장 원칙

현재 MVP에는 회원가입/로그인 UI를 넣지 않는다.

대신 아래를 전제로 구조를 잡는다.

1. 기록 작성, 시즌북 생성, 주문은 추후 로그인 보호가 가능해야 한다
2. 운영자 화면은 일반 사용자 화면과 분리된 `/ops/*` 경로를 사용한다
3. 현재는 `demo user` 기준으로 동작해도, 나중에 실제 사용자 세션을 붙일 수 있어야 한다

## 화면 목록

### 1. Landing / Season Entry

경로:

- `/`

역할:

- 서비스 소개
- 데모 진입
- 시즌 홈으로 이동

필수 요소:

- 서비스 이름
- 한 줄 설명
- 데모 시작 CTA

### 2. Season Dashboard

경로:

- `/season`

역할:

- 시즌 요약 표시
- 최근 기록 표시
- 새 기록 작성 진입
- 시즌북 생성 진입

필수 요소:

- 응원팀 정보
- 경기 수
- 승/패/무 집계
- 최근 기록 리스트

필수 API:

- `GET /entries`

### 3. Entry Editor

경로:

- `/entries/new`

역할:

- 경기 선택
- 자동 채워진 경기 정보 확인
- 감상/사진 입력
- 일지 저장

필수 요소:

- 날짜 입력
- 응원팀 선택
- 경기 후보 리스트
- highlight 입력
- rawMemo 입력
- 사진 업로드
- 저장 버튼

필수 API:

- `GET /games`
- `POST /uploads/image`
- `POST /entries`

### 4. Entry Detail

경로:

- `/entries/[id]`

역할:

- 일지 상세 조회
- 수정 진입

필수 요소:

- 경기 정보
- 메모
- 사진
- 수정 버튼

필수 API:

- `GET /entries/:id`

### 5. Entry Edit

경로:

- `/entries/[id]/edit`

역할:

- 기존 일지 수정

필수 API:

- `GET /entries/:id`
- `PATCH /entries/:id`

### 6. Season Book Builder

경로:

- `/season-book/new`

역할:

- 시즌북 포함 경기 선택
- 책 제목 입력
- 표지 사진 선택
- 소개 문구 입력
- 견적 요청

필수 요소:

- 선택 가능한 경기 목록
- 선택 상태
- title 입력
- coverPhoto 선택
- introText 입력

필수 API:

- `GET /entries`
- `POST /season-books/estimate`

### 7. Order Page

경로:

- `/order/[projectId]`

역할:

- 견적 확인
- 배송지 입력
- 주문 생성

필수 요소:

- pageCount
- totalPrice
- 주소 입력 폼
- 주문 버튼

필수 API:

- `POST /season-books/order`

### 8. Reserved Auth Surfaces

경로:

- `/login`
- `/signup`

현재 상태:

- MVP에서는 만들지 않음

확장 의도:

- 기록 작성/주문 화면 진입 전 로그인 유도 가능

### 9. Reserved Ops Surface

경로:

- `/ops/projects`

현재 상태:

- MVP에서는 필수 아님

확장 의도:

- 시즌북 프로젝트 목록
- 주문 상태 확인
- 운영자용 조회 화면

## 기능 단위 구현 순서

### Phase F1. 앱 셸

- 기본 레이아웃
- 페이지 라우트 생성
- 임시 네비게이션
- mock client 준비

완료 기준:

- 모든 핵심 페이지가 빈 상태라도 진입 가능

### Phase F2. 경기 선택과 자동 채움 UI

- 날짜/응원팀 입력
- 경기 후보 리스트
- 선택 시 폼 자동 채움

완료 기준:

- mock 데이터 기준으로 경기 선택 UX가 동작

### Phase F3. 일지 작성 UI

- 입력 필드 연결
- 이미지 업로드 UX
- 저장 성공/실패 처리

완료 기준:

- mock 또는 실제 API 기준으로 일지 저장 가능

### Phase F4. 대시보드와 상세 화면

- 최근 기록 리스트
- 시즌 요약
- 상세 페이지

완료 기준:

- 대시보드에서 상세로 이동 가능

### Phase F5. 시즌북 생성 UI

- 경기 선택
- 제목/표지/소개 문구 입력
- 견적 확인

완료 기준:

- 선택한 기록들로 estimate 요청 가능

### Phase F6. 주문 UI

- 배송지 폼
- 주문 완료 화면
- 실패 메시지 표시

완료 기준:

- 해피패스 주문까지 연결

### Phase F7. 확장 가능한 auth/ops 구조 정리

- route namespace 예약
- auth session query 훅 자리 확보
- ops 화면 진입 경로 분리

완료 기준:

- 인증이 붙어도 기존 사용자 화면 경로가 크게 흔들리지 않음

## 프론트에서 먼저 mock 해야 하는 것

- `GET /games`
- `GET /entries`
- `GET /entries/:id`
- `POST /entries`
- `POST /season-books/estimate`
- `POST /season-books/order`
- `GET /auth/session`

## 프론트가 건드리지 말아야 하는 것

- Sweetbook API payload 직접 조립
- 페이지 수 계산
- 업로드 파일명 정책
- 주문 멱등성 키 생성
- 권한 판단 로직

## 완료 정의

프론트 MVP 완료 기준:

- 모든 핵심 페이지가 존재한다
- 기록 작성 해피패스가 된다
- 시즌북 생성 해피패스가 된다
- 주문 해피패스가 된다
- 로딩 / 에러 / 빈 상태가 최소한 존재한다
- 추후 `/login`, `/signup`, `/ops/*`를 붙일 수 있는 경로 구조가 확보된다
