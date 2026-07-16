import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentApiService, EventItem, EventPayload } from '../../shared/services/content-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';
import { UploadService, DOCUMENT_ACCEPT } from '../../shared/services/upload.service';
import { RichEditorComponent } from '../../shared/components/rich-editor/rich-editor.component';

@Component({
  selector: 'admin-events-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent, RichEditorComponent],
  templateUrl: './events.page.html',
})
export class EventsPage implements OnInit {
  private api = inject(ContentApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private upload = inject(UploadService);

  readonly docAccept = DOCUMENT_ACCEPT;

  data = signal<EventItem[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: '번호', align: 'center', width: '10%', transform: (row) => {
      return 'EV' + String(row['id']).padStart(8, '0');
    }},
    { key: 'title', label: '이벤트명', align: 'center', width: '25%' },
    { key: 'startDate', label: '이벤트 기간', align: 'center', width: '20%', transform: (row) => {
      const s = row['startDate'] as string | null;
      const e = row['endDate'] as string | null;
      if (!s && !e) return '-';
      return `${s ? s.slice(0, 10) : '?'} ~ ${e ? e.slice(0, 10) : '?'}`;
    }},
    { key: 'selectedDate', label: '선정일', align: 'center', width: '12%', type: 'date' },
    { key: 'attachmentUrl', label: '첨부파일', align: 'center', width: '10%', transform: (row) => {
      return row['attachmentUrl'] ? '1개' : '0개';
    }},
    { key: 'createdAt', label: '등록일자', align: 'center', width: '15%', type: 'date' },
  ];

  showForm = signal(false);
  saving = signal(false);
  editingItem = signal<EventItem | null>(null);
  formTitle = computed(() => this.editingItem() ? '이벤트 수정' : '이벤트 등록');

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
  fPublished = signal(true);
  fSelectedDate = signal('');
  fContent = signal('');
  fAttachName = signal('');

  deleteTarget = signal<EventItem | null>(null);
  deleting = signal(false);

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

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void { this.loadData(); }

  onSearch(term?: string): void { this.searchTerm.set(typeof term === 'string' ? term : ''); }

  goDetail(item: EventItem): void {
    this.router.navigate(['/content/events', item.id]);
  }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '제목' },
      { key: 'startDate', header: '시작일' },
      { key: 'endDate', header: '종료일' },
      { key: 'published', header: '공개여부' },
      { key: 'createdAt', header: '등록일' },
    ], '이벤트');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getEvents().subscribe({
      next: (list) => { this.data.set(list); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  openForm(item?: EventItem): void {
    this.editingItem.set(item ?? null);
    this.fTitle.set(item?.title ?? '');
    this.fTitleEn.set(item?.titleEn ?? '');
    this.fTitleJa.set(item?.titleJa ?? '');
    this.fSeoTitle.set(item?.seoTitle ?? '');
    this.fMetaDesc.set(item?.metaDesc ?? item?.description ?? '');
    this.fDescription.set(item?.description ?? '');
    this.fImageUrl.set(item?.imageUrl ?? '');
    this.fAttachmentUrl.set(item?.attachmentUrl ?? '');
    this.fStartDate.set(item?.startDate ? item.startDate.slice(0, 10) : '');
    this.fEndDate.set(item?.endDate ? item.endDate.slice(0, 10) : '');
    this.fPublished.set(item?.published ?? true);
    this.fSelectedDate.set(item?.selectedDate ? item.selectedDate.slice(0, 10) : '');
    this.fContent.set(item?.content ?? '');
    this.fAttachName.set(item?.attachmentUrl ? '첨부파일' : '');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.toast.info('이미지 업로드 기능은 서버 연동이 필요합니다.');
    }
  }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('제목을 입력하세요.'); return; }
    const payload: EventPayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      description: this.fDescription().trim() || undefined,
      imageUrl: this.fImageUrl() || undefined,
      attachmentUrl: this.fAttachmentUrl() || undefined,
      startDate: this.fStartDate() || undefined,
      endDate: this.fEndDate() || undefined,
      published: this.fPublished(),
    };

    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing
      ? this.api.updateEvent(editing.id, payload)
      : this.api.createEvent(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onDelete(item: EventItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.removeEvent(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
