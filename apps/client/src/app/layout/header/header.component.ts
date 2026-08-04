import { Component, HostListener, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService, LANGUAGES, Lang } from '../../shared/services/i18n.service';

interface SubItem {
  label: string;
  i18nKey?: string;
  path: string;
  external?: boolean;
}

interface NavItem {
  label: string;
  i18nKey?: string;
  path: string;
  children?: SubItem[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  i18n = inject(I18nService);
  languages = LANGUAGES;

  mobileMenuOpen = false;
  activeDropdown: string | null = null;
  scrolled = false;
  isHome = true;
  currentUrl = signal('/');
  isHeroPage = false;
  isTransparentPage = false;

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      const url = e.urlAfterRedirects.split('?')[0]; // query string 제거
      this.currentUrl.set(url);
      this.isHome = url === '/' || url === '';
      this.isHeroPage = url === '/careers';
      this.isTransparentPage = url === '/support-projects' || url === '/marketing';
    });
  }

  /** 하위메뉴 아이템이 현재 페이지에 해당하는지 */
  isSubActive(sub: SubItem): boolean {
    const url = this.currentUrl();
    return !sub.external && url.startsWith(sub.path);
  }

  /** 부모 메뉴가 현재 페이지를 포함하는지 */
  isParentActive(item: NavItem): boolean {
    const url = this.currentUrl();
    if (item.children) {
      return item.children.some(sub => !sub.external && url.startsWith(sub.path));
    }
    return item.path !== '/' && url.startsWith(item.path);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled = window.scrollY > 50;
    }
  }

  readonly navItems: NavItem[] = [
    {
      label: '회사 소개', i18nKey: 'nav.about', path: '/about',
      children: [
        { label: '회사소개', i18nKey: 'nav.about.intro', path: '/about' },
        { label: '채용', i18nKey: 'nav.about.careers', path: '/careers' },
        { label: '블로그', i18nKey: 'nav.about.blog', path: '/blog' },
        { label: '개발 블로그', i18nKey: 'nav.about.techblog', path: 'https://techblog.lepisode.kr/', external: true },
      ],
    },
    {
      label: '포트폴리오', i18nKey: 'nav.portfolio', path: '/portfolio',
      children: [
        { label: '포트폴리오', i18nKey: 'nav.portfolio.list', path: '/portfolio' },
        { label: '서비스 소개', i18nKey: 'nav.portfolio.services', path: '/services' },
      ],
    },
    { label: '작업현황', i18nKey: 'nav.status', path: '/status' },
    {
      label: '지원사업', i18nKey: 'nav.support', path: '/services',
      children: [
        { label: '지원사업 찾기', i18nKey: 'nav.support.find', path: '/support-projects' },
      ],
    },
    { label: '마케팅·호스팅', i18nKey: 'nav.marketing', path: '/marketing' },
    {
      label: '고객센터', i18nKey: 'nav.cs', path: '/faq',
      children: [
        { label: 'FAQ', i18nKey: 'nav.cs.faq', path: '/faq' },
        { label: '공지사항', i18nKey: 'nav.cs.notice', path: '/notice' },
        { label: '이벤트', i18nKey: 'nav.cs.event', path: '/events' },
      ],
    },
  ];

  toggleMenu(event?: Event) {
    event?.stopPropagation();
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.langDropdownOpen = false;
    // 드로어 열 때 현재 라우트 기반 부모 메뉴 자동 펼침
    if (this.mobileMenuOpen) {
      this.activeDropdown = this.getActiveParentLabel();
    } else {
      this.activeDropdown = null;
    }
    this.updateBodyScroll();
  }

  closeMenu() {
    this.mobileMenuOpen = false;
    this.activeDropdown = null;
    this.langDropdownOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
    }
  }

  private dropdownTimer: ReturnType<typeof setTimeout> | null = null;

  openDropdown(label: string) {
    if (this.dropdownTimer) { clearTimeout(this.dropdownTimer); this.dropdownTimer = null; }
    this.activeDropdown = label;
  }

  /** 마우스 이탈 시 — 딜레이 적용 */
  closeDropdown() {
    if (this.dropdownTimer) clearTimeout(this.dropdownTimer);
    this.dropdownTimer = setTimeout(() => {
      this.activeDropdown = null;
      this.dropdownTimer = null;
    }, 30);
  }

  /** 클릭 시 — 즉시 닫기 */
  closeDropdownNow() {
    if (this.dropdownTimer) { clearTimeout(this.dropdownTimer); this.dropdownTimer = null; }
    this.activeDropdown = null;
  }

  toggleDesktopDropdown(label: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === label ? null : label;
  }

  toggleMobileDropdown(label: string) {
    this.activeDropdown = this.activeDropdown === label ? null : label;
  }

  /** 현재 URL에 해당하는 부모 navItem label 반환 */
  private getActiveParentLabel(): string | null {
    const url = this.router.url.split('?')[0];
    for (const item of this.navItems) {
      if (item.children?.some(sub => url.startsWith(sub.path))) {
        return item.label;
      }
      if (item.path && url.startsWith(item.path) && item.path !== '/') {
        return item.label;
      }
    }
    return null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // 모바일 드로어가 열려있으면 document click으로 드롭다운 닫지 않음
    if (this.mobileMenuOpen) return;

    const target = event.target as HTMLElement;
    if (!target.closest('.nav-group') && !target.closest('.mobile-drawer')) {
      this.activeDropdown = null;
    }
    if (!target.closest('.lang-dropdown-wrap')) {
      this.langDropdownOpen = false;
    }
  }

  /* 언어 드롭다운 */
  langDropdownOpen = false;

  toggleLangDropdown(event: Event): void {
    event.stopPropagation();
    this.langDropdownOpen = !this.langDropdownOpen;
  }

  selectLang(lang: Lang): void {
    this.i18n.setLang(lang);
    this.langDropdownOpen = false;
  }
}
