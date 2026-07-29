import { Component, OnInit, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClientApiService, ProjectStatusItem } from '../../shared/services/client-api.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-status-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './status.page.html',
})
export class StatusPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);
  private translate = inject(TranslateService);

  allStatuses = signal<ProjectStatusItem[]>([]);
  activeTab = signal('all');

  readonly tabKeys = ['all', 'web', 'app'];

  filtered = computed(() => {
    const tab = this.activeTab();
    const all = this.allStatuses();
    if (tab === 'all') return all;
    if (tab === 'web') {
      return all.filter(item => item.platforms?.some(p => p.toLowerCase() === 'web') ?? false);
    }
    // app: Android, iOS, App
    const appPlatforms = ['android', 'ios', 'app'];
    return all.filter(item =>
      item.platforms?.some(p => appPlatforms.includes(p.toLowerCase())) ?? false
    );
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getStatuses().subscribe({
      next: (list) => this.allStatuses.set(Array.isArray(list) ? list : []),
      error: () => this.allStatuses.set([]),
    });
  }

  selectTab(tab: string): void {
    this.activeTab.set(tab);
  }

  getTabLabel(key: string): string {
    return this.translate.instant('status.tab_' + key);
  }

  formatPeriod(start?: string, end?: string): string {
    const lang = this.i18n.currentLang();
    const fmt = (d?: string) => {
      if (!d) return '';
      const date = new Date(d);
      const y = String(date.getFullYear()).slice(2);
      const m = String(date.getMonth() + 1).padStart(2, '0');
      if (lang === 'ja') return `${y}年 ${m}月`;
      if (lang === 'en') return `${date.getFullYear()}.${m}`;
      return `${y}년 ${m}월`;
    };
    const s = fmt(start);
    const e = fmt(end);
    if (s && e) return `${s} ~ ${e}`;
    if (s) return `${s} ~`;
    return '';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ESTIMATING': return 'text-[#41539b] border-[#41539b]';
      case 'IN_PROGRESS': return 'text-gray-500 border-gray-500';
      case 'ANSWERED': return 'text-green-600 border-green-600';
      case 'COMPLETE': return 'text-green-600 border-green-600';
      default: return 'text-gray-400 border-gray-400';
    }
  }

  getStatusLabel(status: string): string {
    const keyMap: Record<string, string> = {
      ESTIMATING: 'status.estimating',
      IN_PROGRESS: 'status.in_progress',
      ANSWERED: 'status.answered',
      COMPLETE: 'status.delivered',
    };
    const key = keyMap[status];
    if (key) return this.translate.instant(key);
    return status;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loc(item: any, field: string): string {
    if (!item) return '';
    const lang = this.i18n.currentLang();
    if (lang === 'en') return String(item[field + 'En'] || item[field] || '');
    if (lang === 'ja') return String(item[field + 'Ja'] || item[field] || '');
    return String(item[field] || '');
  }
}
