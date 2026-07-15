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
    { key: 'title', label: '팝업명', align: 'center', width: '25%' },
    { key: 'imageUrl', label: '이미지', align: 'center', width: '15rem', type: 'image' },
    { key: 'startDate', label: '시작일', align: 'center', width: '15%', type: 'date' },
    { key: 'endDate', label: '종료일', align: 'center', width: '15%', type: 'date' },
    {
      key: 'published', label: '공개', align: 'center', width: '12%', type: 'badge',
      badgeMap: {
        true:  { label: '공개', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '숨김', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'createdAt', label: '등록일', align: 'center', width: '15%', type: 'date' },
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
}
