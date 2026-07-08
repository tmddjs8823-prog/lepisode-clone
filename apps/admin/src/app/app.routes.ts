import { Route } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { StubPage } from './pages/stub/stub.page';
import { NoticesPage } from './pages/notices/notices.page';
import { FaqPage } from './pages/faq/faq.page';
import { JobsPage } from './pages/jobs/jobs.page';
import { ServicesPage } from './pages/services/services.page';
import { InquiriesPage } from './pages/inquiries/inquiries.page';
import { SupportProjectsPage } from './pages/support/support-projects.page';
import { ProjectStatusesPage } from './pages/support/project-statuses.page';
import { PortfolioPage } from './pages/portfolio/portfolio.page';
import { MarketingConsentsPage } from './pages/marketing/marketing-consents.page';
import { MarketingCompaniesPage } from './pages/marketing/marketing-companies.page';
import { CertificatesPage } from './pages/certificates/certificates.page';
import { EventsPage } from './pages/events/events.page';
import { PopupsPage } from './pages/popups/popups.page';
import { QrPage } from './pages/qr/qr.page';
import { BlogPage } from './pages/blog/blog.page';
import { CompanyPage } from './pages/company/company.page';
import { TermsPage } from './pages/terms/terms.page';
import { SeoPage } from './pages/seo/seo.page';
import { I18nPage } from './pages/i18n/i18n.page';

export const appRoutes: Route[] = [
  // Login
  {
    path: 'login',
    component: LoginPage,
    canActivate: [loginGuard],
  },

  // Authenticated shell
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPage },

      // Homepage 관리
      // 포트폴리오 — 실제 구현
      { path: 'homepage/portfolio',  component: PortfolioPage },
      // 서비스 소개 — 실제 구현
      { path: 'homepage/services',          component: ServicesPage },
      { path: 'homepage/company',    component: CompanyPage },
      { path: 'homepage/blog',       component: BlogPage },
      // 공지사항 — 실제 구현
      { path: 'homepage/notices',          component: NoticesPage },
      // FAQ — 실제 구현
      { path: 'homepage/faq',              component: FaqPage },
      // 문의 내역 — 실제 구현
      { path: 'homepage/inquiries',        component: InquiriesPage },
      // 채용 — 실제 구현
      { path: 'homepage/jobs',             component: JobsPage },

      // Content
      // 인증서 — 실제 구현
      { path: 'content/certificates', component: CertificatesPage },
      // 이벤트 — 실제 구현
      { path: 'content/events',       component: EventsPage },
      // 팝업 — 실제 구현
      { path: 'content/popups',       component: PopupsPage },
      { path: 'content/terms',        component: TermsPage },
      // QR 코드 — 실제 구현
      { path: 'content/qr',          component: QrPage },

      // Support — 실제 구현
      { path: 'support/projects', component: SupportProjectsPage },
      { path: 'support/statuses', component: ProjectStatusesPage },

      // Marketing
      // 마케팅 수신동의 — 실제 구현
      { path: 'marketing/consents',   component: MarketingConsentsPage },
      { path: 'marketing/companies',  component: MarketingCompaniesPage },

      // Cody
      { path: 'cody/companies',     component: StubPage, data: { title: '코디 업체 관리' } },
      { path: 'cody/projects',      component: StubPage, data: { title: '코디 프로젝트' } },
      { path: 'cody/credits',       component: StubPage, data: { title: '크레딧' } },
      { path: 'cody/notifications', component: StubPage, data: { title: '알림' } },
      { path: 'cody/reports',       component: StubPage, data: { title: '주간 보고' } },

      // Users
      { path: 'users/admins', component: StubPage, data: { title: '관리자 계정' } },
      { path: 'users/roles',  component: StubPage, data: { title: '역할/권한' } },

      // Settings
      { path: 'settings/i18n', component: I18nPage },
      { path: 'settings/seo',  component: SeoPage },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];

