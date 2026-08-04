import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchedulerApiService, SchedulerTask } from '../../shared/services/scheduler-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'admin-scheduler-page',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './scheduler.page.html',
})
export class SchedulerPage implements OnInit, OnDestroy {
  private api = inject(SchedulerApiService);
  private toast = inject(ToastService);
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  tasks = signal<SchedulerTask[]>([]);
  loading = signal(false);

  readonly hourOptions = Array.from({ length: 24 }, (_, i) => i);    // 0~23
  readonly minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,10...55

  ngOnInit(): void {
    this.loadTasks();
    this.pollTimer = setInterval(() => this.loadTasks(true), 30000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  loadTasks(silent = false): void {
    if (!silent) this.loading.set(true);
    this.api.getAll().subscribe({
      next: (list) => { this.tasks.set(list); this.loading.set(false); },
      error: () => { if (!silent) this.toast.error('스케줄 목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  toggle(task: SchedulerTask): void {
    this.api.toggle(task.taskKey).subscribe({
      next: (res) => {
        this.toast.success(res.enabled ? `${task.name} 활성화됨` : `${task.name} 비활성화됨`);
        this.loadTasks(true);
      },
      error: () => this.toast.error('상태 변경 실패'),
    });
  }

  runNow(task: SchedulerTask): void {
    // 즉시 실행 시 Shell 알림 다이얼로그 억제 플래그 설정
    if (task.taskKey === 'check-pending-inquiries') {
      sessionStorage.setItem('inquiry-manual-run', 'true');
    }
    this.api.runNow(task.taskKey).subscribe({
      next: (res) => {
        this.toast.success(`실행 완료: ${res.message}`);
        this.loadTasks(true);
      },
      error: () => this.toast.error('실행 실패'),
    });
  }

  getHour(cron: string): number {
    const h = parseInt(cron.split(' ')[1], 10);
    return isNaN(h) ? 0 : h;
  }

  getMinute(cron: string): number {
    const m = parseInt(cron.split(' ')[0], 10);
    return isNaN(m) ? 0 : m;
  }

  onHourChange(task: SchedulerTask, hour: number): void {
    this.saveCron(task, hour, this.getMinute(task.cronExpr));
  }

  onMinuteChange(task: SchedulerTask, minute: number): void {
    this.saveCron(task, this.getHour(task.cronExpr), minute);
  }

  private saveCron(task: SchedulerTask, hour: number, minute: number): void {
    const cron = `${minute} ${hour} * * *`;
    const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    this.api.updateCron(task.taskKey, cron).subscribe({
      next: () => {
        this.toast.success(`실행 시간: 매일 ${label}`);
        this.loadTasks();
      },
      error: () => this.toast.error('시간 변경 실패'),
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}
