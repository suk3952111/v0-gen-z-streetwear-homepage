# VIBE CHECK

## 프로젝트 한 줄 소개
Gen-Z 스트릿웨어 쇼핑 경험에 AI 스타일 탐색을 결합해, 사용자에게는 빠르고 직관적인 탐색-구매 흐름을 제공하고 운영자에게는 상품/주문/재고를 통합 관리할 수 있게 만든 반응형 커머스 웹 서비스입니다.

## 프로젝트 개요
- 콘셉트: 스트릿웨어 브랜드 온라인 스토어 + 스타일 큐레이션
- 개발 기간(리포지토리 기준): 2026-02-21 ~ 2026-03-19
- 목표: 탐색, 구매, 계정 관리, 운영 관리를 하나의 제품 경험으로 통합
- 주요 사용자:
  - 고객: 상품 탐색, 위시리스트/장바구니, 체크아웃
  - 회원: 계정/배송지/주문 이력 관리
  - 관리자: 주문/상품/재고/활동 로그 운영

## 기술 스택
- Frontend: Next.js 16(App Router), React 19, TypeScript
- Styling/UI: Tailwind CSS 4, Radix UI, Framer Motion
- Backend: Next.js Server Actions, Supabase SSR Client
- Database: PostgreSQL(Supabase), pgvector, pg_trgm
- Auth/Storage: Supabase Auth, Supabase Storage
- Test: Playwright E2E
- Infra/Etc: Vercel Analytics, pnpm

## 핵심 기능
### 쇼핑 경험
- 홈/샵/상세 페이지 중심의 상품 탐색
- 카테고리/브랜드/태그/검색 기반 필터링
- 장바구니/위시리스트 플로우와 구매 전환 동선 연결

### 주문/결제 플로우
- 장바구니 기준 주문 생성
- 로그인 필요, 기본 배송지 설정 여부 검증
- 주문 생성 후 주문 상태/결제 상태 갱신 및 주문 이력 반영

### 계정 기능
- Supabase Auth 기반 로그인/회원가입/로그아웃
- 마이페이지 프로필 수정(이름/전화/아바타)
- 배송지 CRUD 및 기본 배송지 지정
- 회원 주문 목록 조회

### 리뷰/콘텐츠
- 상품 리뷰 조회/정렬
- 텍스트/이미지 리뷰 등록
- 푸터 뉴스레터 구독 연동

### AI 스타일 기능
- 이미지 업로드 기반 스타일 검색
- 임베딩/태그 기반 상품 매칭
- 유사 스타일 추천 액션 분리(확장 가능한 구조)

### 관리자 기능
- 관리자 권한 보호 라우팅(`/admin`)
- 대시보드 통계/주문 목록
- 상품 생성/소프트 삭제
- 재고 증감 조정
- 운영 활동 로그 기록/조회

## 라우트 맵
- 고객 영역: `/`, `/shop`, `/product/[id]`, `/cart`, `/wishlist`
- 계정 영역: `/login`, `/signup`, `/forgot-password`, `/account`
- 운영 영역: `/admin`
- 정보 영역: `/about`, `/shipping`, `/returns`, `/contact`, `/privacy`, `/terms`
- 인증 콜백: `/auth/callback`

## 프로젝트 구조
```txt
src/
  app/                 # Next.js App Router 페이지
  features/
    products/          # 상품/리뷰/AI 스타일 탐색
    cart/              # 장바구니/체크아웃
    wishlist/          # 위시리스트
    users/             # 인증/계정
    admin/             # 관리자 대시보드/카탈로그/재고
  lib/
    supabase/          # browser/server/admin client
  types/
    database.types.ts  # Supabase 스키마 기반 타입
supabase/
  migrations/          # 스키마 및 성능/정책 마이그레이션
e2e/                   # Playwright E2E 시나리오
docs/                  # 개발 문서 및 TODO
```

## 시작하기
### 1) 의존성 설치
```bash
pnpm install
```

### 2) 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 채워주세요.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
ENABLE_EMBEDDING_BACKFILL=false
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
```

### 3) 개발 서버 실행
```bash
pnpm dev
```

## 스크립트
- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 빌드 결과 실행
- `pnpm lint`: ESLint 실행
- `pnpm test:e2e`: Playwright E2E
- `pnpm test:e2e:ui`: Playwright UI 모드
- `pnpm test:e2e:headed`: 브라우저 가시 모드 E2E

## 데이터베이스/마이그레이션
- 스키마 정의: `supabase/migrations/20260221_init_schema.sql`
- 이후 마이그레이션:
  - `20260302_product_image_caption_embedding_search.sql`
  - `20260315_fix_orders_rls_recursion.sql`
  - `20260316_newsletter_subscribers.sql`
  - `20260318_shop_search_performance.sql`

Supabase CLI를 사용하는 경우(프로젝트 링크 후) 마이그레이션 반영 예시:
```bash
npx supabase db push --yes
```

## 테스트
- E2E 시나리오:
  - `e2e/home.smoke.spec.ts`
  - `e2e/navigation-and-cart.spec.ts`
  - `e2e/auth-and-shop.spec.ts`

실행:
```bash
pnpm test:e2e
```

## 현재 상태와 개선 포인트
- 완료:
  - 핵심 커머스 플로우(탐색/장바구니/주문/계정/관리자) 연동
  - Supabase 기반 인증/권한/RLS/타입 구조 반영
  - AI 비주얼 검색 및 검색 성능 인덱스 적용
- 개선 예정:
  - 결제 게이트웨이 실연동 및 후속 상태 동기화 고도화
  - 타입 안정성 강화(`next.config.mjs`의 `ignoreBuildErrors` 제거)
  - 관리자 리포팅/분석 기능 확장
