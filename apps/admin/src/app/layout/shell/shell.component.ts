import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'admin-shell',
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent implements OnInit {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  showUserMenu = signal(false);

  ngOnInit(): void {
    // 새로고침 시 currentUser가 null이면 프로필 로드
    if (!this.currentUser()) {
      this.authService.loadProfile().subscribe();
    }
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
