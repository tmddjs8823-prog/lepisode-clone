import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SubItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
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

  mobileMenuOpen = false;
  activeDropdown: string | null = null;
  scrolled = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled = window.scrollY > 50;
    }
  }

  readonly navItems: NavItem[] = [
    {
      label: '회사 소개', path: '/about',
      children: [
        { label: '회사소개', path: '/about' },
        { label: '채용', path: '/careers' },
        { label: '블로그', path: '/blog' },
        { label: '개발 블로그', path: '/dev-blog' },
      ],
    },
    {
      label: '포트폴리오', path: '/portfolio',
      children: [
        { label: '포트폴리오', path: '/portfolio' },
        { label: '서비스 소개', path: '/services' },
      ],
    },
    { label: '작업현황', path: '/status' },
    {
      label: '지원사업', path: '/services',
      children: [
        { label: '지원사업 찾기', path: '/support-projects' },
      ],
    },
    { label: '마케팅·호스팅', path: '/marketing' },
    {
      label: '고객센터', path: '/faq',
      children: [
        { label: 'FAQ', path: '/faq' },
        { label: '공지사항', path: '/notice' },
        { label: '블로그', path: '/blog' },
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
  }
}
