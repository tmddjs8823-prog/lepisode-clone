import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ClientApiService,
  ServiceItem,
  PortfolioItem,
  NoticeItem,
} from '../../shared/services/client-api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { HomeJaComponent } from './ja/home-ja.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, NgClass, DatePipe, HomeJaComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage implements OnInit {
  private api = inject(ClientApiService);
  private platformId = inject(PLATFORM_ID);
  i18n = inject(I18nService);

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

  /* ── 포트폴리오 ── */
  portfolios = signal<PortfolioItem[]>([]);

  readonly demoPortfolios = [
    { title: '스마트 물류 관리 시스템', client: 'ABC 물류', icon: '📦', platforms: ['웹', 'iOS'] },
    { title: '온라인 쇼핑몰 리뉴얼', client: 'XYZ 커머스', icon: '🛒', platforms: ['웹', '안드로이드', 'iOS'] },
    { title: '기업 인트라넷 구축', client: 'DEF 그룹', icon: '🏗️', platforms: ['웹'] },
    { title: '예약 관리 플랫폼', client: 'GHI 서비스', icon: '📅', platforms: ['웹', '안드로이드'] },
    { title: '교육 콘텐츠 LMS', client: 'JKL 에듀', icon: '📚', platforms: ['웹', 'iOS'] },
    { title: '의료 데이터 대시보드', client: 'MNO 헬스', icon: '🏥', platforms: ['웹'] },
    { title: 'AI 챗봇 솔루션', client: 'PQR 테크', icon: '🤖', platforms: ['웹', 'API'] },
    { title: '브랜드 마케팅 플랫폼', client: 'STU 미디어', icon: '📣', platforms: ['웹', 'iOS'] },
  ];

  ngOnInit(): void {
    this.loadServices();
    this.loadPortfolios();
    this.loadNotices();
    this.loadBlogs();
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

  /* ── 블로그 (JSON 파일에서 로드, admin 비연동) ── */
  private http = inject(HttpClient);
  blogPosts = signal<{ title: string; category: string; icon: string; gradient: string; url: string; thumbnail: string }[]>([]);

  private loadBlogs(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.http.get<{ title: string; category: string; icon: string; gradient: string; url: string; thumbnail: string }[]>('/data/blog-posts.json').subscribe({
      next: (list) => this.blogPosts.set(list),
      error: () => { /* fallback: 빈 목록 */ },
    });
  }

  /* ── 드래그 스크롤 ── */
  private isDragging = false;
  private startX = 0;
  private scrollStart = 0;

  dragStart(e: MouseEvent, el: HTMLElement): void {
    e.preventDefault();
    this.isDragging = true;
    this.startX = e.clientX;
    this.scrollStart = el.scrollLeft;
  }

  dragMove(e: MouseEvent, el: HTMLElement): void {
    if (!this.isDragging) return;
    const dx = e.clientX - this.startX;
    el.scrollLeft = this.scrollStart - dx;
    // 5px 이상 이동하면 드래그로 판정 → 링크 클릭 차단
    if (Math.abs(dx) > 5) {
      el.querySelectorAll('.blog-card').forEach((a) => {
        (a as HTMLElement).style.pointerEvents = 'none';
      });
    }
  }

  dragEnd(el: HTMLElement): void {
    this.isDragging = false;
    // 약간 딜레이 후 pointer-events 복원
    setTimeout(() => {
      el.querySelectorAll('.blog-card').forEach((a) => {
        (a as HTMLElement).style.pointerEvents = '';
      });
    }, 50);
  }
}
