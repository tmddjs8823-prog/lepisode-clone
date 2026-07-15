import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobApiService, JobItem } from '../../shared/services/job-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-job-detail-page',
  imports: [DatePipe, FormsModule, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './job-detail.page.html',
})
export class JobDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(JobApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  item = signal<JobItem | null>(null);
  loading = signal(true);

  /* ── 아코디언 열기/닫기 상태 ── */
  detailOpen = signal(true);
  applicantOpen = signal(true);

  toggleDetail(): void { this.detailOpen.set(!this.detailOpen()); }
  toggleApplicant(): void { this.applicantOpen.set(!this.applicantOpen()); }

  /* ── 지원자 목록 (향후 확장용) ── */
  applicants = signal<Record<string, unknown>[]>([]);
  applicantLoading = signal(false);
  applicantTotal = signal(0);

  readonly applicantColumns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'name',     label: '이름',   align: 'center' },
    { key: 'email',    label: '이메일', align: 'center', width: '20%' },
    { key: 'phone',    label: '연락처', align: 'center', width: '12%' },
    { key: 'status',   label: '상태',   align: 'center', width: '8%', type: 'badge',
      badgeMap: {
        pending:  { label: '대기', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
        reviewed: { label: '검토', class: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
        accepted: { label: '합격', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        rejected: { label: '불합격', class: 'bg-red-500/10 text-red-400 border border-red-500/20' },
      },
    },
    { key: 'createdAt', label: '지원일', align: 'center', width: '10%', type: 'date' },
  ];

  /* ── 삭제 관련 상태 ── */
  deleteTarget = signal<JobItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/homepage/jobs']); return; }
    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.loading.set(true);
    this.api.getOne(id).subscribe({
      next: (data) => { this.item.set(data); this.loading.set(false); },
      error: () => { this.toast.error('채용 정보를 불러오지 못했습니다.'); this.loading.set(false); this.router.navigate(['/homepage/jobs']); },
    });
  }

  goBack(): void { this.router.navigate(['/homepage/jobs']); }

  /* ── 수정 (목록으로 이동 후 수정 모달) ── */
  onEdit(): void {
    this.router.navigate(['/homepage/jobs']);
  }

  /* ── 삭제 처리 ── */
  onDelete(): void { this.deleteTarget.set(this.item()); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.api.remove(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleting.set(false); this.goBack(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }

  /* ── 지원자 엑셀 내보내기 ── */
  onExportApplicantExcel(): void {
    this.excel.export(this.applicants(), [
      { key: 'name', header: '이름' },
      { key: 'email', header: '이메일' },
      { key: 'phone', header: '연락처' },
      { key: 'status', header: '상태' },
      { key: 'createdAt', header: '지원일' },
    ], '지원자목록');
  }
}