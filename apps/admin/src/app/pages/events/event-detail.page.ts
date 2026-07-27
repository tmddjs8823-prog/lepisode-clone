import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ContentApiService, EventItem, EventPayload } from '../../shared/services/content-api.service';
import { InquiryApiService, InquiryItem } from '../../shared/services/inquiry-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { UploadService, DOCUMENT_ACCEPT } from '../../shared/services/upload.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { RichEditorComponent } from '../../shared/components/rich-editor/rich-editor.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-event-detail-page',
  imports: [FormsModule, DatePipe, ConfirmDialogComponent, DataTableComponent, RichEditorComponent],
  templateUrl: './event-detail.page.html',
})
export class EventDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ContentApiService);
  private inquiryApi = inject(InquiryApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private upload = inject(UploadService);

  readonly docAccept = DOCUMENT_ACCEPT;

  /* 이벤트 데이터 */
  event = signal<EventItem | null>(null);
  loading = signal(false);

  /* 아코디언 열림/닫힘 상태 */
  detailOpen = signal(true);
  inquiryOpen = signal(true);

  /* 삭제 확인 */
  deleteTarget = signal<EventItem | null>(null);
  deleting = signal(false);

  /* ── 수정 Drawer ── */
  showForm = signal(false);
  saving = signal(false);

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fSeoTitle = signal('');
  fMetaDesc = signal('');
  fDescription = signal('');
  fImageUrl = signal('');
  fAttachmentUrl = signal('');
  fStartDate = signal('');
  fEndDate = signal('');
  fSelectedDate = signal('');
  fPublished = signal(true);
  fContent = signal('');
  fAttachName = signal('');

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

  /* ── 수정 Drawer ── */
  onEdit(): void {
    const ev = this.event();
    if (!ev) return;
    this.fTitle.set(ev.title);
    this.fTitleEn.set(ev.titleEn ?? '');
    this.fTitleJa.set(ev.titleJa ?? '');
    this.fSeoTitle.set(ev.seoTitle ?? '');
    this.fMetaDesc.set(ev.metaDesc ?? ev.description ?? '');
    this.fDescription.set(ev.description ?? '');
    this.fImageUrl.set(ev.imageUrl ?? '');
    this.fAttachmentUrl.set(ev.attachmentUrl ?? '');
    this.fStartDate.set(ev.startDate ? ev.startDate.slice(0, 10) : '');
    this.fEndDate.set(ev.endDate ? ev.endDate.slice(0, 10) : '');
    this.fSelectedDate.set(ev.selectedDate ? ev.selectedDate.slice(0, 10) : '');
    this.fPublished.set(ev.published);
    this.fContent.set(ev.content ?? '');
    this.fAttachName.set(ev.attachmentUrl ? '첨부파일' : '');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fAttachName.set(file.name);
    this.upload.upload(file, 'event-docs').subscribe({
      next: (res) => { this.fAttachmentUrl.set(res.url); this.toast.success('파일이 업로드되었습니다.'); },
      error: () => this.toast.error('파일 업로드에 실패했습니다.'),
    });
  }

  removeFile(): void {
    this.fAttachName.set('');
    this.fAttachmentUrl.set('');
  }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('제목을 입력하세요.'); return; }
    const ev = this.event();
    if (!ev) return;

    const payload: EventPayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      description: this.fDescription().trim() || undefined,
      imageUrl: this.fImageUrl() || undefined,
      attachmentUrl: this.fAttachmentUrl() || undefined,
      startDate: this.fStartDate() || undefined,
      endDate: this.fEndDate() || undefined,
      selectedDate: this.fSelectedDate() || undefined,
      published: this.fPublished(),
    };

    this.saving.set(true);
    this.api.updateEvent(ev.id, payload).subscribe({
      next: () => {
        this.toast.success('수정되었습니다.');
        this.saving.set(false);
        this.closeForm();
        this.loadEvent(ev.id);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
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
