import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentApiService, QrCodeItem, QrCodePayload } from '../../shared/services/content-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-qr-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './qr.page.html',
})
export class QrPage implements OnInit {
  private api = inject(ContentApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<QrCodeItem[]>([]);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'name', label: 'QR \ucf54\ub4dc\uba85', align: 'left' },
    {
      key: 'type', label: '\uc720\ud615', align: 'center', width: '7rem', type: 'badge',
      badgeMap: {
        URL: { label: 'URL', class: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
        PDF: { label: 'PDF', class: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
      },
    },
    { key: 'targetUrl', label: '\uc5f0\uacb0 URL', align: 'left' },
    { key: 'scanCount', label: '\uc2a4\uce94', align: 'center', width: '4.5rem', type: 'number' },
    { key: 'createdAt', label: '\uc0dd\uc131\uc77c', align: 'center', width: '7.5rem', type: 'date' },
  ];

  showForm = signal(false);
  saving = signal(false);
  editingItem = signal<QrCodeItem | null>(null);
  formTitle = computed(() => this.editingItem() ? 'QR \ucf54\ub4dc \uc218\uc815' : 'QR \ucf54\ub4dc \ub4f1\ub85d');

  readonly typeOptions = [
    { value: 'URL', label: 'URL' },
    { value: 'PDF', label: 'PDF' },
  ];

  fName = signal('');
  fType = signal('');
  fTargetUrl = signal('');

  deleteTarget = signal<QrCodeItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void { this.loadData(); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'QR\uba85' },
      { key: 'type', header: '\uc720\ud615' },
      { key: 'targetUrl', header: '\ub300\uc0c1 URL' },
      { key: 'scanCount', header: '\uc2a4\uce94 \uc218' },
      { key: 'isActive', header: '\ud65c\uc131' },
      { key: 'createdAt', header: '\ub4f1\ub85d\uc77c' },
    ], 'QR\ucf54\ub4dc');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getQrCodes().subscribe({
      next: (list) => { this.data.set(list); this.loading.set(false); },
      error: () => { this.toast.error('\ubaa9\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.'); this.loading.set(false); },
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
    if (!this.fName().trim()) { this.toast.warning('QR \ucf54\ub4dc\uba85\uc744 \uc785\ub825\ud558\uc138\uc694.'); return; }
    if (!this.fType()) { this.toast.warning('\uc720\ud615\uc744 \uc120\ud0dd\ud558\uc138\uc694.'); return; }
    if (!this.fTargetUrl().trim()) { this.toast.warning('URL\uc744 \uc785\ub825\ud558\uc138\uc694.'); return; }
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
        this.toast.success(this.editingItem() ? '\uc218\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4.' : '\uc0dd\uc131\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: () => { this.toast.error('\uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'); this.saving.set(false); },
    });
  }

  onDelete(item: QrCodeItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.removeQrCode(t.id).subscribe({
      next: () => { this.toast.success('\uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('\uc0ad\uc81c\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
