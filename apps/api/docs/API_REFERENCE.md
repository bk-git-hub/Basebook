# Basebook API Reference

## Health

### `GET /health`

- 용도: API 서버 상태 확인
- 응답: `{ "ok": true, "service": "basebook-api" }`

## Games

### `GET /games`

- 용도: 경기 후보 목록 조회
- 주요 query:
  - `favoriteTeam`
  - `seasonYear`
- 응답: `GetGamesResponse`

## Entries

### `GET /entries`

- 용도: 샘플 사용자의 경기 일지 목록과 시즌 요약 조회
- 응답: `GetEntriesResponse`

### `GET /entries/:id`

- 용도: 경기 일지 상세 조회
- 응답: `GetEntryResponse`

### `POST /entries`

- 용도: 경기 일지 생성
- body: `CreateEntryRequest`
- 응답: `GetEntryResponse`

### `PATCH /entries/:id`

- 용도: 경기 일지 수정
- body: `UpdateEntryRequest`
- 응답: `GetEntryResponse`

### `DELETE /entries/:id`

- 용도: 경기 일지 삭제
- 응답: 삭제된 `GetEntryResponse`

## Uploads

### `POST /uploads/image`

- 용도: 경기 일지에 첨부할 이미지 업로드
- body: multipart form-data의 `file`
- 응답: `UploadImageResponse`

### `GET /uploads/local/:fileName`

- 용도: 로컬 저장소에 업로드된 이미지 조회
