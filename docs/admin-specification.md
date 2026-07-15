# Lepisode Admin 기획문서

---

## 1. DB 설계

### 1.1 시스템 / 인증

**AdminUser** (`admin_users`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | 관리자 ID |
| email | String | ✅ | - | 이메일 (Unique, 로그인용) |
| password | String | ✅ | - | 해시된 비밀번호 |
| name | String | ✅ | - | 이름 |
| role | String | ✅ | ADMIN | 역할 (SUPER_ADMIN / ADMIN / EDITOR) |
| isActive | Boolean | ✅ | true | 활성 여부 |
| lastLoginAt | DateTime | - | - | 마지막 로그인 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**Role** (`roles`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | 역할 ID |
| name | String | ✅ | - | 역할명 (Unique) |
| description | String | - | - | 설명 |
| createdAt | DateTime | ✅ | now() | 생성일 |

**MenuPermission** (`menu_permissions`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | 메뉴 ID |
| menuKey | String | ✅ | - | 메뉴 키 (Unique, ex: blog) |
| menuName | String | ✅ | - | 메뉴 표시명 |
| parentKey | String | - | - | 상위 메뉴 키 |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |

**RolePermission** (`role_permissions`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | 권한 ID |
| roleId | Int (FK) | ✅ | - | → Role (Cascade) |
| menuId | Int (FK) | ✅ | - | → MenuPermission (Cascade) |
| canRead | Boolean | ✅ | false | 읽기 권한 |
| canWrite | Boolean | ✅ | false | 쓰기 권한 |
| canDelete | Boolean | ✅ | false | 삭제 권한 |

> Unique 제약: (roleId, menuId) 조합

---

### 1.2 블로그

**BlogPost** (`blog_posts`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 제목 |
| titleEn | String | - | - | 영문 제목 |
| titleJa | String | - | - | 일문 제목 |
| content | Text | ✅ | - | 본문 (HTML) |
| contentEn | Text | - | - | 영문 본문 |
| contentJa | Text | - | - | 일문 본문 |
| thumbnailUrl | String | - | - | 썸네일 이미지 URL |
| category | String | - | - | 카테고리 |
| subCategory | String | - | - | 서브 카테고리 |
| author | String | - | - | 작성자명 |
| tags | String[] | - | - | 태그 목록 (PG Array) |
| viewCount | Int | ✅ | 0 | 조회수 |
| published | Boolean | ✅ | false | 공개 여부 |
| publishedAt | DateTime | - | - | 발행일 (수동 지정) |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.3 코디 (Cody)

**CodyCompany** (`cody_companies`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| name | String | ✅ | - | 업체명 |
| businessNumber | String | - | - | 사업자번호 |
| ceoName | String | - | - | 대표자명 |
| ceoPhone | String | - | - | 대표 연락처 |
| address | String | - | - | 주소 |
| email | String | - | - | 이메일 |
| memo | Text | - | - | 메모 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

> 관계: → CodyProject (1:N), → CodyCredit (1:N), → CodyNotification (1:N), → CodyWeeklyReport (1:N)

**CodyProject** (`cody_projects`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| name | String | ✅ | - | 프로젝트명 |
| status | String | ✅ | PENDING | PENDING / IN_PROGRESS / COMPLETED / ON_HOLD / CANCELLED |
| companyId | Int (FK) | ✅ | - | → CodyCompany (Cascade) |
| startDate | DateTime | - | - | 시작일 |
| endDate | DateTime | - | - | 종료일 |
| description | Text | - | - | 설명 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**CodyCredit** (`cody_credits`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| type | String | ✅ | - | CHARGE / USE / REFUND / ADJUST |
| companyId | Int (FK) | ✅ | - | → CodyCompany (Cascade) |
| projectId | Int (FK) | - | - | → CodyProject (SetNull) |
| description | Text | - | - | 설명 |
| amount | Decimal(12,0) | ✅ | - | 금액 |
| manager | String | - | - | 담당자 |
| createdAt | DateTime | ✅ | now() | 생성일 |

**CodyNotification** (`cody_notifications`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| status | String | ✅ | PENDING | SENT / PENDING / FAILED / READ |
| companyId | Int (FK) | ✅ | - | → CodyCompany (Cascade) |
| companyName | String | ✅ | - | 업체명 (비정규화) |
| content | Text | ✅ | - | 알림 내용 |
| createdAt | DateTime | ✅ | now() | 생성일 |

**CodyWeeklyReport** (`cody_weekly_reports`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| companyId | Int (FK) | ✅ | - | → CodyCompany (Cascade) |
| projectId | Int (FK) | ✅ | - | → CodyProject (Cascade) |
| title | String | ✅ | - | 보고서 제목 |
| periodStart | DateTime | - | - | 보고 시작일 |
| periodEnd | DateTime | - | - | 보고 종료일 |
| content | Text | - | - | 보고 내용 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.4 회사 소개

**CompanyInfo** (`company_info`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| key | String | ✅ | - | 항목 키 (Unique, ex: vision, mission, address) |
| value | Text | ✅ | - | 값 |
| valueEn | Text | - | - | 영문 값 |
| valueJa | Text | - | - | 일문 값 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**TeamMember** (`team_members`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| name | String | ✅ | - | 이름 |
| nameEn | String | - | - | 영문 이름 |
| nameJa | String | - | - | 일문 이름 |
| position | String | ✅ | - | 직책 |
| positionEn | String | - | - | 영문 직책 |
| positionJa | String | - | - | 일문 직책 |
| profileImageUrl | String | - | - | 프로필 이미지 URL |
| bio | Text | - | - | 소개 |
| bioEn | Text | - | - | 영문 소개 |
| bioJa | Text | - | - | 일문 소개 |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**CompanyHistory** (`company_history`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| year | Int | ✅ | - | 연도 |
| month | Int | - | - | 월 |
| title | String | ✅ | - | 제목 |
| titleEn | String | - | - | 영문 제목 |
| titleJa | String | - | - | 일문 제목 |
| description | String | - | - | 설명 |
| descriptionEn | String | - | - | 영문 설명 |
| descriptionJa | String | - | - | 일문 설명 |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |

---

### 1.5 콘텐츠 관리

**Certificate** (`certificates`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 인증서명 |
| titleEn | String | - | - | 영문 인증서명 |
| titleJa | String | - | - | 일문 인증서명 |
| issuer | String | - | - | 발급 기관 |
| issueDate | DateTime | - | - | 발급일 |
| imageUrl | String | - | - | 이미지 URL |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| createdAt | DateTime | ✅ | now() | 생성일 |

**Event** (`events`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 이벤트명 |
| titleEn | String | - | - | 영문 이벤트명 |
| titleJa | String | - | - | 일문 이벤트명 |
| description | Text | - | - | 설명 |
| imageUrl | String | - | - | 이미지 URL |
| linkUrl | String | - | - | 링크 URL |
| attachmentUrl | String | - | - | 첨부파일 URL |
| startDate | DateTime | - | - | 시작일 |
| endDate | DateTime | - | - | 종료일 |
| selectedDate | DateTime | - | - | 선정일 |
| published | Boolean | ✅ | false | 공개 여부 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**Popup** (`popups`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 팝업 제목 |
| imageUrl | String | - | - | 이미지 URL |
| linkUrl | String | - | - | 링크 URL |
| startDate | DateTime | - | - | 노출 시작일 |
| endDate | DateTime | - | - | 노출 종료일 |
| position | String | ✅ | CENTER | CENTER / BOTTOM / FULL |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| published | Boolean | ✅ | false | 공개 여부 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**Terms** (`terms`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| type | String | ✅ | - | 약관 유형 (Unique: SERVICE / PRIVACY / MARKETING) |
| title | String | ✅ | - | 제목 |
| titleEn | String | - | - | 영문 제목 |
| titleJa | String | - | - | 일문 제목 |
| content | Text | ✅ | - | 내용 |
| contentEn | Text | - | - | 영문 내용 |
| contentJa | Text | - | - | 일문 내용 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**QrCode** (`qr_codes`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| name | String | ✅ | - | QR 이름 |
| type | String | ✅ | URL | URL / APP / DEEPLINK |
| targetUrl | String | ✅ | - | 대상 URL |
| qrImageUrl | String | - | - | QR 이미지 URL |
| scanCount | Int | ✅ | 0 | 스캔 횟수 |
| isActive | Boolean | ✅ | true | 활성 여부 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.6 FAQ

**FaqCategory** (`faq_categories`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| name | String | ✅ | - | 카테고리명 |
| nameEn | String | - | - | 영문 카테고리명 |
| nameJa | String | - | - | 일문 카테고리명 |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| createdAt | DateTime | ✅ | now() | 생성일 |

**Faq** (`faqs`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| question | String | ✅ | - | 질문 |
| questionEn | String | - | - | 영문 질문 |
| questionJa | String | - | - | 일문 질문 |
| answer | Text | ✅ | - | 답변 |
| answerEn | Text | - | - | 영문 답변 |
| answerJa | Text | - | - | 일문 답변 |
| published | Boolean | ✅ | false | 공개 여부 |
| categoryId | Int (FK) | ✅ | - | → FaqCategory (Cascade) |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.7 다국어 / SEO

**Translation** (`translations`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| key | String | ✅ | - | 번역 키 (Unique, ex: home.title) |
| ko | Text | ✅ | - | 한국어 |
| en | Text | - | - | 영어 |
| ja | Text | - | - | 일어 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**SeoConfig** (`seo_configs`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| pagePath | String | ✅ | - | 페이지 경로 (Unique, ex: /about) |
| title | String | - | - | SEO 제목 |
| titleEn | String | - | - | 영문 SEO 제목 |
| titleJa | String | - | - | 일문 SEO 제목 |
| description | Text | - | - | SEO 설명 |
| descriptionEn | Text | - | - | 영문 SEO 설명 |
| descriptionJa | Text | - | - | 일문 SEO 설명 |
| keywords | String | - | - | 키워드 |
| ogImageUrl | String | - | - | OG 이미지 URL |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.8 문의

**Inquiry** (`inquiries`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| name | String | ✅ | - | 이름 |
| email | String | ✅ | - | 이메일 |
| phone | String | - | - | 연락처 |
| company | String | - | - | 회사명 |
| budget | String | - | - | 예산 |
| projectType | String | - | - | 프로젝트 유형 |
| content | Text | ✅ | - | 문의 내용 |
| status | String | ✅ | PENDING | PENDING / IN_PROGRESS / COMPLETED / CANCELLED |
| isRead | Boolean | ✅ | false | 읽음 여부 |
| adminMemo | Text | - | - | 관리자 메모 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.9 채용

**JobPosting** (`job_postings`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 공고 제목 |
| titleEn | String | - | - | 영문 제목 |
| titleJa | String | - | - | 일문 제목 |
| category | String | - | - | 카테고리 (개발/디자인/기획) |
| jobUrl | String | - | - | 외부 공고 URL |
| startDate | DateTime | - | - | 모집 시작일 |
| deadline | DateTime | - | - | 마감일 |
| published | Boolean | ✅ | false | 공개 여부 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.10 마케팅

**MarketingConsent** (`marketing_consents`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| name | String | ✅ | - | 이름 |
| email | String | ✅ | - | 이메일 |
| phone | String | - | - | 연락처 |
| isConsented | Boolean | ✅ | true | 동의 여부 |
| consentedAt | DateTime | - | - | 동의일 |
| revokedAt | DateTime | - | - | 철회일 |
| createdAt | DateTime | ✅ | now() | 생성일 |

**MarketingCompany** (`marketing_companies`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| name | String | ✅ | - | 업체명 |
| contactPerson | String | - | - | 담당자 |
| phone | String | - | - | 연락처 |
| email | String | - | - | 이메일 |
| serviceType | String | - | - | 서비스 유형 |
| memo | Text | - | - | 메모 |
| isActive | Boolean | ✅ | true | 활성 여부 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.11 공지사항

**Notice** (`notices`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 제목 |
| titleEn | String | - | - | 영문 제목 |
| titleJa | String | - | - | 일문 제목 |
| content | Text | ✅ | - | 본문 |
| contentEn | Text | - | - | 영문 본문 |
| contentJa | Text | - | - | 일문 본문 |
| thumbnailUrl | String | - | - | 썸네일 URL |
| published | Boolean | ✅ | false | 공개 여부 |
| isPinned | Boolean | ✅ | false | 상단 고정 여부 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.12 포트폴리오

**Portfolio** (`portfolios`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 제목 |
| titleEn | String | - | - | 영문 제목 |
| titleJa | String | - | - | 일문 제목 |
| client | String | - | - | 클라이언트명 |
| category | String | ✅ | - | 카테고리 |
| period | String | - | - | 기간 |
| techStack | String[] | - | - | 기술 스택 (PG Array) |
| keywords | String | - | - | 검색 키워드 (콤마 구분) |
| thumbnailUrl | String | - | - | 썸네일 URL |
| images | String[] | - | - | 이미지 URL 목록 (PG Array) |
| description | Text | - | - | 설명 |
| descriptionEn | Text | - | - | 영문 설명 |
| descriptionJa | Text | - | - | 일문 설명 |
| published | Boolean | ✅ | false | 공개 여부 |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.13 서비스

**Service** (`services`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 서비스명 |
| titleEn | String | - | - | 영문 서비스명 |
| titleJa | String | - | - | 일문 서비스명 |
| slug | String | ✅ | - | URL 슬러그 (Unique) |
| seoTitle | String | - | - | SEO 제목 |
| seoDescription | Text | - | - | SEO 설명 |
| content | Text | - | - | 상세 내용 (에디터) |
| icon | String | - | - | 아이콘 |
| thumbnailUrl | String | - | - | 썸네일 URL |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| published | Boolean | ✅ | false | 공개 여부 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

### 1.14 지원사업

**SupportProject** (`support_projects`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 프로젝트 제목 |
| slug | String | ✅ | - | URL 슬러그 (Unique) |
| bannerUrl | String | - | - | 배너 이미지 URL |
| ogImageUrl | String | - | - | OG 이미지 URL |
| published | Boolean | ✅ | false | 공개 여부 |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

**ProjectStatus** (`project_statuses`)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| id | Int | ✅ | Auto PK | |
| title | String | ✅ | - | 프로젝트명 |
| titleEn | String | - | - | 영문 프로젝트명 |
| titleJa | String | - | - | 일문 프로젝트명 |
| client | String | ✅ | - | 클라이언트명 |
| platforms | String[] | - | - | 플랫폼 (안드로이드/iOS/웹) |
| startDate | DateTime | - | - | 시작일 |
| endDate | DateTime | - | - | 종료일 |
| status | String | ✅ | ESTIMATING | ESTIMATING / IN_PROGRESS / COMPLETE |
| email | String | - | - | 이메일 |
| phone | String | - | - | 전화번호 |
| attachmentUrl | String | - | - | 첨부파일 URL |
| memo | Text | - | - | 메모 |
| content | Text | - | - | 내용 (에디터) |
| published | Boolean | ✅ | false | 공개 여부 |
| sortOrder | Int | ✅ | 0 | 정렬 순서 |
| createdAt | DateTime | ✅ | now() | 생성일 |
| updatedAt | DateTime | ✅ | Auto | 수정일 |

---

## 2. 워크플로우

### 2.1 대시보드

| 분류 | 기능 |
|------|------|
| 통계 | 전체 포트폴리오 수를 **확인할 수 있다.** |
| 통계 | 접수된 문의(미처리 포함) 수를 **확인할 수 있다.** |
| 통계 | 발행된 블로그 포스트 수를 **확인할 수 있다.** |
| 통계 | 등록된 코디 업체 수를 **확인할 수 있다.** |

### 2.2 인증 / 계정

| 분류 | 기능 |
|------|------|
| 로그인 | 이메일과 비밀번호를 입력하여 **로그인할 수 있다.** |
| 로그인 | 로그인 실패 시 에러 메시지를 **확인할 수 있다.** |
| 토큰 | Access Token이 만료되면 Refresh Token으로 **자동 갱신할 수 있다.** |
| 토큰 | Refresh Token은 httpOnly 쿠키로 **안전하게 저장된다.** |
| 로그아웃 | 세션을 종료하고 **로그아웃할 수 있다.** |
| 시드 | 초기 관리자 계정(SUPER_ADMIN)을 API 시드 엔드포인트로 **생성할 수 있다.** |
| 프로필 | JWT 토큰 기반으로 내 프로필(이메일, 이름, 역할)을 **조회할 수 있다.** |

### 2.3 관리자 / 권한

| 분류 | 기능 |
|------|------|
| 관리자 목록 | 등록된 관리자 목록(이메일, 이름, 역할, 활성여부)을 **조회할 수 있다.** |
| 관리자 등록 | 이메일, 비밀번호, 이름, 역할을 입력하여 관리자를 **생성할 수 있다.** |
| 관리자 수정 | 관리자의 이름, 역할, 활성여부를 **수정할 수 있다.** |
| 관리자 삭제 | 확인 다이얼로그 후 관리자를 **삭제할 수 있다.** |
| 역할 관리 | 역할(Role)을 이름과 설명으로 **생성할 수 있다.** |
| 역할 관리 | 역할을 **삭제할 수 있다.** (연결된 RolePermission도 Cascade 삭제) |
| 메뉴 권한 | 메뉴 키, 메뉴명, 상위 메뉴 키를 입력하여 메뉴 권한을 **생성할 수 있다.** |
| 메뉴 권한 | 메뉴 권한을 **삭제할 수 있다.** |
| 역할별 권한 | 역할별로 각 메뉴에 대해 읽기/쓰기/삭제 권한을 **개별 설정할 수 있다.** |

### 2.4 블로그

| 분류 | 기능 |
|------|------|
| 목록 | 블로그 글 목록(순번, 제목, 카테고리, 서브카테고리, 작성자, 썸네일, 발행일, 생성일)을 **테이블로 조회할 수 있다.** |
| 검색 | 제목, 카테고리, 작성자 등 전체 필드를 **키워드로 검색할 수 있다.** |
| 엑셀 | 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 제목, 본문(마크다운 에디터), 카테고리, 서브카테고리, 작성자, 발행일을 입력하여 **등록할 수 있다.** |
| 마크다운 | 본문 작성 시 **마크다운 에디터**(제목/굵게/기울임/취소선/이미지/표/링크/코드/코드블록)를 **사용할 수 있다.** |
| 마크다운 | 작성 중 **미리보기(Preview) 탭**으로 렌더링 결과를 **확인할 수 있다.** |
| 썸네일 | 썸네일 이미지를 **파일 선택 또는 드래그 앤 드롭으로 업로드할 수 있다.** |
| 썸네일 | 업로드된 썸네일을 **미리보기하고 삭제할 수 있다.** |
| 공개 설정 | 블로그 글의 공개/비공개를 **토글로 설정할 수 있다.** |
| 수정 | 기존 블로그 글의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 블로그 글을 **삭제할 수 있다.** |

### 2.5 코디 (Cody) — 업체 관리

| 분류 | 기능 |
|------|------|
| 목록 | 업체 목록(순번, 기업명, 사업자등록번호, 대표자명, 대표 연락처, 등록일자)을 **테이블로 조회할 수 있다.** |
| 검색 | 기업명, 사업자번호, 대표자명 등을 **키워드로 검색할 수 있다.** |
| 페이징 | 목록을 **페이지네이션으로 탐색할 수 있다.** (기본 10건) |
| 엑셀 | 업체 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 기업명(필수), 사업자등록번호, 대표자명, 대표 연락처, 주소, 이메일, 메모를 입력하여 **등록할 수 있다.** |
| 수정 | 기존 업체의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 업체를 **삭제할 수 있다.** (하위 프로젝트/크레딧/알림/보고서도 Cascade 삭제) |

### 2.6 코디 (Cody) — 프로젝트

| 분류 | 기능 |
|------|------|
| 목록 | 프로젝트 목록(프로젝트명, 업체, 상태, 기간, 등록일)을 **테이블로 조회할 수 있다.** |
| 검색 | 프로젝트명, 업체명 등을 **키워드로 검색할 수 있다.** |
| 등록 | 프로젝트명(필수), 소속 업체, 상태, 시작일/종료일, 설명을 입력하여 **등록할 수 있다.** |
| 상태 변경 | 프로젝트 상태를 대기(PENDING) / 진행중(IN_PROGRESS) / 완료(COMPLETED) / 보류(ON_HOLD) / 취소(CANCELLED) 중 하나로 **변경할 수 있다.** |
| 수정 | 기존 프로젝트의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 프로젝트를 **삭제할 수 있다.** |

### 2.7 코디 (Cody) — 크레딧

| 분류 | 기능 |
|------|------|
| 목록 | 크레딧 내역(유형, 업체, 프로젝트, 금액, 담당자, 설명, 날짜)을 **테이블로 조회할 수 있다.** |
| 등록 | 유형(충전/사용/환불/조정), 업체(필수), 프로젝트(선택), 금액, 담당자, 설명을 입력하여 **등록할 수 있다.** |
| 조회 | 업체별/프로젝트별로 크레딧 잔액을 **확인할 수 있다.** |

### 2.8 코디 (Cody) — 알림

| 분류 | 기능 |
|------|------|
| 목록 | 알림 목록(상태, 업체명, 내용, 발송일)을 **테이블로 조회할 수 있다.** |
| 발송 | 업체 선택 후 알림 내용을 입력하여 **발송할 수 있다.** |
| 상태 관리 | 알림 상태를 발송(SENT) / 대기(PENDING) / 실패(FAILED) / 읽음(READ)으로 **변경할 수 있다.** |

### 2.9 코디 (Cody) — 주간보고서

| 분류 | 기능 |
|------|------|
| 목록 | 주간보고서 목록(제목, 업체, 프로젝트, 기간, 등록일)을 **테이블로 조회할 수 있다.** |
| 등록 | 프로젝트 선택(드롭다운, 필수), 보고서 제목(필수), 진행 기간(시작~종료, 필수)을 입력하여 **등록할 수 있다.** |
| 내용 작성 | 진행사항과 이슈사항을 각각 **리치 에디터(WYSIWYG)로 작성할 수 있다.** |
| 내용 저장 | 진행사항/이슈사항은 **JSON 형태로 저장**된다. |
| 아코디언 | 미리보기/작성 영역을 **아코디언으로 열고 닫을 수 있다.** |
| 수정 | 상세 페이지에서 기존 보고서를 **수정할 수 있다.** |
| 삭제 | 목록에서 확인 다이얼로그 후 보고서를 **삭제할 수 있다.** |

### 2.10 회사 소개 — 팀원 관리

| 분류 | 기능 |
|------|------|
| 목록 | 팀원 목록(순서, 이름, 직함, 분야, 등록일)을 **테이블로 조회할 수 있다.** |
| 검색 | 이름, 직함 등을 **키워드로 검색할 수 있다.** |
| 엑셀 | 팀원 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 이름(필수), 직함(필수), 분야, 정렬 순서를 입력하여 **등록할 수 있다.** |
| 다국어 | 이름/직함/분야에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 프로필 이미지 | 프로필 이미지를 **파일 선택 또는 드래그 앤 드롭으로 업로드할 수 있다.** |
| 프로필 이미지 | 업로드된 이미지를 **미리보기하고 삭제할 수 있다.** |
| 정렬 | 정렬 순서(숫자)를 지정하여 **표시 순서를 변경할 수 있다.** |
| 수정 | 기존 팀원의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 팀원을 **삭제할 수 있다.** |

### 2.11 회사 소개 — 회사 정보 / 연혁

| 분류 | 기능 |
|------|------|
| 정보 수정 | 회사 정보(비전, 미션, 주소, 전화번호, 소개 영상 등)의 값을 **수정할 수 있다.** |
| 정보 다국어 | 각 항목의 한국어/영어/일본어 값을 **개별 입력할 수 있다.** |
| 연혁 등록 | 연도, 월, 제목, 설명을 입력하여 연혁을 **추가할 수 있다.** |
| 연혁 다국어 | 연혁 제목/설명에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 연혁 수정 | 기존 연혁을 **수정할 수 있다.** |
| 연혁 삭제 | 확인 다이얼로그 후 연혁을 **삭제할 수 있다.** |
| 연혁 정렬 | 정렬 순서를 지정하여 **표시 순서를 변경할 수 있다.** |

### 2.12 콘텐츠 — 인증서

| 분류 | 기능 |
|------|------|
| 목록 | 인증서 목록(제목, 발급기관, 발급일, 이미지, 정렬 순서)을 **테이블로 조회할 수 있다.** |
| 검색 | 인증서명, 발급기관 등을 **키워드로 검색할 수 있다.** |
| 등록 | 제목(필수), 발급 기관, 발급일, 이미지 URL, 정렬 순서를 입력하여 **등록할 수 있다.** |
| 다국어 | 제목에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 수정 | 기존 인증서의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 인증서를 **삭제할 수 있다.** |

### 2.13 콘텐츠 — 이벤트

| 분류 | 기능 |
|------|------|
| 목록 | 이벤트 목록(번호[EV00000001형식], 이벤트명, 이벤트기간, 선정일, 첨부파일 수, 등록일자)을 **테이블로 조회할 수 있다.** |
| 검색 | 이벤트명 등을 **키워드로 검색할 수 있다.** |
| 엑셀 | 이벤트 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 이벤트명(필수), 설명(리치 에디터), 이미지 URL, 첨부파일, 시작일/종료일, 선정일을 입력하여 **등록할 수 있다.** |
| 다국어 | 이벤트명에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 첨부파일 | 첨부파일을 **업로드하고 삭제할 수 있다.** |
| 공개 설정 | 이벤트의 공개/비공개를 **토글로 설정할 수 있다.** |
| 상세 | 이벤트 행을 클릭하여 **상세 페이지로 이동할 수 있다.** |
| 수정 | 기존 이벤트의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 이벤트를 **삭제할 수 있다.** |

### 2.14 콘텐츠 — 팝업

| 분류 | 기능 |
|------|------|
| 목록 | 팝업 목록(제목, 이미지, 위치, 노출기간, 공개여부, 정렬순서)을 **테이블로 조회할 수 있다.** |
| 등록 | 제목(필수), 이미지 URL, 링크 URL, 노출 시작일/종료일, 위치(CENTER/BOTTOM/FULL), 정렬 순서를 입력하여 **등록할 수 있다.** |
| 공개 설정 | 팝업의 공개/비공개를 **토글로 설정할 수 있다.** |
| 위치 설정 | 팝업의 노출 위치를 CENTER, BOTTOM, FULL 중 하나로 **설정할 수 있다.** |
| 기간 설정 | 팝업의 노출 시작일/종료일을 **설정할 수 있다.** |
| 수정 | 기존 팝업의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 팝업을 **삭제할 수 있다.** |

### 2.15 콘텐츠 — 약관

| 분류 | 기능 |
|------|------|
| 조회 | 약관 유형별(서비스/개인정보/마케팅) 내용을 **조회할 수 있다.** |
| 수정 | 약관 제목과 본문(HTML)을 **수정할 수 있다.** |
| 다국어 | 약관 제목/본문에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |

### 2.16 콘텐츠 — QR코드

| 분류 | 기능 |
|------|------|
| 목록 | QR코드 목록(이름, 유형, 대상 URL, QR이미지, 스캔횟수, 활성여부)을 **테이블로 조회할 수 있다.** |
| 등록 | QR 이름(필수), 유형(URL/APP/DEEPLINK), 대상 URL(필수)을 입력하여 **생성할 수 있다.** |
| 스캔 확인 | 각 QR코드의 **스캔 횟수를 확인할 수 있다.** |
| 활성 관리 | QR코드의 활성/비활성을 **전환할 수 있다.** |
| 수정 | 기존 QR코드의 이름, 유형, 대상 URL을 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 QR코드를 **삭제할 수 있다.** |

### 2.17 FAQ — 카테고리

| 분류 | 기능 |
|------|------|
| 목록 | FAQ 카테고리 목록(카테고리명, 정렬순서)을 **조회할 수 있다.** |
| 등록 | 카테고리명(필수), 정렬 순서를 입력하여 **등록할 수 있다.** |
| 다국어 | 카테고리명에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 수정 | 기존 카테고리의 이름, 정렬 순서를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 카테고리를 **삭제할 수 있다.** (하위 FAQ도 Cascade 삭제) |

### 2.18 FAQ — 항목

| 분류 | 기능 |
|------|------|
| 목록 | FAQ 목록(질문, 카테고리, 공개여부, 정렬순서)을 **테이블로 조회할 수 있다.** |
| 검색 | 질문, 답변 등을 **키워드로 검색할 수 있다.** |
| 등록 | 질문(필수), 답변(필수), 카테고리 선택(필수), 정렬 순서를 입력하여 **등록할 수 있다.** |
| 다국어 | 질문/답변에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 공개 설정 | FAQ의 공개/비공개를 **토글로 설정할 수 있다.** |
| 정렬 | 정렬 순서(숫자)를 지정하여 **표시 순서를 변경할 수 있다.** |
| 수정 | 기존 FAQ의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 FAQ를 **삭제할 수 있다.** |

### 2.19 다국어

| 분류 | 기능 |
|------|------|
| 목록 | 번역 목록(순번, 키, 한국어, 영어, 일본어, 수정일)을 **테이블로 조회할 수 있다.** |
| 탭 필터 | 전체 / 미번역(영어 또는 일본어가 비어있는 항목) 탭으로 **필터링할 수 있다.** |
| 미번역 수 | 미번역 항목의 개수를 **배지로 확인할 수 있다.** |
| 검색 | 키, 한국어, 영어, 일본어 등을 **키워드로 검색할 수 있다.** |
| 엑셀 내보내기 | 번역 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 키(필수), 한국어(필수), 영어, 일본어를 입력하여 **등록할 수 있다.** |
| 수정 | 기존 번역의 모든 필드를 **수정할 수 있다.** (Upsert 방식) |
| 삭제 | 확인 다이얼로그 후 번역을 **삭제할 수 있다.** |
| 엑셀 일괄 업로드 | 엑셀 파일(.xlsx)을 업로드하여 번역을 **일괄 등록/갱신할 수 있다.** |
| 엑셀 양식 | 일괄 등록용 **엑셀 양식 파일을 다운로드할 수 있다.** (순번/키/한국어/영어/일본어 컬럼, 스타일 적용) |
| 일괄 처리 | 업로드 시 기존 데이터를 **전체 삭제 후 재등록**하며, 시퀀스를 **자동 리셋**한다. |

### 2.20 SEO

| 분류 | 기능 |
|------|------|
| 목록 | SEO 설정 목록(페이지 경로, 제목, 설명, 키워드, OG이미지)을 **테이블로 조회할 수 있다.** |
| 등록/수정 | 페이지 경로(필수, Unique), SEO 제목, 설명, 키워드, OG 이미지 URL을 입력하여 **등록/수정할 수 있다.** (Upsert) |
| 다국어 | SEO 제목/설명에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 SEO 설정을 **삭제할 수 있다.** |

### 2.21 문의 관리

| 분류 | 기능 |
|------|------|
| 목록 | 문의 목록(번호[CS00000001형식], 상태배지, 문의경로, 고객명, 연락처, 이메일, 개인정보동의, 마케팅동의)을 **테이블로 조회할 수 있다.** |
| 상태 필터 | 전체 / 견적중(PENDING) / 진행중(IN_PROGRESS) / 답변완료(CANCELLED) / 완료(COMPLETED) 탭으로 **필터링할 수 있다.** |
| 검색 | 고객명, 이메일, 연락처 등을 **키워드로 검색할 수 있다.** |
| 페이징 | 목록을 **페이지네이션으로 탐색할 수 있다.** (기본 10건) |
| 엑셀 | 문의 목록(ID, 고객명, 이메일, 연락처, 내용, 상태, 메모, 접수일)을 **엑셀 파일로 내보낼 수 있다.** |
| 상세 조회 | 문의 행을 클릭하여 문의 상세(내용 전문, 상태, 메모)를 **확인할 수 있다.** |
| 상태 변경 | 문의 상태를 견적중 / 진행중 / 답변완료 / 완료 중 하나로 **변경할 수 있다.** |
| 관리자 메모 | 문의에 대한 관리자 메모를 **작성하고 저장할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 문의를 **삭제할 수 있다.** (상세 보기 중이면 자동 닫힘) |

### 2.22 채용

| 분류 | 기능 |
|------|------|
| 목록 | 채용 공고 목록(제목, 카테고리, 외부 URL, 모집기간, 공개여부)을 **테이블로 조회할 수 있다.** |
| 검색 | 공고 제목, 카테고리 등을 **키워드로 검색할 수 있다.** |
| 엑셀 | 채용 공고 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 공고 제목(필수), 카테고리(개발/디자인/기획), 외부 공고 URL, 모집 시작일/마감일을 입력하여 **등록할 수 있다.** |
| 다국어 | 공고 제목에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 공개 설정 | 채용 공고의 공개/비공개를 **토글로 설정할 수 있다.** |
| 수정 | 기존 공고의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 공고를 **삭제할 수 있다.** |

### 2.23 마케팅 — 수신동의

| 분류 | 기능 |
|------|------|
| 목록 | 수신 동의 목록(이름, 이메일, 연락처, 동의여부, 동의일, 철회일)을 **테이블로 조회할 수 있다.** |
| 검색 | 이름, 이메일 등을 **키워드로 검색할 수 있다.** |
| 엑셀 | 수신 동의 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 철회 처리 | 동의된 수신을 **철회 처리할 수 있다.** (revokedAt 기록) |

### 2.24 마케팅 — 업체 관리

| 분류 | 기능 |
|------|------|
| 목록 | 마케팅 업체 목록(업체명, 담당자, 연락처, 이메일, 서비스유형, 활성여부)을 **테이블로 조회할 수 있다.** |
| 검색 | 업체명, 담당자 등을 **키워드로 검색할 수 있다.** |
| 엑셀 | 업체 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 업체명(필수), 담당자, 연락처, 이메일, 서비스 유형, 메모를 입력하여 **등록할 수 있다.** |
| 활성 관리 | 업체의 활성/비활성을 **전환할 수 있다.** |
| 수정 | 기존 업체의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 업체를 **삭제할 수 있다.** |

### 2.25 공지사항

| 분류 | 기능 |
|------|------|
| 목록 | 공지사항 목록(제목, 썸네일, 공개여부, 고정여부, 등록일)을 **테이블로 조회할 수 있다.** |
| 검색 | 제목, 본문 등을 **키워드로 검색할 수 있다.** |
| 엑셀 | 공지사항 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 제목(필수), 본문(필수, HTML 에디터), 썸네일 URL을 입력하여 **등록할 수 있다.** |
| 다국어 | 제목/본문에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 공개 설정 | 공지사항의 공개/비공개를 **토글로 설정할 수 있다.** |
| 상단 고정 | 공지사항을 **상단에 고정할 수 있다.** (isPinned 토글) |
| 수정 | 기존 공지사항의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 공지사항을 **삭제할 수 있다.** |

### 2.26 포트폴리오

| 분류 | 기능 |
|------|------|
| 목록 | 포트폴리오 목록(카테고리, 프로젝트명, 영문 제목, 일본어 제목, 게시상태, 등록일자)을 **테이블로 조회할 수 있다.** |
| 검색 | 프로젝트명, 카테고리 등을 **키워드로 검색할 수 있다.** |
| 카테고리 필터 | 카테고리별로 목록을 **필터링할 수 있다.** |
| 페이징 | 목록을 **페이지네이션으로 탐색할 수 있다.** (기본 20건) |
| 엑셀 | 포트폴리오 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 포트폴리오명(필수)을 입력하여 **등록할 수 있다.** |
| 다국어 | 제목에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 서비스 유형 | 플랫폼, 홈페이지, DX, AX, 카탈로그/브랜딩 중 **복수 선택할 수 있다.** (category에 콤마 구분 저장) |
| 기간 | 프로젝트 시작일/종료일을 **입력할 수 있다.** (period에 "시작 ~ 종료" 형태 저장) |
| 키워드 태그 | 키워드를 태그 형태로 **추가/삭제할 수 있다.** (Enter 키로 추가) |
| 콘텐츠 | AEO/GEO 콘텐츠, 서비스 상세, 내용을 각각 **리치 에디터로 작성할 수 있다.** |
| 썸네일 | 썸네일 URL을 **입력할 수 있다.** |
| 공개 설정 | 포트폴리오의 공개/숨김을 **토글로 설정할 수 있다.** |
| 정렬 | 정렬 순서(숫자)를 지정하여 **표시 순서를 변경할 수 있다.** |
| 수정 | 기존 포트폴리오의 모든 필드를 **수정할 수 있다.** (상세 데이터 API 호출하여 로딩) |
| 삭제 | 확인 다이얼로그 후 포트폴리오를 **삭제할 수 있다.** |

### 2.27 서비스

| 분류 | 기능 |
|------|------|
| 목록 | 서비스 목록(제목, 슬러그, 아이콘, 정렬순서, 공개여부, 등록일)을 **테이블로 조회할 수 있다.** |
| 검색 | 서비스명, 슬러그 등을 **키워드로 검색할 수 있다.** |
| 엑셀 | 서비스 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 서비스명(필수), URL 슬러그(필수, Unique), SEO 제목, SEO 설명, 상세 내용(에디터), 아이콘, 썸네일 URL, 정렬 순서를 입력하여 **등록할 수 있다.** |
| 다국어 | 서비스명에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| SEO | SEO 제목과 설명을 **설정할 수 있다.** |
| 공개 설정 | 서비스의 공개/비공개를 **토글로 설정할 수 있다.** |
| 정렬 | 정렬 순서(숫자)를 지정하여 **표시 순서를 변경할 수 있다.** |
| 수정 | 기존 서비스의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 서비스를 **삭제할 수 있다.** |

### 2.28 지원사업 — 프로젝트

| 분류 | 기능 |
|------|------|
| 목록 | 지원 프로젝트 목록(제목, 슬러그, 배너, 공개여부, 정렬순서)을 **테이블로 조회할 수 있다.** |
| 등록 | 프로젝트 제목(필수), URL 슬러그(필수, Unique), 배너 URL, OG 이미지 URL, 정렬 순서를 입력하여 **등록할 수 있다.** |
| 공개 설정 | 프로젝트의 공개/비공개를 **토글로 설정할 수 있다.** |
| 수정 | 기존 프로젝트의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 프로젝트를 **삭제할 수 있다.** |

### 2.29 지원사업 — 현황 관리

| 분류 | 기능 |
|------|------|
| 목록 | 현황 목록(순서, 프로젝트명, 클라이언트, 상태배지, 등록일자, 노출여부배지)을 **테이블로 조회할 수 있다.** |
| 검색 | 프로젝트명, 클라이언트 등을 **키워드로 검색할 수 있다.** |
| 엑셀 | 현황 목록을 **엑셀 파일로 내보낼 수 있다.** |
| 등록 | 제목(필수), 클라이언트(필수), 플랫폼(안드로이드/iOS/웹 복수 선택), 시작일/종료일, 상태, 이메일, 연락처, 첨부파일, 메모, 내용(에디터), 정렬 순서를 입력하여 **등록할 수 있다.** |
| 다국어 | 제목에 대해 한국어/영어/일본어를 **각각 입력할 수 있다.** |
| 상태 설정 | 상태를 견적 중(ESTIMATING) / 진행 중(IN_PROGRESS) / 납품 완료(COMPLETE) 중 하나로 **설정할 수 있다.** |
| 플랫폼 | 안드로이드, iOS, 웹 중 **복수 선택할 수 있다.** (토글 버튼) |
| 공개 설정 | 현황의 노출/숨김을 **토글로 설정할 수 있다.** |
| 정렬 | 정렬 순서(숫자)를 지정하여 **표시 순서를 변경할 수 있다.** |
| 수정 | 기존 현황의 모든 필드를 **수정할 수 있다.** |
| 삭제 | 확인 다이얼로그 후 현황을 **삭제할 수 있다.** |

### 2.30 파일 업로드

| 분류 | 기능 |
|------|------|
| 업로드 | 이미지 파일(jpeg, png, gif, webp, svg, avif)을 **업로드할 수 있다.** (최대 10MB) |
| 폴더 지정 | 업로드 시 저장 폴더(blog, portfolio, team 등)를 **지정할 수 있다.** |
| URL 반환 | 업로드 완료 시 **공개 URL과 저장 경로를 반환**받을 수 있다. |
| 삭제 | 저장 경로를 지정하여 업로드된 파일을 **삭제할 수 있다.** |
| 저장소 | 파일은 **Supabase Storage**에 저장된다. |

---

## 3. 공통 패턴

| 패턴 | 설명 |
|------|------|
| 다국어 | 대부분의 콘텐츠 모델에 ko/en/ja 필드 존재 |
| 공개 여부 | `published: Boolean` 으로 클라이언트 노출 제어 |
| 정렬 순서 | `sortOrder: Int` 으로 표시 순서 관리 |
| Soft 참조 | CodyCredit.projectId → onDelete: SetNull |
| Hard 삭제 | 대부분의 관계는 onDelete: Cascade |
| 인증 | JWT Bearer Token (Access + httpOnly Refresh Cookie) |
| DB | PostgreSQL (Prisma ORM) |
| 파일 저장 | Supabase Storage |
