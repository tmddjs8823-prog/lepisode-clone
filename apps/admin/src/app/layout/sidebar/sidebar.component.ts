import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../core/config/nav.config';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private authService = inject(AuthService);

  navItems = NAV_ITEMS;
  currentUser = this.authService.currentUser;

  private openMenus = signal<Set<string>>(new Set(['홈페이지 관리']));

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

  logout() {
    this.authService.logout();
  }
}
