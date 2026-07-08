import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentApiService, EventItem, EventPayload } from '../../shared/services/content-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-events-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './events.page.html',
})
export class EventsPage implements OnInit {
  private api = inject(ContentApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<EventItem[]>([]);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'title', label: '이벤트명', align: 'left' },
    { key: 'startDate', label: '시작일', align: 'center', width: '7.5rem', type: 'date' },
    { key: 'endDate', label: '종료일', align: 'center', width: '7.5rem', type: 'date' },
    {
      key: 'published', label: '공개', align: 'center', width: '5.5rem', type: 'badge',
      badgeMap: {
        true:  { label: '공개', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '숨김', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'createdAt', label: '등록일', align: 'center', width: '7.5rem', type: 'date' },
  ];

  showForm = signal(false);
  saving = signal(false);
  editingItem = signal<EventItem | null>(null);
  formTitle = computed(() => this.editingItem() ? '이벤트 수정' : '이벤트 등록');

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
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
    if (file) {
      this.fAttachName.set(file.name);
      this.toast.info('\uD30C\uC77C \uC5C5\uB85C\uB4DC\uB294 \uC11C\uBC84 \uC5F0\uB3D9\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.');
    }
  }

  removeFile(): void {
    this.fAttachName.set('');
    this.fAttachmentUrl.set('');
  }

  ngOnInit(): void { this.loadData(); }

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
    this.fDescription.set(item?.description ?? '');
    this.fImageUrl.set(item?.imageUrl ?? '');
    this.fAttachmentUrl.set(item?.attachmentUrl ?? '');
    this.fStartDate.set(item?.startDate ? item.startDate.slice(0, 10) : '');
    this.fEndDate.set(item?.endDate ? item.endDate.slice(0, 10) : '');
    this.fPublished.set(item?.published ?? true);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.toast.info('이미지 업로드 기능은 서버 연동이 필요합니다.');
      this.fImageUrl.set('https://dummyimage.com/100x100/ccc/000.png&text=IMG');
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
