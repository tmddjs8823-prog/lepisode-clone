import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  imports: [RouterLink, RouterLinkActive],
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
  isHeroPage = false;
  isTransparentPage = false;

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      const url = e.urlAfterRedirects.split('?')[0]; // query string 제거
      this.isHome = url === '/' || url === '';
      this.isHeroPage = url === '/careers';
      this.isTransparentPage = url === '/support-projects' || url === '/marketing';
    });
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

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMenu() {
    this.mobileMenuOpen = false;
    this.activeDropdown = null;
  }

  openDropdown(label: string) {
    this.activeDropdown = label;
  }

  closeDropdown() {
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-group') && !target.closest('.mobile-nav')) {
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
