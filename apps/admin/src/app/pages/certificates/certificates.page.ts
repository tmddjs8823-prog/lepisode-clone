import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentApiService, CertificateItem, CertificatePayload } from '../../shared/services/content-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { UploadService } from '../../shared/services/upload.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-certificates-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './certificates.page.html',
})
export class CertificatesPage implements OnInit {
  private api = inject(ContentApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private upload = inject(UploadService);

  data = signal<CertificateItem[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'title',    label: '인증서명', align: 'left', width: '10%' },
    { key: 'imageUrl', label: '이미지', align: 'center', width: '15%', type: 'image' },
    { key: 'titleEn',  label: '영문명', align: 'left', width: '22%' },
    { key: 'issuer',   label: '발급기관', align: 'left', width: '22%' },
    { key: 'sortOrder', label: '순서', align: 'center', width: '5rem', type: 'number' },
    { key: 'createdAt', label: '등록일', align: 'center', width: '8rem', type: 'date' },
  ];

  showForm = signal(false);
  saving = signal(false);
  editingItem = signal<CertificateItem | null>(null);
  formTitle = computed(() => this.editingItem() ? '인증서 수정' : '인증서 등록');

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fIssuer = signal('');
  fImageUrl = signal('');
  fSortOrder = signal(0);
  fImagePreview = signal('');

  deleteTarget = signal<CertificateItem | null>(null);
  deleting = signal(false);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
  }

  private handleFile(file: File): void {
    // 미리보기 즉시 표시
    this.upload.toPreviewUrl(file).subscribe(url => this.fImagePreview.set(url));
    // Supabase에 업로드
    this.upload.upload(file, 'certificates').subscribe({
      next: (result) => {
        this.fImageUrl.set(result.url);
        this.toast.success('이미지가 업로드되었습니다.');
      },
      error: () => this.toast.error('이미지 업로드에 실패했습니다.'),
    });
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  removeImage(): void {
    this.fImageUrl.set('');
    this.fImagePreview.set('');
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
      { key: 'title', header: '인증서명' },
      { key: 'issuer', header: '발급기관' },
      { key: 'sortOrder', header: '순서' },
      { key: 'createdAt', header: '등록일' },
    ], '인증서');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getCertificates().subscribe({
      next: (list) => { this.data.set(list); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  openForm(item?: CertificateItem): void {
    this.editingItem.set(item ?? null);
    this.fTitle.set(item?.title ?? '');
    this.fTitleEn.set(item?.titleEn ?? '');
    this.fTitleJa.set(item?.titleJa ?? '');
    this.fIssuer.set(item?.issuer ?? '');
    this.fImageUrl.set(item?.imageUrl ?? '');
    this.fImagePreview.set(item?.imageUrl ?? '');
    this.fSortOrder.set(item?.sortOrder ?? 0);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }


  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('인증서명을 입력하세요.'); return; }
    const payload: CertificatePayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      issuer: this.fIssuer().trim() || undefined,
      imageUrl: this.fImageUrl() || undefined,
      sortOrder: this.fSortOrder(),
    };

    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing
      ? this.api.updateCertificate(editing.id, payload)
      : this.api.createCertificate(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onDelete(item: CertificateItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.removeCertificate(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
