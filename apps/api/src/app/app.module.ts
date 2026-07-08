import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';

// Phase 2: 핵심 CRUD
import { PortfolioModule } from '../modules/portfolio/portfolio.module';
import { ServiceManageModule } from '../modules/service/service.module';
import { BlogModule } from '../modules/blog/blog.module';
import { NoticeModule } from '../modules/notice/notice.module';
import { FaqModule } from '../modules/faq/faq.module';
import { InquiryModule } from '../modules/inquiry/inquiry.module';
import { JobModule } from '../modules/job/job.module';
import { CompanyModule } from '../modules/company/company.module';

// Phase 3: 보조 Admin 모듈
import { SupportModule } from '../modules/support/support.module';
import { ContentModule } from '../modules/content/content.module';
import { MarketingModule } from '../modules/marketing/marketing.module';
import { I18nManageModule } from '../modules/i18n/i18n.module';
import { UserModule } from '../modules/user/user.module';

// Phase 4: 코디(Cody)
import { CodyModule } from '../modules/cody/cody.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/api/.env'],
    }),
    PrismaModule,
    AuthModule,
    // Phase 2
    PortfolioModule,
    ServiceManageModule,
    BlogModule,
    NoticeModule,
    FaqModule,
    InquiryModule,
    JobModule,
    CompanyModule,
    // Phase 3
    SupportModule,
    ContentModule,
    MarketingModule,
    I18nManageModule,
    UserModule,
    // Phase 4
    CodyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
