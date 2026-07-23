import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomePage } from './pages/home/home.page';
import { AboutPage } from './pages/about/about.page';
import { ServicesPage } from './pages/services/services.page';
import { PortfolioPage } from './pages/portfolio/portfolio.page';
import { PortfolioDetailPage } from './pages/portfolio/portfolio-detail.page';
import { BlogPage } from './pages/blog/blog.page';
import { StatusPage } from './pages/status/status.page';
import { FaqPage } from './pages/faq/faq.page';
import { NoticePage } from './pages/notice/notice.page';
import { NoticeDetailPage } from './pages/notice/notice-detail.page';
import { CareersPage } from './pages/careers/careers.page';
import { ConsultPage } from './pages/consult/consult.page';
import { SupportProjectsPage } from './pages/support-projects/support-projects.page';
import { MarketingPage } from './pages/marketing/marketing.page';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '',          component: HomePage },
      { path: 'about',     component: AboutPage },
      { path: 'services',  component: ServicesPage },
      { path: 'portfolio', component: PortfolioPage },
      { path: 'portfolio/:id', component: PortfolioDetailPage },
      { path: 'blog',      component: BlogPage },
      { path: 'status',    component: StatusPage },
      { path: 'faq',       component: FaqPage },
      { path: 'notice',    component: NoticePage },
      { path: 'notice/:id', component: NoticeDetailPage },
      { path: 'careers',   component: CareersPage },
      { path: 'consult',   component: ConsultPage },
      { path: 'support-projects', component: SupportProjectsPage },
      { path: 'marketing', component: MarketingPage },
    ],
  },
  { path: '**', redirectTo: '' },
];
