import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InquiryApiService, InquiryItem, InquiryStatus } from '../../shared/services/inquiry-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

const STATUS_META: Record<InquiryStatus, { label: string; class: string }> = {
  PENDING:     { label: '견적중',   class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  IN_PROGRESS: { label: '진행중',   class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  COMPLETED:   { label: '완료',     class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  CANCELLED:   { label: '답변완료', class: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
};

@Component({
  selector: 'admin-inquiries-page',
  imports: [FormsModule, DatePipe, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './inquiries.page.html',
})
export class InquiriesPage implements OnInit {
  private inquiryApi = inject(InquiryApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  readonly statusMeta = STATUS_META;
  readonly statusOptions: InquiryStatus[] = ['PENDING', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED'];

  data = signal<InquiryItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);
  filterStatus = signal<InquiryStatus | ''>('');
  filterType = signal('');
  searchQuery = signal('');

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: '_caseNo', label: '번호', align: 'center', width: '8rem',
      transform: (row) => {
        const r = row as unknown as InquiryItem;
        return 'CS' + String(r.id).padStart(8, '0');
      },
    },
    {
      key: 'status', label: '상태', align: 'center', width: '5.5rem', type: 'badge',
      badgeMap: {
        PENDING:     { label: '견적중', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
        IN_PROGRESS: { label: '진행중', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
        COMPLETED:   { label: '완료', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        CANCELLED:   { label: '답변완료', class: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
      },
    },
    {
      key: '_source', label: '문의 경로', align: 'center', width: '6rem',
      transform: () => '홈페이지',
    },
    { key: 'name', label: '고객명', align: 'center', width: '5rem' },
    { key: 'phone', label: '연락처', align: 'center', width: '8.5rem' },
    { key: 'email', label: '이메일', align: 'center' },
    {
      key: '_privacyAgree', label: '개인정보 동의', align: 'center', width: '7rem',
      transform: () => '동의',
    },
    {
      key: '_marketingAgree', label: '마케팅 동의', align: 'center', width: '6.5rem',
      transform: (row) => {
        const r = row as unknown as InquiryItem;
        // budget 필드를 마케팅 동의 여부로 임시 활용 (실제 필드 매핑은 추후 조정)
        return r.budget ? '동의' : '미동의';
      },
    },
  ];

  // 상세 / 상태 변경
  selectedItem = signal<InquiryItem | null>(null);
  editStatus = signal<InquiryStatus>('PENDING');
  editMemo = signal('');
  editingMemo = signal(false);
  updating = signal(false);

  // 삭제
  deleteTarget = signal<InquiryItem | null>(null);
  deleting = signal(false);

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void { this.loadData(); }

  onSearch(term?: string): void { this.searchTerm.set(typeof term === 'string' ? term : ''); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'name', header: '고객명' },
      { key: 'email', header: '이메일' },
      { key: 'phone', header: '연락처' },
      { key: 'content', header: '문의 내용' },
      { key: 'status', header: '상태' },
      { key: 'adminMemo', header: '관리자 메모' },
      { key: 'createdAt', header: '접수일' },
    ], '문의_내역');
  }

  loadData(): void {
    this.loading.set(true);
    const status = this.filterStatus() || undefined;
    this.inquiryApi.getList(this.page(), this.limit(), status).subscribe({
      next: (res) => { this.data.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오는데 실패했습니다.'); this.loading.set(false); },
    });
  }

  onStatusFilter(status: InquiryStatus | ''): void {
    this.filterStatus.set(status);
    this.page.set(1);
    this.loadData();
  }

  onTypeFilter(type: string): void {
    this.filterType.set(type);
    this.page.set(1);
    this.loadData();
  }

  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  openDetail(item: InquiryItem): void {
    this.selectedItem.set(item);
    this.editStatus.set(item.status);
    this.editMemo.set(item.adminMemo ?? '');
  }

  closeDetail(): void { this.selectedItem.set(null); this.editingMemo.set(false); }

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

  saveMemo(): void {
    const item = this.selectedItem();
    if (!item) return;
    this.inquiryApi.updateStatus(item.id, {
      status: item.status,
      adminMemo: this.editMemo().trim() || undefined,
    }).subscribe({
      next: (updated) => {
        this.toast.success('메모가 저장되었습니다.');
        this.selectedItem.set(updated);
        this.editingMemo.set(false);
        this.loadData();
      },
      error: () => { this.toast.error('메모 저장에 실패했습니다.'); },
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
