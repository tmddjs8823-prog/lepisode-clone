import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ContentApiService, EventItem, EventPayload } from '../../shared/services/content-api.service';
import { InquiryApiService, InquiryItem, InquiryStatus } from '../../shared/services/inquiry-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-event-detail-page',
  imports: [FormsModule, DatePipe, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './event-detail.page.html',
})
export class EventDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ContentApiService);
  private inquiryApi = inject(InquiryApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  /* 이벤트 데이터 */
  event = signal<EventItem | null>(null);
  loading = signal(false);

  /* 아코디언 열림/닫힘 상태 */
  detailOpen = signal(true);
  inquiryOpen = signal(true);

  /* 삭제 확인 */
  deleteTarget = signal<EventItem | null>(null);
  deleting = signal(false);

  /* 문의 내역 */
  inquiries = signal<InquiryItem[]>([]);
  inquiryLoading = signal(false);
  inquiryTotal = signal(0);
  inquiryPage = signal(1);
  inquiryLimit = signal(10);
  inquirySearchTerm = signal('');

  filteredInquiries = computed(() => {
    const term = this.inquirySearchTerm().toLowerCase();
    if (!term) return this.inquiries();
    return this.inquiries().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });

  readonly inquiryColumns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: 'status', label: '상태', align: 'center', width: '5.5rem', type: 'badge',
      badgeMap: {
        'PENDING':     { label: '대기',   class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
        'IN_PROGRESS': { label: '진행중', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
        'COMPLETED':   { label: '완료',   class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        'CANCELLED':   { label: '취소',   class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'name', label: '고객명', align: 'center' },
    { key: 'phone', label: '연락처', align: 'center', width: '9rem' },
    { key: 'projectType', label: '플랫폼', align: 'center', width: '6rem' },
    { key: 'content', label: '문의 내용', align: 'center' },
    { key: 'createdAt', label: '접수일', align: 'center', width: '9.5rem', type: 'date' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(+id);
      this.loadInquiries();
    }
  }

  private loadEvent(id: number): void {
    this.loading.set(true);
    this.api.getEvent(id).subscribe({
      next: (ev) => { this.event.set(ev); this.loading.set(false); },
      error: () => { this.toast.error('이벤트를 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  loadInquiries(): void {
    this.inquiryLoading.set(true);
    this.inquiryApi.getList(this.inquiryPage(), this.inquiryLimit()).subscribe({
      next: (res) => {
        this.inquiries.set(res.data);
        this.inquiryTotal.set(res.total);
        this.inquiryLoading.set(false);
      },
      error: () => {
        this.toast.error('문의 내역을 불러오지 못했습니다.');
        this.inquiryLoading.set(false);
      },
    });
  }

  onInquiryPageChange(page: number): void {
    this.inquiryPage.set(page);
    this.loadInquiries();
  }

  /* 수정 */
  onEdit(): void {
    const ev = this.event();
    if (ev) {
      this.router.navigate(['/content/events', ev.id, 'edit']);
    }
  }

  /* 삭제 */
  onDelete(): void {
    this.deleteTarget.set(this.event());
  }

  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.api.removeEvent(t.id).subscribe({
      next: () => {
        this.toast.success('삭제되었습니다.');
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.router.navigate(['/content/events']);
      },
      error: () => {
        this.toast.error('삭제에 실패했습니다.');
        this.deleting.set(false);
      },
    });
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  toggleDetail(): void { this.detailOpen.update(v => !v); }
  toggleInquiry(): void { this.inquiryOpen.update(v => !v); }

  goBack(): void {
    this.router.navigate(['/content/events']);
  }

  /* 문의 등록 */
  onRegisterInquiry(): void {
    this.router.navigate(['/homepage/inquiries']);
  }

  /* 문의 내역 엑셀 다운로드 */
  onExportInquiryExcel(): void {
    this.excel.export(this.inquiries() as unknown as Record<string, unknown>[], [
      { key: 'status', header: '상태' },
      { key: 'name', header: '고객명' },
      { key: 'phone', header: '연락처' },
      { key: 'projectType', header: '플랫폼' },
      { key: 'content', header: '문의 내용' },
      { key: 'createdAt', header: '접수일' },
    ], '문의내역');
  }
}
