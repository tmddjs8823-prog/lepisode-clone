import { Component, OnInit, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClientApiService, ProjectStatusItem } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-status-page',
  standalone: true,
  imports: [],
  templateUrl: './status.page.html',
})
export class StatusPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);

  allStatuses = signal<ProjectStatusItem[]>([]);
  activeTab = signal('모두');

  readonly tabs = ['모두', '웹', '앱'];

  filtered = computed(() => {
    const tab = this.activeTab();
    const all = this.allStatuses();
    if (tab === '모두') return all;
    return all.filter(item =>
      item.platforms?.some(p => p === tab) ?? false
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

  formatPeriod(start?: string, end?: string): string {
    const fmt = (d?: string) => {
      if (!d) return '';
      const date = new Date(d);
      return `${String(date.getFullYear()).slice(2)}년 ${String(date.getMonth() + 1).padStart(2, '0')}월`;
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
    switch (status) {
      case 'ESTIMATING': return '견적중';
      case 'IN_PROGRESS': return '진행중';
      case 'ANSWERED': return '답변완료';
      case 'COMPLETE': return '납품완료';
      default: return status;
    }
  }
}
