import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SupportApiService,
  ProjectStatusItem,
  ProjectStatusType,
} from '../../shared/services/support-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const STATUS_META: Record<ProjectStatusType, { label: string; class: string }> = {
  ESTIMATING:  { label: '견적 중',   class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  IN_PROGRESS: { label: '진행 중',   class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  COMPLETE:    { label: '납품완료',  class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
};

@Component({
  selector: 'admin-project-status-detail-page',
  imports: [DatePipe, NgClass, FormsModule, ConfirmDialogComponent],
  templateUrl: './project-status-detail.page.html',
})
export class ProjectStatusDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(SupportApiService);
  private toast = inject(ToastService);

  item = signal<ProjectStatusItem | null>(null);
  loading = signal(true);

  /* 메모 인라인 편집 */
  editingMemo = signal(false);
  memoValue = signal('');

  /* 삭제 */
  deleteTarget = signal<ProjectStatusItem | null>(null);
  deleting = signal(false);

  /* 수정 서랍 */
  showForm = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/support/statuses']); return; }
    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.loading.set(true);
    this.api.getStatus(id).subscribe({
      next: (data) => { this.item.set(data); this.loading.set(false); },
      error: () => { this.toast.error('현황 정보를 불러오지 못했습니다.'); this.loading.set(false); this.router.navigate(['/support/statuses']); },
    });
  }

  goBack(): void { this.router.navigate(['/support/statuses']); }

  getStatusMeta(s: ProjectStatusType) { return STATUS_META[s]; }

  /* 메모 인라인 편집 */
  startEditMemo(): void {
    this.memoValue.set(this.item()?.memo ?? '');
    this.editingMemo.set(true);
  }

  saveMemo(): void {
    const current = this.item();
    if (!current) return;
    this.api.updateStatus(current.id, { memo: this.memoValue() }).subscribe({
      next: (updated) => {
        this.item.set(updated);
        this.editingMemo.set(false);
        this.toast.success('메모가 저장되었습니다.');
      },
      error: () => this.toast.error('메모 저장에 실패했습니다.'),
    });
  }

  cancelEditMemo(): void { this.editingMemo.set(false); }

  /* 삭제 */
  onDelete(): void { this.deleteTarget.set(this.item()); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.api.removeStatus(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleting.set(false); this.goBack(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
