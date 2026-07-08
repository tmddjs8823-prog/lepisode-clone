import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InquiryApiService, InquiryItem, InquiryStatus } from '../../shared/services/inquiry-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

const STATUS_META: Record<InquiryStatus, { label: string; class: string }> = {
  PENDING:     { label: '접수',    class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  IN_PROGRESS: { label: '처리중',  class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  COMPLETED:   { label: '완료',    class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELLED:   { label: '취소',    class: 'bg-slate-700/50 text-slate-400 border-slate-600/30' },
};

@Component({
  selector: 'admin-inquiries-page',
  imports: [FormsModule, DatePipe, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './inquiries.page.html',
})
export class InquiriesPage implements OnInit {
  private inquiryApi = inject(InquiryApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  readonly statusMeta = STATUS_META;
  readonly statusOptions: InquiryStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  data = signal<InquiryItem[]>([]);
  total = signal(0);
  page = signal(1);
  readonly limit = 10;
  loading = signal(false);
  filterStatus = signal<InquiryStatus | ''>('');

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: 'No.', align: 'center', width: '4rem' },
    {
      key: 'name', label: '이름 / 회사', align: 'left',
      transform: (row) => {
        const r = row as unknown as InquiryItem;
        return r.company ? `${r.name} (${r.company})` : r.name;
      },
    },
    { key: 'email', label: '이메일', align: 'left' },
    { key: 'projectType', label: '프로젝트 유형', align: 'left', width: '7rem' },
    {
      key: 'status', label: '상태', align: 'center', width: '5rem', type: 'badge',
      badgeMap: {
        PENDING:     { label: '접수', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
        IN_PROGRESS: { label: '처리중', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
        COMPLETED:   { label: '완료', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        CANCELLED:   { label: '취소', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'createdAt', label: '접수일', align: 'left', width: '7rem', type: 'date' },
  ];

  // 상세 / 상태 변경
  selectedItem = signal<InquiryItem | null>(null);
  editStatus = signal<InquiryStatus>('PENDING');
  editMemo = signal('');
  updating = signal(false);

  // 삭제
  deleteTarget = signal<InquiryItem | null>(null);
  deleting = signal(false);

  totalPages = computed(() => Math.ceil(this.total() / this.limit));
  pages = computed(() => {
    const cur = this.page(), total = this.totalPages(), delta = 2;
    const list: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) list.push(i);
    return list;
  });

  ngOnInit(): void { this.loadData(); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'name', header: '이름' },
      { key: 'email', header: '이메일' },
      { key: 'phone', header: '전화번호' },
      { key: 'content', header: '문의 내용' },
      { key: 'status', header: '상태' },
      { key: 'adminMemo', header: '관리자 메모' },
      { key: 'createdAt', header: '등록일' },
    ], '문의_내역');
  }

  loadData(): void {
    this.loading.set(true);
    const status = this.filterStatus() || undefined;
    this.inquiryApi.getList(this.page(), this.limit, status).subscribe({
      next: (res) => { this.data.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오는데 실패했습니다.'); this.loading.set(false); },
    });
  }

  onFilterChange(status: InquiryStatus | ''): void {
    this.filterStatus.set(status);
    this.page.set(1);
    this.loadData();
  }

  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  openDetail(item: InquiryItem): void {
    this.selectedItem.set(item);
    this.editStatus.set(item.status);
    this.editMemo.set(item.adminMemo ?? '');
  }

  closeDetail(): void { this.selectedItem.set(null); }

  saveStatus(): void {
    const item = this.selectedItem();
    if (!item) return;
    this.updating.set(true);
    this.inquiryApi.updateStatus(item.id, {
      status: this.editStatus(),
      adminMemo: this.editMemo().trim() || undefined,
    }).subscribe({
      next: (updated) => {
        this.toast.success('상태가 업데이트되었습니다.');
        this.selectedItem.set(updated);
        this.updating.set(false);
        this.loadData();
      },
      error: () => { this.toast.error('업데이트에 실패했습니다.'); this.updating.set(false); },
    });
  }

  onDelete(item: InquiryItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.inquiryApi.remove(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); if (this.selectedItem()?.id === t.id) this.closeDetail(); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }

  getStatusMeta(status: InquiryStatus) { return STATUS_META[status]; }
}
