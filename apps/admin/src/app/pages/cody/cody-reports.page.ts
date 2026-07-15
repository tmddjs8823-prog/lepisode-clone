import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CodyApiService, CodyReportApiItem } from '../../shared/services/cody-api.service';

export interface CodyReportListItem {
  id: number;
  companyName: string;
  projectName: string;
  title: string;
  period: string;
  createdAt: string;
}

@Component({
  selector: 'admin-cody-reports-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './cody-reports.page.html',
})
export class CodyReportsPage implements OnInit {
  private router = inject(Router);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private codyApi = inject(CodyApiService);

  data = signal<CodyReportListItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'companyName', label: '기업', align: 'center', width: '9rem' },
    { key: 'projectName', label: '프로젝트', align: 'center', width: '9rem' },
    { key: 'title', label: '제목', align: 'center' },
    { key: 'period', label: '기간', align: 'center', width: '14rem' },
    { key: 'createdAt', label: '등록일시', align: 'center', width: '7.5rem', type: 'date' },
  ];

  /* ── 삭제 ── */
  deleteTarget = signal<CodyReportListItem | null>(null);
  deleting = signal(false);

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void {
    this.loadData();
  }

  onSearch(term?: string): void { this.searchTerm.set(term || ''); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'companyName', header: '기업' },
      { key: 'projectName', header: '프로젝트' },
      { key: 'title', header: '제목' },
      { key: 'period', header: '기간' },
      { key: 'createdAt', header: '등록일시' },
    ], '주간보고');
  }

  loadData(): void {
    this.loading.set(true);
    this.codyApi.getReports(this.page(), this.limit()).subscribe({
      next: (res) => {
        this.data.set(res.data.map(this.mapToListItem));
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('주간 보고 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  private mapToListItem(r: CodyReportApiItem): CodyReportListItem {
    const s = r.periodStart ? r.periodStart.substring(0, 10) : '';
    const e = r.periodEnd ? r.periodEnd.substring(0, 10) : '';
    return {
      id: r.id,
      companyName: r.company?.name ?? '',
      projectName: r.project?.name ?? '',
      title: r.title,
      period: s && e ? `${s} ~ ${e}` : s || e || '-',
      createdAt: r.createdAt,
    };
  }

  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  openCreate(): void {
    this.router.navigate(['/cody/reports/new']);
  }

  onEdit(item: CodyReportListItem): void {
    this.router.navigate(['/cody/reports', item.id]);
  }

  onDelete(item: CodyReportListItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.codyApi.removeReport(t.id).subscribe({
      next: () => {
        this.toast.success('삭제되었습니다.');
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error('삭제에 실패했습니다.');
        this.deleting.set(false);
      },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
