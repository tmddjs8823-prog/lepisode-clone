import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CodyApiService, CodyProjectApiItem } from '../../shared/services/cody-api.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'admin-cody-project-detail-page',
  imports: [],
  templateUrl: './cody-project-detail.page.html',
})
export class CodyProjectDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private codyApi = inject(CodyApiService);
  private toast = inject(ToastService);

  item = signal<CodyProjectApiItem | null>(null);
  loading = signal(false);
  infoOpen = signal(true);

  readonly statusMap: Record<string, { label: string; class: string }> = {
    '대기': { label: '대기', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    '진행중': { label: '진행중', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    '진행': { label: '진행', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    '완료': { label: '완료', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    '보류': { label: '보류', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/cody/projects']); return; }
    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.loading.set(true);
    this.codyApi.getProjects(1, 999).subscribe({
      next: (res) => {
        const found = res.data.find(p => p.id === id) ?? null;
        this.item.set(found);
        this.loading.set(false);
        if (!found) this.toast.error('프로젝트를 찾을 수 없습니다.');
      },
      error: () => {
        this.toast.error('프로젝트 정보를 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  getStatusBadge(status: string): { label: string; class: string } {
    return this.statusMap[status] ?? { label: status, class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' };
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일`;
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  formatPeriod(): string {
    const p = this.item();
    if (!p || !p.startDate) return '-';
    return `${this.formatDate(p.startDate)} ~`;
  }

  goBack(): void {
    this.router.navigate(['/cody/projects']);
  }
}
