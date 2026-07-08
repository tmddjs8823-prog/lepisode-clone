# 레피소드(Lepisode) 홈페이지 클론 프로젝트 — 기획서

> **작성일**: 2026-07-07
> **목적**: 벤치마킹 사이트(https://homepage-dev.lepisode.team)를 기반으로 클라이언트 홈페이지 + 관리자 패널을 구축
> **이 문서는 프로젝트의 전체 기획/설계를 담고 있으며, AI 에이전트가 참조할 수 있도록 작성됨**

---

## 1. 기술 스택 (확정)

| 영역 | 기술 |
|------|------|
| **Client (홈페이지)** | Angular 19 (SSR) + SUIT 폰트 |
| **Admin (관리자)** | Angular 19 (SPA) |
| **Backend API** | NestJS + Prisma |
| **Database** | PostgreSQL (Docker, port 5435) |
| **ORM** | Prisma v6 |
| **인증** | JWT (Access Token + bcrypt) |
| **이미지 저장** | Supabase Storage |
| **리치 텍스트 에디터** | TipTap (블로그/공지사항/주간보고서) |
| **다국어** | 한국어 + 영어 + 일본어 (3개국어) |
| **Monorepo** | Nx Workspace |

### 확정 결정 사항

| 항목 | 결정 |
|------|------|
| **DB** | PostgreSQL — Docker 컨테이너로 실행 (port 5435) |
| **이미지 저장소** | Supabase Storage |
| **리치 텍스트 에디터** | TipTap |
| **다국어** | 한국어 + 영어 + 일본어 (3개국어) |
| **크레딧 관리** | 단순 기록용 (결제 연동 없음) |

---

## 2. 관리자 사이드바 메뉴 구조

```
🌐 홈페이지 관리
├── 대시보드
├── 포트폴리오 관리
├── 서비스 소개 관리
├── 지원사업 관리
├── 현황 관리
├── 문의 내역 관리
├── 마케팅 수신동의 관리
├── 인증서 관리
├── 이벤트 관리
├── 팝업 관리
├── 약관 관리
├── 공지사항 관리
├── 채용 관리
├── QR코드 관리
├── FAQ 관리
├── 다국어 관리
├── 회사 소개 관리
├── SEO 관리
└── 기술 블로그 관리

📢 마케팅 업체 관리
└── 업체 목록

👤 사용자 관리
├── 역할 및 권한 관리
├── 메뉴별 권한 관리
└── 사용자 목록

🤖 코디(Cody)
├── 기업 관리
├── 프로젝트 관리
├── 크레딧 관리
├── 알림 관리
└── 주간 보고서 관리
```

---

## 3. DB 스키마 (Prisma 모델 27개)

> 실제 스키마: `prisma/schema.prisma`

### 3.1 시스템 / 인증 (4개)

| 모델 | 설명 | 주요 필드 |
|------|------|----------|
| **AdminUser** | 관리자 계정 | email(unique), password(bcrypt), name, role(SUPER_ADMIN/ADMIN/EDITOR), isActive, lastLoginAt |
| **Role** | 역할 정의 | name(unique), description |
| **MenuPermission** | 메뉴별 권한 정의 | menuKey(unique), menuName, parentKey, sortOrder |
| **RolePermission** | 역할-메뉴 권한 매핑 | roleId(FK), menuId(FK), canRead, canWrite, canDelete |

### 3.2 홈페이지 관리 — 핵심 콘텐츠 (11개)

| 모델 | 설명 | 다국어(ko/en/ja) | 주요 필드 |
|------|------|:---:|----------|
| **Portfolio** | 포트폴리오 | title, description | client, category, period, techStack[], thumbnailUrl, images[], published, sortOrder |
| **Service** | 서비스 소개 | title, description | icon, imageUrl, published, sortOrder |
| **CompanyInfo** | 회사정보 (key-value) | value | key(unique: vision, mission, address 등) |
| **TeamMember** | 팀원 소개 | name, position, bio | profileImageUrl, sortOrder |
| **CompanyHistory** | 연혁 | title, description | year, month, sortOrder |
| **BlogPost** | 기술 블로그 | title, content | thumbnailUrl, category, tags[], viewCount, published |
| **Notice** | 공지사항 | title, content | published, isPinned |
| **FaqCategory** | FAQ 카테고리 | name | sortOrder |
| **Faq** | FAQ 항목 | question, answer | categoryId(FK), published, sortOrder |
| **Inquiry** | 문의 내역 | — | name, email, phone, company, budget, projectType, content, status(PENDING/IN_PROGRESS/COMPLETED/CANCELLED), isRead, adminMemo |
| **JobPosting** | 채용 공고 | title, description | department, type, requirements, benefits, published, deadline |

### 3.3 홈페이지 관리 — 보조 모듈 (8개)

| 모델 | 설명 | 주요 필드 |
|------|------|----------|
| **SupportProject** | 지원사업 | title(다국어), organization, period, description, published, sortOrder |
| **ProjectStatus** | 현황 관리 | projectName, clientName, status(ESTIMATING/IN_PROGRESS/COMPLETE), category, startDate, endDate, published |
| **MarketingConsent** | 마케팅 수신동의 | name, email, phone, isConsented, consentedAt, revokedAt |
| **Certificate** | 인증서 | title(다국어), issuer, issueDate, imageUrl, sortOrder |
| **Event** | 이벤트 | title(다국어), description, imageUrl, linkUrl, startDate, endDate, published |
| **Popup** | 팝업 | title, imageUrl, linkUrl, startDate, endDate, position(CENTER/BOTTOM/FULL), published |
| **Terms** | 약관 | type(SERVICE/PRIVACY/MARKETING, unique), title(다국어), content(다국어) |
| **QrCode** | QR코드 | name, targetUrl, qrImageUrl, scanCount, isActive |

### 3.4 다국어 / SEO (2개)

| 모델 | 설명 | 주요 필드 |
|------|------|----------|
| **Translation** | 다국어 키-값 | key(unique), ko, en, ja |
| **SeoConfig** | 페이지별 SEO | pagePath(unique), title(다국어), description(다국어), keywords, ogImageUrl |

### 3.5 마케팅 업체 (1개)

| 모델 | 설명 | 주요 필드 |
|------|------|----------|
| **MarketingCompany** | 외부 마케팅 업체 | name, contactPerson, phone, email, serviceType, memo, isActive |

### 3.6 코디(Cody) 모듈 (5개)

| 모델 | 설명 | 주요 필드 |
|------|------|----------|
| **CodyCompany** | 기업 관리 | name, businessNumber, ceoName, ceoPhone, address, email, memo |
| **CodyProject** | 프로젝트 관리 | name, status(PENDING/IN_PROGRESS/COMPLETED/ON_HOLD/CANCELLED), companyId(FK), startDate, endDate, description |
| **CodyCredit** | 크레딧 관리 | type(CHARGE/USE/REFUND/ADJUST), companyId(FK), projectId(FK?), description, amount(Decimal 12,0), manager |
| **CodyNotification** | 알림 관리 | status(SENT/PENDING/FAILED/READ), companyId(FK), companyName, content |
| **CodyWeeklyReport** | 주간 보고서 | companyId(FK), projectId(FK), title, periodStart, periodEnd, content |

### 코디 모듈 Admin 화면 컬럼 상세

| 메뉴 | 테이블 컬럼 |
|------|------------|
| 기업관리 | 순번, 기업명, 사업자 등록번호, 대표자명, 대표 연락처, 등록일자 |
| 프로젝트 관리 | 상태, 프로젝트명, 기업, 프로젝트 기간, 등록일자 |
| 크레딧 관리 | 순번, 유형, 기업, 프로젝트, 내용, 금액, 담당자, 등록일자 |
| 알림관리 | 순번, 상태, 기업명, 내용, 등록일자 |
| 주간 보고서 | 기업, 프로젝트, 제목, 기간, 등록일시 |

---

## 4. ER 다이어그램 (핵심 관계)

```
AdminUser ──┐
            │ has
            ▼
         Role ──── RolePermission ──── MenuPermission

FaqCategory ──── Faq (1:N)

CodyCompany ──┬── CodyProject (1:N) ──── CodyWeeklyReport (1:N)
              ├── CodyCredit (1:N) ◄──── CodyProject (N:1, optional)
              └── CodyNotification (1:N)
```

---

## 5. API 엔드포인트 구조 (구현 완료)

### 인증
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/v1/auth/login` | JWT 로그인 | ❌ |
| POST | `/api/v1/auth/seed` | 초기 관리자 생성 | ❌ |
| GET | `/api/v1/auth/profile` | 프로필 조회 | ✅ |

### CRUD 패턴 (각 모듈 공통)
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/v1/{resource}` | 공개 목록 (published=true) | ❌ |
| GET | `/api/v1/{resource}/:id` | 공개 상세 | ❌ |
| GET | `/api/v1/{resource}/admin/list` | 관리자 목록 (전체) | ✅ |
| POST | `/api/v1/{resource}` | 생성 | ✅ |
| PUT | `/api/v1/{resource}/:id` | 수정 | ✅ |
| DELETE | `/api/v1/{resource}/:id` | 삭제 | ✅ |

### 구현 완료된 Resource
- `portfolio`, `services`, `blog`, `notices`, `faq` (+ `faq/categories`), `inquiries`, `jobs`, `company` (info, team, history)

### 초기 관리자 계정
- **Email**: `admin@lepisode.team`
- **Password**: `admin1234`
- **Role**: `SUPER_ADMIN`

---

## 6. 프로젝트 디렉토리 구조

```
lepisode-clone/
├── apps/
│   ├── api/                          # NestJS Backend ✅
│   │   └── src/
│   │       ├── common/types/api.types.ts  # 공통 타입 (Pick/Omit 유틸리티)
│   │       ├── prisma/               # PrismaService + PrismaModule
│   │       └── modules/
│   │           ├── auth/             # JWT (Access+Refresh 듀얼 토큰) ✅
│   │           ├── portfolio/        # 포트폴리오 ✅ (dto/, service, controller, module)
│   │           ├── service/          # 서비스 소개 ✅
│   │           ├── company/          # 회사 소개 ✅
│   │           ├── blog/             # 블로그 ✅
│   │           ├── notice/           # 공지사항 ✅
│   │           ├── faq/              # FAQ + 카테고리 ✅
│   │           ├── inquiry/          # 문의 ✅
│   │           ├── job/              # 채용 ✅
│   │           ├── support/          # 지원사업/현황 ✅
│   │           ├── content/          # 인증서/이벤트/팝업/약관/QR ✅
│   │           ├── marketing/        # 마케팅 동의/업체 ✅
│   │           ├── i18n/             # 번역/SEO ✅
│   │           ├── user/             # 사용자/역할/권한 ✅
│   │           └── cody/             # 코디 (기업/프로젝트/크레딧/알림/보고서) ✅
│   │
│   ├── client/                        # Angular 19 (SSR) — Phase 6
│   │
│   └── admin/                         # Angular 19 (SPA) 🔄 Phase 5 진행 중
│       └── src/app/
│           ├── core/
│           │   ├── config/nav.config.ts   # 사이드바 메뉴 정의
│           │   ├── guards/auth.guard.ts   # authGuard + loginGuard
│           │   ├── interceptors/          # Bearer 자동주입 + 401 refresh
│           │   └── services/
│           │       ├── token.service.ts   # Signal 기반 토큰 관리
│           │       └── auth.service.ts    # 로그인/로그아웃/refresh
│           ├── layout/
│           │   ├── sidebar/               # 접이식 사이드바
│           │   └── shell/                 # 전체 레이아웃
│           └── pages/
│               ├── login/login.page.ts    # 로그인
│               ├── dashboard/             # 대시보드
│               └── ...                    # 각 메뉴 페이지 (stub → CRUD 구현 예정)
│
├── prisma/schema/                     # 모듈별 분리된 Prisma 스키마 (15개 파일)
├── tailwind.config.js                 # Tailwind v3
├── docker-compose.yml
├── .env
└── tsconfig.base.json
```

---

## 7. 구현 순서 (Phase)

### Phase 1: 기반 구축 ✅ 완료
1. Nx Workspace 생성 (api + admin + client)
2. Docker PostgreSQL 설정 (port 5435)
3. Prisma 스키마 정의 + DB Push (27개 테이블)
4. PrismaService + PrismaModule (Global)
5. Auth 모듈 (JWT 로그인/시드/프로필)

### Phase 2: 핵심 Admin CRUD ✅ 완료
6. 포트폴리오 CRUD
7. 서비스 소개 CRUD
8. 회사 소개 (CompanyInfo + TeamMember + History) CRUD
9. 기술 블로그 CRUD (조회수 자동증가)
10. 공지사항 CRUD (고정글 우선정렬)
11. FAQ CRUD (카테고리 포함)
12. 문의 내역 관리 (상태 변경)
13. 채용 관리 CRUD

### Phase 3: 보조 Admin 모듈 ✅ API 완료
14. 지원사업/현황 관리 API (SupportProject, ProjectStatus)
15. 콘텐츠 API (Certificate, Event, Popup, Terms, QrCode)
16. 마케팅 API (MarketingConsent, MarketingCompany)
17. 다국어/SEO API (Translation, SeoConfig)
18. 사용자 관리 API (AdminUser CRUD, Role, MenuPermission, RolePermission)
19. Supabase Storage 파일 업로드 (미구현)

### Phase 4: 코디(Cody) 모듈 ✅ API 완료
20. 기업 관리 CRUD (CodyCompany)
21. 프로젝트 관리 CRUD (CodyProject)
22. 크레딧 관리 (CodyCredit)
23. 알림 관리 (CodyNotification)
24. 주간 보고서 관리 (CodyWeeklyReport)

### Phase 5: Admin 프론트엔드 🔄 진행 중
25. Tailwind CSS v3 설치 및 설정
26. 전체 라우팅 구성 (27개 라우트, authGuard, loginGuard)
27. 사이드바 레이아웃 (Shell + Sidebar 컴포넌트)
28. 로그인 페이지 (Signal 기반 폼)
29. 대시보드 페이지 (stub)
30. 각 메뉴 페이지 stub (추후 CRUD 구현)
31. Access Token(메모리) + Refresh Token(쿠키) 인터셉터 적용
32. 토큰 만료 시 자동 refresh 가드 적용
33. 개별 CRUD 페이지 구현 (다음 단계)

### Phase 6: 클라이언트 홈페이지 (미구현)
34. 메인 페이지 (벤치마킹 디자인 적용)
35. 회사 소개 / 서비스 / 포트폴리오 페이지
36. 블로그 / 공지사항 / FAQ / 채용
37. 문의 폼 / 작업현황
38. SSR 설정 + SEO 최적화

### Phase 7: 마무리 (미구현)
39. Admin 대시보드 통계
40. 반응형 디자인 점검
41. 배포 설정

---

## 8. 벤치마킹 사이트 분석

### 원본 사이트 정보
| 항목 | 내용 |
|------|------|
| **URL** | https://lepisode.team (= lepisode.kr) |
| **업종** | IT/SaaS — 웹·앱 개발, AI 솔루션, IT 컨설팅 |
| **기술 스택** | Angular 19.2.5 (SSR), SUIT 폰트 |
| **다국어** | 한국어 + 영어 + 일본어 |

### 클라이언트 페이지 구조
| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 | `/` | 히어로 배너, 서비스 카드, 포트폴리오 미리보기, CTA |
| 회사 소개 | `/about` | 비전, 연혁, 팀원 소개 |
| 서비스 | `/services` | 서비스 카드 목록 |
| 포트폴리오 | `/portfolio` | 필터 + 그리드 레이아웃 |
| 기술 블로그 | `/blog` | 블로그 목록 + 상세 |
| 채용 | `/careers` | 채용 공고 목록 |
| FAQ | `/faq` | 카테고리별 아코디언 |
| 공지사항 | `/notice` | 공지 목록 + 상세 |
| 작업현황 | `/status` | 프로젝트 진행 상태 테이블 |
| 문의 | `/contact` | 프로젝트 의뢰 폼 |

---

## 9. 개발 환경 실행 방법

```bash
# 1. Docker PostgreSQL 시작
docker compose up -d

# 2. Prisma DB 동기화
npx prisma db push

# 3. API 서버 실행 (port 3000)
npx nx serve api

# 4. 초기 관리자 생성
# POST http://localhost:3000/api/v1/auth/seed

# 5. 클라이언트 실행 (port 4200) — Phase 5 이후
npx nx serve client

# 6. 관리자 실행 (port 4300) — Phase 3 이후
npx nx serve admin
```

---

## 10. 참고: 관리자 패널 이미지

관리자 패널의 사이드바 메뉴 레이아웃은 아래 이미지를 기준으로 구성됨:
- 좌측 사이드바에 메뉴 그룹 (홈페이지 관리, 마케팅 업체, 사용자 관리, 코디)
- 우측에 콘텐츠 영역 (테이블 + CRUD 폼)
- 상단에 검색/필터 바


//필독

작성방식 any type 사용 금지

html 은 margin 사용 금지 gap 이나 padding 으로 처리

api DTO 만들때 whitelist 필수 (class-transformer, class-validator)

# class-transformer, class-validator 필수 사용
@Type(() => MyType)
@IsString()
@IsOptional()


라우터가드 필수

공통로직 shared로 빼기 (반복적인 data grid 생성, admin table component, dialog common component, select common component, 이미지 업로드 로직, API 공통 요청 로직, 알림 toast 로직 등등)

앵귤러 signal 사용 필수 (전부 시그널 형태 폼, 시그널 기반 컴포넌트)

Exclude, Pick, Omit 등 타입 유틸리티 활용 필수 ( prisma 모델을 그대로 사용하지 말고 필요한 필드만 가져와서 사용하기)

제네릭 타입 필수 활용 (반복적인 로직을 제네릭으로 처리)

라우터 가드에서 로그인 체크시 토큰 시간 체크 필수 (Access Token , Refresh Token ) 필요시 refresh token 으로 자동 재발급후 로그인 상태 유지되도록 하기

토큰 발급 방식 메모리 액세스, 쿠키로 처리

모노레포 방식 채택

css 사용금지 ,tailwind 랑 앵귤러 html로만 처리

컴포넌트 page.ts 로 네이밍 필수

standalone:true 이미 내장되어있기 때문에 작성 x

ts, html 분리 필수

모달 애니메이션 오른쪽 사이드 서랍 방식으로 

같은 항목끼리 무조건 분리해서 폴더생성


