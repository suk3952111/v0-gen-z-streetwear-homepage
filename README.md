# VIBE CHECK

Gen-Z 스트릿웨어 콘셉트의 Next.js 16 기반 쇼핑 프로젝트입니다.

## 핵심 정보

- 프레임워크: Next.js 16 + React 19 + TypeScript
- 스타일: Tailwind CSS 4
- 백엔드: Supabase (Auth + Database + Storage)
- 다국어: EN/KR 메시지 구조

## 주요 페이지

- `/` 홈
- `/shop` 상품 목록
- `/product/[id]` 상품 상세
- `/cart` 장바구니
- `/wishlist` 위시리스트
- `/login` 로그인/회원가입
- `/account` 계정
- `/admin` 관리자
- `/about`, `/shipping`, `/returns`, `/contact`, `/privacy`, `/terms`
- `/forgot-password`, `/signup`

## 실행 방법

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속

## 환경 변수

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

## Supabase 마이그레이션

- `supabase/migrations/20260221_init_schema.sql`
- `supabase/migrations/20260302_product_image_caption_embedding_search.sql`
- `supabase/migrations/20260315_fix_orders_rls_recursion.sql`
- `supabase/migrations/20260316_newsletter_subscribers.sql`

## 현재 구현 상태

- 인증(로그인/회원가입): Supabase Auth 연동
- 리뷰: Supabase 조회/서버 정렬/등록(이미지 포함) 연동
- 마이페이지(Account): 프로필/배송지 CRUD/주문 목록 연동
- 관리자(Admin): 대시보드 통계 + 주문 페이징 조회 연동
- 체크아웃: 주문 생성 + 결제/주문 상태 갱신 + 장바구니 비우기 연동
- AI 비주얼 검색: 이미지 업로드 후 임베딩 + 태그 기반 Supabase 검색 연동
- Placeholder 링크/동작: 실제 라우트 및 뉴스레터 제출 연동
- 타입: `database.types.ts` 실스키마 반영 완료 (`as any` 제거)

## 남은 주요 작업

- 상품 상세 단건 조회를 mock에서 Supabase 완전 전환
- 상품 상세의 유사 상품 추천 로직을 Supabase 쿼리 기반으로 전환
