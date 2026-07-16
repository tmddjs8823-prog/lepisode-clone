import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentApiService, QrCodeItem, QrCodePayload } from '../../shared/services/content-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-qr-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './qr.page.html',
})
export class QrPage implements OnInit {
  private api = inject(ContentApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<QrCodeItem[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: '_index', label: '순번', align: 'center', width: '8%', type: 'index' },
    { key: 'name', label: 'QR 코드명', align: 'center', width: '25%' },
    {
      key: 'type', label: '유형', align: 'center', width: '12%', type: 'badge',
      badgeMap: {
        URL: { label: 'URL', class: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
        PDF: { label: 'PDF', class: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
      },
    },
    { key: 'targetUrl', label: '연결 URL', align: 'center', width: '40%' },
    { key: 'createdAt', label: '생성일', align: 'center', width: '15%', type: 'date' },
  ];

  showForm = signal(false);
  saving = signal(false);
  editingItem = signal<QrCodeItem | null>(null);
  formTitle = computed(() => this.editingItem() ? 'QR 코드 수정' : 'QR 코드 등록');

  readonly typeOptions = [
    { value: 'URL', label: 'URL' },
    { value: 'PDF', label: 'PDF' },
  ];

  fName = signal('');
  fType = signal('');
  fTargetUrl = signal('');

  deleteTarget = signal<QrCodeItem | null>(null);
  deleting = signal(false);

  readonly qrContextMenuItems = [
    { action: 'download-qr', label: 'QR코드 다운로드', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
  ];

  onCustomAction(event: { action: string; row: Record<string, unknown> }): void {
    if (event.action === 'download-qr') {
      const item = event.row as unknown as QrCodeItem;
      if (!item.qrCodeUrl) {
        this.toast.warning('QR코드 이미지가 없습니다.');
        return;
      }
      const link = document.createElement('a');
      link.href = item.qrCodeUrl;
      link.download = `${item.name || 'qrcode'}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toast.success('QR코드 다운로드를 시작합니다.');
    }
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
      { key: 'name', header: 'QR명' },
      { key: 'type', header: '유형' },
      { key: 'targetUrl', header: '대상 URL' },
      { key: 'scanCount', header: '스캔 수' },
      { key: 'isActive', header: '활성' },
      { key: 'createdAt', header: '등록일' },
    ], 'QR코드');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getQrCodes().subscribe({
      next: (list) => { this.data.set(list); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  openForm(item?: QrCodeItem): void {
    this.editingItem.set(item ?? null);
    this.fName.set(item?.name ?? '');
    this.fType.set(item?.type ?? '');
    this.fTargetUrl.set(item?.targetUrl ?? '');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (!this.fName().trim()) { this.toast.warning('QR 코드명을 입력하세요.'); return; }
    if (!this.fType()) { this.toast.warning('유형을 선택하세요.'); return; }
    if (!this.fTargetUrl().trim()) { this.toast.warning('URL을 입력하세요.'); return; }
    const payload: QrCodePayload = {
      name: this.fName().trim(),
      type: this.fType(),
      targetUrl: this.fTargetUrl().trim(),
    };

    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing
      ? this.api.updateQrCode(editing.id, payload)
      : this.api.createQrCode(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '생성되었습니다.');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onDelete(item: QrCodeItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.removeQrCode(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
