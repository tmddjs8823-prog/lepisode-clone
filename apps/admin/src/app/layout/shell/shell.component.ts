import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { AuthService } from '../../core/services/auth.service';
import { SchedulerApiService, SchedulerTask } from '../../shared/services/scheduler-api.service';

interface InquiryAlert {
  open: boolean;
  details: string[];
}

const DISMISS_KEY = 'inquiry-alert-dismissed';

@Component({
  selector: 'admin-shell',
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private schedulerApi = inject(SchedulerApiService);
  private router = inject(Router);
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastKnownRunAt: string | null = sessionStorage.getItem('inquiry-alert-last-run');

  currentUser = this.authService.currentUser;
  showUserMenu = signal(false);
  sidebarOpen = signal(false);
  scrolled = false;

  /** 미처리 문의 경고 다이얼로그 (글로벌) */
  inquiryAlert = signal<InquiryAlert>({ open: false, details: [] });

  ngOnInit(): void {
    if (!this.currentUser()) {
      this.authService.loadProfile().subscribe();
    }

    // 30초마다 미처리 문의 경고 체크
    this.checkInquiryAlert();
    this.pollTimer = setInterval(() => this.checkInquiryAlert(), 30000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  /** 오늘 하루 보지 않기가 설정되었는지 확인 */
  private isDismissedToday(): boolean {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (!dismissed) return false;
      const today = new Date().toISOString().slice(0, 10);
      return dismissed === today;
    } catch {
      return false;
    }
  }

  /** 스케줄러에서 미처리 문의 체크 결과를 폴링 */
  private checkInquiryAlert(): void {
    // 오늘 하루 보지 않기 설정 시 스킵
    if (this.isDismissedToday()) return;

    this.schedulerApi.getAll().subscribe({
      next: (tasks: SchedulerTask[]) => {
        const inquiryTask = tasks.find(t => t.taskKey === 'check-pending-inquiries');
        if (!inquiryTask?.lastMessage || inquiryTask.lastResult !== 'success') return;

        // 이전에 표시한 결과면 스킵
        if (inquiryTask.lastRunAt === this.lastKnownRunAt) return;
        this.lastKnownRunAt = inquiryTask.lastRunAt;
        sessionStorage.setItem('inquiry-alert-last-run', this.lastKnownRunAt!);

        // 수동 실행(즉시 실행) 시에는 다이얼로그 억제
        const manualRun = sessionStorage.getItem('inquiry-manual-run');
        if (manualRun) {
          sessionStorage.removeItem('inquiry-manual-run');
          return;
        }

        // 미처리가 있는지 체크
        const parts = inquiryTask.lastMessage.split(' · ');
        const hasIssue = parts.some(p => {
          const match = p.match(/(\d+)건/);
          return match && parseInt(match[1], 10) > 0;
        });

        if (hasIssue) {
          this.inquiryAlert.set({ open: true, details: parts });
        }
      },
      error: () => { /* 무시 — 인증 안 된 상태일 수 있음 */ },
    });
  }

  closeAlert(): void {
    this.inquiryAlert.set({ open: false, details: [] });
  }

  /** 문의 관리 페이지로 이동 */
  goToInquiries(): void {
    this.closeAlert();
    this.router.navigate(['/homepage/inquiries']);
  }

  /** 오늘 하루 보지 않기 */
  dismissToday(): void {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(DISMISS_KEY, today);
    } catch { /* localStorage 접근 불가 시 무시 */ }
    this.closeAlert();
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.scrolled = el.scrollTop > 10;
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
