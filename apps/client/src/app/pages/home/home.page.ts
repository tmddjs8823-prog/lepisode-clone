import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe, isPlatformBrowser } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ClientApiService,
  ServiceItem,
  PortfolioItem,
  NoticeItem,
  NaverBlogPost,
} from '../../shared/services/client-api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, NgClass, DatePipe, TranslatePipe, RichTextPipe],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage implements OnInit, OnDestroy {
  private api = inject(ClientApiService);
  private platformId = inject(PLATFORM_ID);
  i18n = inject(I18nService);

  /* ── JA 전용 홈 데이터 ── */
  readonly jaServices = [
    { icon: '🤖', titleKey: 'home_ja.svc.0.title', descKey: 'home_ja.svc.0.desc', tags: ['NLP', 'OCR'] },
    { icon: '🔷', titleKey: 'home_ja.svc.1.title', descKey: 'home_ja.svc.1.desc', tags: ['SaaS', 'B2B', 'ERP'] },
    { icon: '📱', titleKey: 'home_ja.svc.2.title', descKey: 'home_ja.svc.2.desc', tags: ['React', 'Flutter', 'API'] },
    { icon: '🏛️', titleKey: 'home_ja.svc.3.title', descKey: 'home_ja.svc.3.desc', tags: ['CRM', 'ERP', 'POS'] },
    { icon: '📣', titleKey: 'home_ja.svc.4.title', descKey: 'home_ja.svc.4.desc', tags: ['SNS', 'BI', 'SEO'] },
    { icon: '☁️', titleKey: 'home_ja.svc.5.title', descKey: 'home_ja.svc.5.desc', tags: ['AWS', 'GCP', 'DevOps'] },
  ];
  readonly jaStrengths = [
    { num: '200+', labelKey: 'home_ja.strength.0', icon: '📂' },
    { num: '7', labelKey: 'home_ja.strength.1', icon: '🏆' },
    { num: '50+', labelKey: 'home_ja.strength.2', icon: '👥' },
    { num: '24/7', labelKey: 'home_ja.strength.3', icon: '🛡️' },
  ];
  readonly jaProcesses = [
    { step: '01', titleKey: 'home_ja.process.0.title', descKey: 'home_ja.process.0.desc' },
    { step: '02', titleKey: 'home_ja.process.1.title', descKey: 'home_ja.process.1.desc' },
    { step: '03', titleKey: 'home_ja.process.2.title', descKey: 'home_ja.process.2.desc' },
    { step: '04', titleKey: 'home_ja.process.3.title', descKey: 'home_ja.process.3.desc' },
  ];

  /* ── 서비스 (상단 원스톱: 고정) ── */
  private readonly fallbackServices: ServiceItem[] = [
    { id: 901, title: 'AI 솔루션', sortOrder: 1, published: true },
    { id: 902, title: '플랫폼', sortOrder: 2, published: true },
    { id: 903, title: '비즈니스 솔루션', sortOrder: 3, published: true },
    { id: 904, title: '웹/앱 개발', sortOrder: 4, published: true },
    { id: 905, title: '키오스크', sortOrder: 5, published: true },
    { id: 906, title: '브랜딩/마케팅', sortOrder: 6, published: true },
  ];
  services = signal<ServiceItem[]>(this.fallbackServices);

  /* ── 서비스 소개 벨트 (하단: admin API 연동) ── */
  apiServices = signal<ServiceItem[]>([]);

  readonly serviceIcons = ['⚡', '🔷', '🏛️', '📱', '🖥️', '📊', '🔒', '☁️'];
  readonly serviceGradients = [
    'from-blue-50 to-indigo-100', 'from-purple-50 to-violet-100',
    'from-emerald-50 to-teal-100', 'from-orange-50 to-amber-100',
    'from-rose-50 to-pink-100', 'from-cyan-50 to-sky-100',
    'from-slate-50 to-gray-100', 'from-lime-50 to-green-100',
  ];
  readonly serviceEngLabels = [
    'AI Solutions', 'Platform', 'Business Solutions',
    'Web/App', 'Kiosk', 'Marketing', 'Security', 'Cloud',
  ];
  readonly iconThemes = ['purple', 'blue', 'green', 'orange', 'red', 'pink', 'purple', 'blue'];

  readonly serviceTags: string[][] = [
    ['자연어 처리', 'OCR', '자동화'],
    ['SaaS', 'B2B', 'ERP'],
    ['CRM', 'ERP', 'POS'],
    ['프론트엔드', '앱 개발', '설계'],
    ['키오스크', '결제 시스템'],
    ['SNS 마케팅', 'BI', '카탈로그'],
    ['보안 솔루션', '인증'],
    ['AWS', 'GCP', 'DevOps'],
  ];


  getServiceTags(index: number): string[] {
    return this.serviceTags[index % this.serviceTags.length];
  }

  /* ── 원스톱 자동 호버 ── */
  activeServiceIndex = signal(0);
  private autoHoverTimer: ReturnType<typeof setInterval> | null = null;
  private userHovering = false;
  private scrollSyncTimer: ReturnType<typeof setTimeout> | null = null;

  private startAutoHover(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.autoHoverTimer = setInterval(() => {
      if (!this.userHovering) {
        const total = this.services().length || 6;
        const nextIndex = (this.activeServiceIndex() + 1) % total;
        this.activeServiceIndex.set(nextIndex);
        this.scrollToCard(nextIndex);
      }
    }, 3000);
  }

  private scrollToCard(index: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const belt = document.querySelector('.onestop-belt') as HTMLElement;
    if (!belt) return;
    const cards = belt.querySelectorAll<HTMLElement>('.drag-card');
    const card = cards[index];
    if (!card) return;
    belt.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }

  /** 스크롤 종료 후 현재 보이는 카드로 activeServiceIndex 동기화 */
  onOnestopScroll(belt: HTMLElement): void {
    if (this.scrollSyncTimer) clearTimeout(this.scrollSyncTimer);
    this.scrollSyncTimer = setTimeout(() => {
      const cards = belt.querySelectorAll<HTMLElement>('.drag-card');
      if (!cards.length) return;
      const beltLeft = belt.scrollLeft;
      let closestIndex = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - beltLeft);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = i;
        }
      });
      this.activeServiceIndex.set(closestIndex);
      this.userHovering = false;
    }, 150);
  }

  onServiceEnter(index: number): void {
    this.userHovering = true;
    this.activeServiceIndex.set(index);
  }

  onServiceLeave(): void {
    this.userHovering = false;
  }

  ngOnDestroy(): void {
    if (this.autoHoverTimer) clearInterval(this.autoHoverTimer);
    this.langSub?.unsubscribe();
  }

  /* ── 포트폴리오 ── */
  portfolios = signal<PortfolioItem[]>([]);

  readonly demoPortfolios = [
    { title: '스마트 물류 관리 시스템', client: 'ABC 물류', icon: '📦', platforms: ['Web', 'iOS'] },
    { title: '온라인 쇼핑몰 리뉴얼', client: 'XYZ 커머스', icon: '🛒', platforms: ['Web', 'Android', 'iOS'] },
    { title: '기업 인트라넷 구축', client: 'DEF 그룹', icon: '🏗️', platforms: ['Web'] },
    { title: '예약 관리 플랫폼', client: 'GHI 서비스', icon: '📅', platforms: ['Web', 'Android'] },
    { title: '교육 콘텐츠 LMS', client: 'JKL 에듀', icon: '📚', platforms: ['Web', 'iOS'] },
    { title: '의료 데이터 대시보드', client: 'MNO 헬스', icon: '🏥', platforms: ['Web'] },
    { title: 'AI 챗봇 솔루션', client: 'PQR 테크', icon: '🤖', platforms: ['Web', 'API'] },
    { title: '브랜드 마케팅 플랫폼', client: 'STU 미디어', icon: '📣', platforms: ['Web', 'iOS'] },
  ];

  private translateService = inject(TranslateService);
  private prevIsJa = false;
  private langSub?: Subscription;

  ngOnInit(): void {
    this.prevIsJa = this.i18n.currentLang() === 'ja';

    this.langSub = this.translateService.onLangChange.subscribe(({ lang }) => {
      const nowIsJa = lang === 'ja';
      if (nowIsJa !== this.prevIsJa && isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      this.prevIsJa = nowIsJa;
    });

    this.loadServices();
    this.loadPortfolios();
    this.loadNotices();
    this.loadBlogs();
    this.startAutoHover();
  }

  private loadServices(): void {
    this.api.getServices().subscribe({
      next: (list) => {
        const published = list.filter(s => s.published);
        if (published.length > 0) {
          this.apiServices.set(published);
        }
      },
      error: () => { /* fallback: 빈 목록 */ },
    });
  }

  private loadPortfolios(): void {
    this.api.getPortfolios(8).subscribe({
      next: (list) => {
        const published = list.filter(p => p.published);
        this.portfolios.set(published);
      },
      error: () => { /* fallback: demoPortfolios 사용 */ },
    });
  }

  /* ── 공지사항 ── */
  notices = signal<NoticeItem[]>([]);

  private loadNotices(): void {
    this.api.getNotices(5).subscribe({
      next: (list) => {
        this.notices.set(list.filter(n => n.published));
      },
      error: () => { /* fallback: 빈 목록 */ },
    });
  }

  /* ── 블로그 (네이버 RSS 프록시) ── */
  blogPosts = signal<NaverBlogPost[]>([]);

  private loadBlogs(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getNaverBlogs().subscribe({
      next: (list) => this.blogPosts.set(list),
      error: () => { /* fallback: 빈 목록 */ },
    });
  }

  /* ── 드래그 스크롤 ── */
  private isDragging = false;
  private startX = 0;
  private scrollStart = 0;
  private dragMoved = false;
  private rafId = 0;

  dragStart(e: MouseEvent, el: HTMLElement): void {
    e.preventDefault();
    this.isDragging = true;
    this.dragMoved = false;
    this.startX = e.clientX;
    this.scrollStart = el.scrollLeft;
    el.style.userSelect = 'none';
  }

  dragMove(e: MouseEvent, el: HTMLElement): void {
    if (!this.isDragging) return;
    const dx = e.clientX - this.startX;

    // rAF로 스크롤 업데이트 → 프레임에 동기화
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      el.scrollLeft = this.scrollStart - dx;
    });

    // 5px 이상 이동 시 한번만 pointer-events 차단
    if (!this.dragMoved && Math.abs(dx) > 5) {
      this.dragMoved = true;
      el.classList.add('is-dragging');
    }
  }

  dragEnd(el: HTMLElement): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    cancelAnimationFrame(this.rafId);
    el.style.userSelect = '';

    if (this.dragMoved) {
      // 딜레이 후 클릭 허용 복원
      setTimeout(() => el.classList.remove('is-dragging'), 50);
    }
  }




  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loc(item: any, field: string): string {
    if (!item) return '';
    const lang = this.i18n.currentLang();
    if (lang === 'en') return String(item[field + 'En'] || item[field] || '');
    if (lang === 'ja') return String(item[field + 'Ja'] || item[field] || '');
    return String(item[field] || '');
  }
}
