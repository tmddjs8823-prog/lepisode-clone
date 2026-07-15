# Swagger (OpenAPI) 풀 설정

NestJS API 서버에 Swagger UI 문서를 완전하게 설정합니다. `http://localhost:3000/api-docs` 에서 모든 엔드포인트를 확인하고 테스트할 수 있게 됩니다.

## 현재 상태

- **15개 모듈**, **16개 컨트롤러** (app + upload + 14개 도메인), **14개 DTO 파일** + auth 인라인 DTO
- `@nestjs/swagger` 미설치, Swagger 관련 코드 없음
- DTO에는 `class-validator` 데코레이터만 존재

## 접근 방식: Swagger CLI 플러그인 활용

> [!IMPORTANT]
> NestJS Swagger CLI 플러그인(`@nestjs/swagger/plugin`)을 사용하면 **DTO 프로퍼티의 타입/optional 여부를 자동 추론**합니다. 따라서 모든 프로퍼티에 `@ApiProperty()`를 수동으로 달 필요 없이, **설명(description)이나 예시(example)가 필요한 필드에만** `@ApiProperty({ description: '...', example: '...' })`를 추가합니다.

---

## Proposed Changes

### 1. 패키지 설치

```bash
npm install @nestjs/swagger
```

---

### 2. Swagger CLI 플러그인 설정

#### [MODIFY] [nest-cli.json](file:///c:/Users/lepisode/workspace/lepisode-clone/nest-cli.json) (또는 해당 설정 파일)

NestJS CLI 플러그인을 활성화하여 DTO 프로퍼티를 자동으로 Swagger 스키마에 반영합니다.

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true
        }
      }
    ]
  }
}
```

> [!NOTE]
> `classValidatorShim: true`로 설정하면 `@IsString()`, `@IsOptional()`, `@IsInt()` 등의 class-validator 데코레이터로부터 타입과 required 여부를 자동 추론합니다. 이를 통해 모든 DTO에 수동으로 `@ApiProperty()`를 달 필요가 없어집니다.

---

### 3. main.ts에 Swagger 설정 추가

#### [MODIFY] [main.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/main.ts)

- `SwaggerModule.createDocument()` + `SwaggerModule.setup()`
- JWT Bearer 인증 스키마 등록 (`addBearerAuth()`)
- API 제목/설명/버전 등 메타데이터

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ... bootstrap() 내부, app.listen() 전에:
const config = new DocumentBuilder()
  .setTitle('Lepisode API')
  .setDescription('Lepisode 관리 시스템 API 문서')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document);
```

---

### 4. 컨트롤러에 Swagger 데코레이터 추가

각 컨트롤러에 `@ApiTags()` + 인증이 필요한 엔드포인트에 `@ApiBearerAuth()` 추가.

| 컨트롤러 | `@ApiTags` | `@ApiBearerAuth` 범위 |
|---|---|---|
| [app.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/app/app.controller.ts) | `App` | 없음 |
| [auth.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/auth/auth.controller.ts) | `Auth` | `getProfile`, `seed` |
| [blog.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/blog/blog.controller.ts) | `Blog` | Admin CRUD |
| [cody.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/cody/cody.controller.ts) | `Cody` | 전체 (클래스 레벨 Guard) |
| [company.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/company/company.controller.ts) | `Company` | Admin CUD |
| [content.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/content/content.controller.ts) | `Content` | Admin CRUD |
| [faq.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/faq/faq.controller.ts) | `FAQ` | Admin CRUD |
| [i18n.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/i18n/i18n.controller.ts) | `I18n` | Admin CUD |
| [inquiry.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/inquiry/inquiry.controller.ts) | `Inquiry` | Admin RUD |
| [job.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/job/job.controller.ts) | `Job` | Admin CRUD |
| [marketing.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/marketing/marketing.controller.ts) | `Marketing` | Admin operations |
| [notice.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/notice/notice.controller.ts) | `Notice` | Admin CRUD |
| [portfolio.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/portfolio/portfolio.controller.ts) | `Portfolio` | Admin CRUD |
| [service.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/service/service.controller.ts) | `Service` | Admin CRUD |
| [support.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/support/support.controller.ts) | `Support` | 전체 (클래스 레벨 Guard) |
| [upload.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/common/upload/upload.controller.ts) | `Upload` | 없음 (현재 Guard 없음) |
| [user.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/user/user.controller.ts) | `User` | 전체 (클래스 레벨 Guard) |

---

### 5. DTO에 `@ApiProperty()` 데코레이터 추가

CLI 플러그인이 타입/required를 자동 추론하지만, **설명과 예시 값**을 추가하여 문서 품질을 높입니다.

수정 대상 DTO 파일 (14개 + auth 인라인):

| 파일 | DTO 클래스 수 |
|---|---|
| [auth.controller.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/auth/auth.controller.ts) (인라인 LoginDto) | 1 |
| [blog.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/blog/dto/blog.dto.ts) | 2 |
| [cody.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/cody/dto/cody.dto.ts) | 7 |
| [company.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/company/dto/company.dto.ts) | 5 |
| [content.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/content/dto/content.dto.ts) | 8 |
| [faq.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/faq/dto/faq.dto.ts) | 4 |
| [i18n.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/i18n/dto/i18n.dto.ts) | 2 |
| [inquiry.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/inquiry/dto/inquiry.dto.ts) | 2 |
| [job.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/job/dto/job.dto.ts) | 2 |
| [marketing.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/marketing/dto/marketing.dto.ts) | 3 |
| [notice.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/notice/dto/notice.dto.ts) | 2 |
| [portfolio.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/portfolio/dto/portfolio.dto.ts) | 2 |
| [service.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/service/dto/service.dto.ts) | 2 |
| [support.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/support/dto/support.dto.ts) | 4 |
| [user.dto.ts](file:///c:/Users/lepisode/workspace/lepisode-clone/apps/api/src/modules/user/dto/user.dto.ts) | 4 |

**총 50개 DTO 클래스**에 `@ApiProperty({ description, example })` 추가

---

## Open Questions

> [!IMPORTANT]
> **Swagger UI 접근 경로**: `http://localhost:3000/api-docs` 로 설정할 예정입니다. 다른 경로를 원하시면 알려주세요.

> [!NOTE]  
> **Upload 컨트롤러**: 현재 JwtAuthGuard가 없는데, Swagger 문서에서 파일 업로드를 `@ApiConsumes('multipart/form-data')` + `@ApiBody`로 문서화할까요? (파일 업로드 테스트가 가능해집니다)

---

## Verification Plan

### 자동 검증
```bash
npx nx serve api
```
서버 재시작 후 `http://localhost:3000/api-docs` 접속하여 Swagger UI가 정상적으로 표시되는지 확인

### 수동 검증
- Swagger UI에서 모든 모듈이 `@ApiTags`별로 그룹핑되는지 확인
- JWT Bearer 인증 버튼이 표시되는지 확인
- DTO 스키마에 프로퍼티 이름, 타입, required 여부, 설명, 예시가 표시되는지 확인
- Swagger UI에서 실제 API 호출(Try it out)이 동작하는지 확인
