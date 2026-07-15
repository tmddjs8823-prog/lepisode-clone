import { Route } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { StubPage } from './pages/stub/stub.page';
import { NoticesPage } from './pages/notices/notices.page';
import { NoticeDetailPage } from './pages/notices/notice-detail.page';
import { FaqPage } from './pages/faq/faq.page';
import { JobsPage } from './pages/jobs/jobs.page';
import { JobDetailPage } from './pages/jobs/job-detail.page';
import { ServicesPage } from './pages/services/services.page';
import { ServiceDetailPage } from './pages/services/service-detail.page';
import { InquiriesPage } from './pages/inquiries/inquiries.page';
import { SupportProjectsPage } from './pages/support/support-projects.page';
import { ProjectStatusesPage } from './pages/support/project-statuses.page';
import { WeeklyReportFormPage } from './pages/support/weekly-report-form.page';
import { PortfolioPage } from './pages/portfolio/portfolio.page';
import { PortfolioDetailPage } from './pages/portfolio/portfolio-detail.page';
import { MarketingConsentsPage } from './pages/marketing/marketing-consents.page';
import { MarketingCompaniesPage } from './pages/marketing/marketing-companies.page';
import { CertificatesPage } from './pages/certificates/certificates.page';
import { EventsPage } from './pages/events/events.page';
import { EventDetailPage } from './pages/events/event-detail.page';
import { PopupsPage } from './pages/popups/popups.page';
import { QrPage } from './pages/qr/qr.page';
import { BlogPage } from './pages/blog/blog.page';
import { CompanyPage } from './pages/company/company.page';
import { TermsPage } from './pages/terms/terms.page';
import { SeoPage } from './pages/seo/seo.page';
import { I18nPage } from './pages/i18n/i18n.page';
import { RolesPage } from './pages/users/roles.page';
import { MenuPermsPage } from './pages/users/menu-perms.page';
import { CodyCompaniesPage } from './pages/cody/cody-companies.page';
import { CodyProjectsPage } from './pages/cody/cody-projects.page';
import { CodyCreditsPage } from './pages/cody/cody-credits.page';
import { AdminsPage } from './pages/users/admins.page';
import { CodyNotificationsPage } from './pages/cody/cody-notifications.page';
import { CodyReportsPage } from './pages/cody/cody-reports.page';
import { CodyReportDetailPage } from './pages/cody/cody-report-detail.page';

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
      { path: 'homepage/portfolio/:id', component: PortfolioDetailPage },
      // 서비스 소개 — 실제 구현
      { path: 'homepage/services',          component: ServicesPage },
      { path: 'homepage/services/:id',      component: ServiceDetailPage },
      { path: 'homepage/company',    component: CompanyPage },
      { path: 'homepage/blog',       component: BlogPage },
      // 공지사항 — 실제 구현
      { path: 'homepage/notices',          component: NoticesPage },
      { path: 'homepage/notices/:id',      component: NoticeDetailPage },
      // FAQ — 실제 구현
      { path: 'homepage/faq',              component: FaqPage },
      // 문의 내역 — 실제 구현
      { path: 'homepage/inquiries',        component: InquiriesPage },
      // 채용 — 실제 구현
      { path: 'homepage/jobs',             component: JobsPage },
      { path: 'homepage/jobs/:id',          component: JobDetailPage },

      // Content
      // 인증서 — 실제 구현
      { path: 'content/certificates', component: CertificatesPage },
      // 이벤트 — 실제 구현
      { path: 'content/events',       component: EventsPage },
      { path: 'content/events/:id',    component: EventDetailPage },
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
      { path: 'cody/companies',     component: CodyCompaniesPage },
      { path: 'cody/projects',      component: CodyProjectsPage },
      { path: 'cody/credits',       component: CodyCreditsPage },
      { path: 'cody/notifications', component: CodyNotificationsPage },
      { path: 'cody/reports',       component: CodyReportsPage },
      { path: 'cody/reports/:id',    component: CodyReportDetailPage },
      { path: 'cody/weekly-report/new', component: WeeklyReportFormPage },

      // Users
      { path: 'users/admins', component: AdminsPage },
      { path: 'users/roles',  component: RolesPage },
      { path: 'users/menus',  component: MenuPermsPage },

      // Settings
      { path: 'settings/i18n', component: I18nPage },
      { path: 'settings/seo',  component: SeoPage },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];

