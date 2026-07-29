# 최애의 포토 - Backend

디지털 포토카드를 직접 만들고, 포인트로 구매하거나 다른 사용자와 교환할 수 있는 **최애의 포토** 서비스의 백엔드 레포지토리입니다.

## 주요 기능

- 이메일 회원가입·로그인·로그아웃
- Access Token 및 Refresh Token 기반 인증
- Google OAuth 로그인
- 포토카드 생성 및 이미지 업로드
- 사용자 보유 포토카드 조회
- 마켓 판매글 등록·조회·수정·삭제
- 포토카드 구매와 포인트 정산
- 포토카드 교환 제안·승인·거절·취소
- 랜덤 포인트 뽑기
- 알림 목록 조회 및 읽음 처리
- SSE 기반 실시간 알림

## 기술 스택

- Node.js
- Express 5
- Prisma 6
- PostgreSQL
- Passport
- JSON Web Token
- bcrypt
- Node.js `crypto`
- Zod
- Swagger
- Cloudinary
- Server-Sent Events

## 로컬 개발 환경 설정

### 1. 레포지토리 클론 및 패키지 설치

```bash
git clone <BACKEND_REPOSITORY_URL>
cd 13-favorite-photo-4-BE
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해 `.env`를 생성합니다.

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL="postgresql://사용자명:비밀번호@localhost:5432/favorite_photo?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# CORS
CLIENT_URL=http://localhost:3000

# Cloudinary
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=

# 포인트 뽑기 간격: 분 단위
POINT_DRAW_INTERVAL_MINUTES=5
```

> `.env`에는 실제 비밀값을 입력하고 Git에 커밋하지 않습니다.

### 3. Prisma 설정

Prisma Client를 생성하고 로컬 데이터베이스에 마이그레이션을 적용합니다.

```bash
npm run build
npm run db:migrate
```

시드 데이터가 필요한 경우 실행합니다.

```bash
npm run seed
```

Prisma Studio로 데이터를 확인할 수 있습니다.

```bash
npm run studio
```

### 4. 개발 서버 실행

```bash
npm run dev
```

기본 서버 주소:

```text
http://localhost:3001
```

서버 실행 후 루트 경로에서 API 서버의 동작 여부를 확인할 수 있습니다.

```http
GET http://localhost:3001/
```

## API 문서

서버 실행 후 Swagger UI에서 요청·응답 계약을 확인합니다.

```text
http://localhost:3001/api-docs
```

배포 환경에서는 실제 백엔드 주소 뒤에 `/api-docs`를 붙여 확인합니다.

## 인증 구조

### Access Token

- 로그인·회원가입 성공 응답 body에 포함됩니다.
- 보호된 API 요청에서 Bearer Token으로 전달합니다.
- 인증에 필요한 최소 식별 정보만 payload에 포함합니다.

```http
Authorization: Bearer <accessToken>
```

### Refresh Token

- HttpOnly 쿠키로 전달합니다.
- 데이터베이스에는 원본 토큰이 아닌 SHA-256 해시를 저장합니다.
- 재발급 요청 시 쿠키의 토큰을 해싱하여 저장된 값과 비교합니다.
- 재발급 성공 시 Access Token과 Refresh Token을 모두 새로 발급하고 저장값을 교체합니다.
- 로그아웃 시 저장된 Refresh Token을 제거하고 쿠키를 삭제합니다.

```http
POST /auth/refresh-token
Cookie: refreshToken=<refreshToken>
```

## 이미지 업로드

포토카드 이미지는 서버의 로컬 파일 시스템이 아닌 Cloudinary에 저장합니다.

```text
클라이언트 파일 업로드
→ Cloudinary 저장
→ 이미지 URL 반환
→ PhotoCard의 imageUrl에 URL 저장
```

배포 후 서버 인스턴스가 재시작되어도 Cloudinary에 저장된 이미지는 유지됩니다.

## 실시간 알림

알림은 데이터베이스에 저장하며, 연결 중인 사용자에게는 SSE로 실시간 전달합니다.

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

주요 알림 대상은 다음과 같습니다.

- 교환 제안 도착
- 교환 제안 승인 또는 거절
- 포토카드 구매 완료
- 판매자의 포토카드 판매 완료
- 판매 수량 소진에 따른 품절

알림 생성은 클라이언트가 직접 요청하지 않고, 구매·교환 등 실제 비즈니스 작업을 처리하는 서비스에서 수행합니다.

## 레이어 구조

도메인별 Layered Architecture를 적용합니다.

```text
Route
→ Controller
→ Service
→ Repository
→ Prisma
```

| 레이어 | 역할 |
| --- | --- |
| Route | 엔드포인트 정의와 미들웨어 연결 |
| Controller | 요청값·응답값 처리와 서비스 호출 |
| Service | 비즈니스 규칙과 트랜잭션 처리 |
| Repository | Prisma를 이용한 데이터 접근 |
| Schema | Zod 요청 데이터 검증 |

## 폴더 구조

```text
13-favorite-photo-4-BE/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
├── http/
│   ├── auth.http
│   ├── exchange-proposal.http
│   ├── market-posting.http
│   ├── notification.http
│   ├── photo-card.http
│   ├── point-draw.http
│   └── user.http
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   ├── seed-data/
│   ├── seeds/
│   └── seed.js
├── src/
│   ├── common/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── passport.js
│   │   ├── prisma.js
│   │   └── swagger.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── exchange-proposal/
│   │   ├── market-posting/
│   │   ├── photo-card/
│   │   ├── point-draw/
│   │   └── user/
│   ├── routes/
│   │   └── index.js
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## 주요 API

### Auth

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/auth/signup` | 회원가입 |
| POST | `/auth/login` | 로그인 |
| POST | `/auth/refresh-token` | Access Token 재발급 |
| POST | `/auth/logout` | 로그아웃 |
| GET | `/auth/google/login` | Google OAuth 로그인 시작 |
| GET | `/auth/google/callback` | Google OAuth 콜백 |

### User

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/users/me` | 내 정보 조회 |
| GET | `/users/me/inventories` | 내 보유 포토카드 조회 |
| GET | `/users/me/market-postings` | 내 판매글 조회 |
| GET | `/users/me/exchange-proposals` | 내가 보낸 교환 제안 조회 |
| GET | `/users/me/notifications` | 내 알림 목록 조회 |
| PATCH | `/users/me/notifications/:notificationId` | 알림 읽음 처리 |
| GET | `/users/me/notifications/subscribe` | SSE 알림 구독 |

### Photo Card

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/photo-cards` | 포토카드 생성 |

### Market Posting

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/market-postings` | 판매글 등록 |
| GET | `/market-postings` | 판매글 목록 조회 |
| GET | `/market-postings/:marketPostingId` | 판매글 상세 조회 |
| PATCH | `/market-postings/:marketPostingId` | 판매글 수정 |
| DELETE | `/market-postings/:marketPostingId` | 판매글 내리기 |
| POST | `/market-postings/:marketPostingId` | 포토카드 구매 |
| POST | `/market-postings/:marketPostingId/exchange-proposals` | 교환 제안 생성 |
| GET | `/market-postings/:marketPostingId/exchange-proposals` | 받은 교환 제안 조회 |

### Exchange Proposal

| Method | Endpoint | 설명 |
| --- | --- | --- |
| PATCH | `/exchange-proposals/:exchangeProposalId` | 교환 제안 승인·거절·취소 |

### Point Draw

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/point-draws` | 뽑기 가능 여부와 남은 시간 조회 |
| POST | `/point-draws` | 랜덤 포인트 뽑기 |

> 세부 query, body, 응답 형식과 상태 코드는 Swagger 문서를 기준으로 확인합니다.

## npm 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | nodemon으로 개발 서버 실행 |
| `npm start` | 프로덕션 모드 서버 실행 |
| `npm run build` | Prisma Client 생성 |
| `npm run seed` | 시드 데이터 생성 |
| `npm run db:migrate` | 로컬 개발 마이그레이션 실행 |
| `npm run db:deploy` | 운영 마이그레이션 적용 |
| `npm run studio` | Prisma Studio 실행 |

## REST Client 테스트

`http/` 폴더의 요청 파일을 이용해 주요 API를 순서대로 확인할 수 있습니다.

```text
http/auth.http
http/user.http
http/photo-card.http
http/market-posting.http
http/exchange-proposal.http
http/point-draw.http
http/notification.http
```

인증 기능은 다음 흐름을 확인합니다.

```text
회원가입 또는 로그인
→ Access Token으로 보호 API 요청
→ Refresh Token으로 재발급
→ 새 Refresh Token으로 다시 재발급
→ 로그아웃
→ 로그아웃 이후 재발급 실패 확인
```

## Git 작업 절차

1. 작업 전에 GitHub Issue를 생성하고 담당자를 지정합니다.
2. `dev` 브랜치를 기준으로 작업 브랜치를 생성합니다.
3. 작업 완료 후 최신 `upstream/dev`를 현재 브랜치에 반영합니다.
4. 구문 검사와 해당 API의 REST Client 테스트를 수행합니다.
5. Issue를 연결한 Pull Request를 생성합니다.
6. 리뷰를 반영한 뒤 `dev` 브랜치에 병합합니다.

```bash
git fetch upstream
git rebase upstream/dev
git push
```

충돌 해결 후 이미 원격에 올린 커밋을 다시 정리했다면 팀 규칙에 따라 안전한 강제 푸시 방법을 사용합니다.

## 배포

운영 환경에서는 개발용 마이그레이션 명령이 아닌 배포용 명령을 사용합니다.

```bash
npm run build
npm run db:deploy
npm start
```

배포 플랫폼에는 다음 값을 등록해야 합니다.

- PostgreSQL `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- 운영 프론트엔드 `CLIENT_URL`
- Google OAuth 환경변수
- Cloudinary 환경변수
- `POINT_DRAW_INTERVAL_MINUTES`
- `NODE_ENV=production`

## 배포 전 확인 사항

- Prisma Client 생성 성공
- 운영 migration 적용 성공
- 모든 필수 환경변수 등록
- 운영 프론트엔드 Origin의 CORS 허용
- 회원가입·로그인·재발급·로그아웃 흐름 확인
- 포토카드 이미지 업로드와 URL 조회 확인
- 구매·교환 트랜잭션 확인
- 알림 DB 저장 확인
- SSE 실시간 수신 확인
- Swagger 문서 접근 확인

## 프로젝트 규칙

- `.env`는 커밋하지 않습니다.
- Prisma 스키마를 수정하면 migration 파일도 함께 커밋합니다.
- 운영 환경에서는 `prisma migrate dev`를 사용하지 않습니다.
- 비밀번호는 bcrypt 해시로만 저장합니다.
- Refresh Token 원문은 데이터베이스에 저장하지 않습니다.
- 보호 API는 `Authorization: Bearer <accessToken>` 형식을 사용합니다.
- 민감한 사용자 데이터는 API 응답에서 제외합니다.
- 알림 생성 API는 외부에 공개하지 않습니다.
