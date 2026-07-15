import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarketingApiService, MarketingConsentItem } from '../../shared/services/marketing-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-marketing-consents-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './marketing-consents.page.html',
})
export class MarketingConsentsPage implements OnInit {
  private api = inject(MarketingApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<MarketingConsentItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(20);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'name',  label: '이름',     align: 'center' },
    { key: 'email', label: '이메일',   align: 'center' },
    { key: 'phone', label: '전화번호', align: 'center' },
    { key: 'createdAt', label: '동의일', align: 'center', width: '7.5rem', type: 'date' },
  ];

  deleteTarget = signal<MarketingConsentItem | null>(null);
  deleting = signal(false);
  revokeTarget = signal<MarketingConsentItem | null>(null);
  revoking = signal(false);

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));
  pages = computed(() => {
    const cur = this.page(), tot = this.totalPages(), delta = 2;
    const list: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(tot, cur + delta); i++) list.push(i);
    return list;
  });

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
      { key: 'name', header: '이름' },
      { key: 'email', header: '이메일' },
      { key: 'phone', header: '전화번호' },
      { key: 'createdAt', header: '등록일' },
    ], '마케팅_동의');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getConsents({ page: this.page(), limit: this.limit() }).subscribe({
      next: (res) => { this.data.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  onRevoke(item: MarketingConsentItem): void { this.revokeTarget.set(item); }
  confirmRevoke(): void {
    const t = this.revokeTarget(); if (!t) return;
    this.revoking.set(true);
    this.api.revokeConsent(t.id).subscribe({
      next: () => { this.toast.success('철회되었습니다.'); this.revokeTarget.set(null); this.revoking.set(false); this.loadData(); },
      error: () => { this.toast.error('철회에 실패했습니다.'); this.revoking.set(false); },
    });
  }
  cancelRevoke(): void { this.revokeTarget.set(null); }

  onDelete(item: MarketingConsentItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void { this.deleteTarget.set(null); }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
