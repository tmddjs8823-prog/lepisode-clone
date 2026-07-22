import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentApiService, PopupItem, PopupPayload } from '../../shared/services/content-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { UploadService } from '../../shared/services/upload.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-popups-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './popups.page.html',
})
export class PopupsPage implements OnInit {
  private api = inject(ContentApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private upload = inject(UploadService);

  data = signal<PopupItem[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'sortOrder', label: '순서', align: 'center', width: '8%' },
    { key: 'title', label: '팝업명', align: 'center', width: '20%' },
    { key: 'linkUrl', label: '링크', align: 'center', width: '22%', transform: (row) => {
      const url = row['linkUrl'] as string | null;
      return url || '';
    }},
    { key: 'startDate', label: '노출기간', align: 'center', width: '22%', transform: (row) => {
      const s = row['startDate'] as string | null;
      const e = row['endDate'] as string | null;
      if (!s && !e) return '';
      return `${s ? s.slice(0, 10) : '?'} ~ ${e ? e.slice(0, 10) : '?'}`;
    }},
    { key: 'imageUrl', label: '이미지', align: 'center', width: '12%', type: 'image' },
    {
      key: 'published', label: '노출상태', align: 'center', width: '12%', type: 'badge',
      badgeMap: {
        true:  { label: '노출', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '숨김', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
  ];

  showForm = signal(false);
  saving = signal(false);
  editingItem = signal<PopupItem | null>(null);
  formTitle = computed(() => this.editingItem() ? '팝업 수정' : '팝업 등록');

  fTitle = signal('');
  fImageUrl = signal('');
  fStartDate = signal('');
  fEndDate = signal('');
  fSortOrder = signal(0);
  fPublished = signal(true);
  fLinkUrl = signal('');
  fImagePreview = signal('');
  fImageFile = signal<File | null>(null);

  deleteTarget = signal<PopupItem | null>(null);
  deleting = signal(false);

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  private handleFile(file: File): void {
    this.fImageFile.set(file);
    this.fImagePreview.set(URL.createObjectURL(file));
  }

  removeImage(): void {
    this.fImageUrl.set('');
    this.fImagePreview.set('');
    this.fImageFile.set(null);
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

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '팝업명' },
      { key: 'startDate', header: '시작일' },
      { key: 'endDate', header: '종료일' },
      { key: 'published', header: '공개여부' },
      { key: 'createdAt', header: '등록일' },
    ], '팝업');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getPopups().subscribe({
      next: (list) => { this.data.set(list); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  openForm(item?: PopupItem): void {
    this.editingItem.set(item ?? null);
    this.fTitle.set(item?.title ?? '');
    this.fImageUrl.set(item?.imageUrl ?? '');
    this.fImagePreview.set(item?.imageUrl ?? '');
    this.fImageFile.set(null);
    this.fStartDate.set(item?.startDate ? item.startDate.slice(0, 10) : '');
    this.fEndDate.set(item?.endDate ? item.endDate.slice(0, 10) : '');
    this.fSortOrder.set(item?.sortOrder ?? 0);
    this.fLinkUrl.set(item?.linkUrl ?? '');
    this.fPublished.set(item?.published ?? true);
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
    if (!this.fTitle().trim()) { this.toast.warning('팝업명을 입력하세요.'); return; }
    this.saving.set(true);

    const doSave = (imageUrl?: string) => {
      const payload: PopupPayload = {
        title: this.fTitle().trim(),
        imageUrl: imageUrl || this.fImageUrl() || undefined,
        startDate: this.fStartDate() || undefined,
        endDate: this.fEndDate() || undefined,
        sortOrder: this.fSortOrder(),
        published: this.fPublished(),
        linkUrl: this.fLinkUrl().trim() || undefined,
      };
      const editing = this.editingItem();
      const req = editing
        ? this.api.updatePopup(editing.id, payload)
        : this.api.createPopup(payload);
      req.subscribe({
        next: () => {
          this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
          this.closeForm(); this.loadData(); this.saving.set(false);
        },
        error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
      });
    };

    const file = this.fImageFile();
    if (file) {
      this.upload.upload(file, 'popups').subscribe({
        next: (res) => doSave(res.url),
        error: () => { this.toast.error('이미지 업로드에 실패했습니다.'); this.saving.set(false); },
      });
    } else {
      doSave();
    }
  }

  onDelete(item: PopupItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.removePopup(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }

  /* ── 우클릭 컨텍스트 메뉴: 노출/숨김 토글 ── */
  readonly contextMenuItems = [
    { action: 'togglePublished', label: '노출/숨김 토글', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  ];

  onCustomAction(event: { action: string; row: Record<string, unknown> }): void {
    if (event.action === 'togglePublished') {
      this.togglePublished(event.row as unknown as PopupItem);
    }
  }

  togglePublished(item: PopupItem): void {
    const newPublished = !item.published;
    this.api.updatePopup(item.id, { published: newPublished } as PopupPayload).subscribe({
      next: () => {
        this.toast.success(newPublished ? '노출 상태로 변경되었습니다.' : '숨김 상태로 변경되었습니다.');
        this.loadData();
      },
      error: () => { this.toast.error('상태 변경에 실패했습니다.'); },
    });
  }
}
