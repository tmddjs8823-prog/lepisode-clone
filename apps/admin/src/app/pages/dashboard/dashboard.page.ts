import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { HealthApiService, HealthCheckResult, HealthServerInfo } from '../../shared/services/health-api.service';

@Component({
  selector: 'admin-dashboard',
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit, OnDestroy {
  private healthApi = inject(HealthApiService);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  health = signal<HealthCheckResult | null>(null);
  healthLoading = signal(false);
  healthError = signal('');
  lastChecked = signal('');

  /** info 안의 server 객체를 안전하게 추출 */
  private serverInfo = computed<HealthServerInfo | null>(() => {
    const h = this.health();
    if (!h?.info?.['server']) return null;
    return h.info['server'] as HealthServerInfo;
  });

  overallStatus = computed(() => this.health()?.status === 'ok' ? '정상' : '이상 감지');
  overallIcon = computed(() => {
    const h = this.health();
    if (!h) return '⏳';
    return h.status === 'ok' ? '🟢' : '🔴';
  });

  dbStatus = computed(() => {
    const s = this.health()?.info?.['database'] as { status: string } | undefined;
    return s?.status ?? 'down';
  });

  heapStatus = computed(() => {
    const s = this.health()?.info?.['memory_heap'] as { status: string } | undefined;
    return s?.status ?? 'down';
  });

  rssStatus = computed(() => {
    const s = this.health()?.info?.['memory_rss'] as { status: string } | undefined;
    return s?.status ?? 'down';
  });

  diskStatus = computed(() => {
    const s = this.health()?.info?.['disk'] as { status: string } | undefined;
    return s?.status ?? 'down';
  });

  pid = computed(() => this.serverInfo()?.pid ?? '-');
  nodeVersion = computed(() => this.serverInfo()?.nodeVersion ?? '-');
  uptime = computed(() => this.formatUptime(this.serverInfo()?.uptime ?? 0));
  heapUsed = computed(() => this.serverInfo()?.memoryUsage?.heapUsed ?? 0);
  heapTotal = computed(() => this.serverInfo()?.memoryUsage?.heapTotal ?? 0);
  rssMb = computed(() => this.serverInfo()?.memoryUsage?.rss ?? 0);

  memoryPercent = computed(() => {
    const total = this.heapTotal();
    if (total === 0) return 0;
    return Math.round((this.heapUsed() / total) * 100);
  });

  memoryColor = computed(() => {
    const pct = this.memoryPercent();
    if (pct >= 80) return 'bg-red-500';
    if (pct >= 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  });

  ngOnInit(): void {
    this.checkHealth();
    this.refreshTimer = setInterval(() => this.checkHealth(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  checkHealth(): void {
    this.healthLoading.set(true);
    this.healthError.set('');

    this.healthApi.check().subscribe({
      next: (result) => {
        this.health.set(result);
        this.healthLoading.set(false);
        this.lastChecked.set(new Date().toLocaleTimeString('ko-KR'));
      },
      error: () => {
        this.healthError.set('서버에 연결할 수 없습니다.');
        this.healthLoading.set(false);
        this.lastChecked.set(new Date().toLocaleTimeString('ko-KR'));
      },
    });
  }

  formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}일 ${h}시간 ${m}분`;
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
  }

  getStatusIcon(status: string): string {
    return status === 'up' ? '🟢' : '🔴';
  }
}
