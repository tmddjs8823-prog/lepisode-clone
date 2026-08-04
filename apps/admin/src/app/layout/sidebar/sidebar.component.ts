import { Component, signal, inject, input, output, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NAV_ITEMS } from '../../core/config/nav.config';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  navItems = NAV_ITEMS;
  currentUser = this.authService.currentUser;

  /** 모바일 드로어용 */
  closed = output<void>();

  private openMenus = signal<Set<string>>(new Set());

  ngOnInit(): void {
    // 초기 라우트 기반 펼침
    this.expandByUrl(this.router.url);

    // 라우트 변경 시 자동 펼침
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.expandByUrl(e.urlAfterRedirects));
  }

  /** 현재 URL에 해당하는 부모 메뉴 자동 펼침 */
  private expandByUrl(url: string): void {
    for (const item of this.navItems) {
      if (item.children?.some(child => child.route && url.startsWith(child.route))) {
        this.openMenus.update(set => {
          const next = new Set(set);
          next.add(item.label);
          return next;
        });
      }
    }
  }

  isOpen(label: string): boolean {
    return this.openMenus().has(label);
  }

  toggle(label: string) {
    this.openMenus.update(set => {
      const next = new Set(set);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  /** 네비 링크 클릭 시 모바일 드로어 닫기 */
  onNavClick(): void {
    this.closed.emit();
  }
}
