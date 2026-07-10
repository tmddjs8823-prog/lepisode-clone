import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

export interface MarketingCompany {
  id: number;
  name: string;
  slug: string;
  manager: string;
  monthlyBudget: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'admin-marketing-companies-page',
  imports: [FormsModule, DataTableComponent, PageHeaderComponent, ConfirmDialogComponent],
  templateUrl: './marketing-companies.page.html',
})
export class MarketingCompaniesPage {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<MarketingCompany[]>([]);
  total = signal(0);
  loading = signal(false);
  searchTerm = '';

  filteredData = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });

  onSearch(): void { /* triggered by enter key, searchTerm is bound via ngModel */ }

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id',            label: '순번',     type: 'number', align: 'center', width: '6%' },
    { key: 'name',          label: '업체명',   align: 'center', width: '18%' },
    { key: 'slug',          label: '슬러그',   align: 'center', width: '16%' },
    { key: 'manager',       label: '담당자',   align: 'center', width: '12%' },
    { key: 'monthlyBudget', label: '월 예산',  align: 'center',  width: '14%', transform: (row: Record<string, unknown>) => {
      const v = row['monthlyBudget'] as number;
      return v ? v.toLocaleString('ko-KR') + '원' : '—';
    }},
    { key: 'status',        label: '상태',     align: 'center', width: '10%' },
    { key: 'createdAt',     label: '등록일자', align: 'center', width: '12%', type: 'date' },
  ];

  /* ── 폼 ── */
  showForm = signal(false);
  editingItem = signal<MarketingCompany | null>(null);
  saving = signal(false);
  formTitle = computed(() => this.editingItem() ? '마케팅 업체 수정' : '마케팅 업체 등록');

  fName = signal('');
  fSlug = signal('');
  fManager = signal('');
  fBudget = signal(0);
  fPassword = signal('');

  // 네이버 검색광고
  fNaverApiKey = signal('');
  fNaverSecretKey = signal('');
  fNaverCustomerId = signal('');
  fChPowerlink = signal(false);
  fChPowerContent = signal(false);
  fChPlace = signal(false);

  // GA4
  fGa4PropertyId = signal('');
  fGa4ServiceAccountKey = signal('');

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: '순번' },
      { key: 'name', header: '업체명' },
      { key: 'slug', header: '슬러그' },
      { key: 'manager', header: '담당자' },
      { key: 'monthlyBudget', header: '월 예산' },
      { key: 'status', header: '상태' },
      { key: 'createdAt', header: '등록일자' },
    ], '마케팅_업체');
  }

  openForm(item?: MarketingCompany): void {
    if (item) {
      this.editingItem.set(item);
      this.fName.set(item.name);
      this.fSlug.set(item.slug);
      this.fManager.set(item.manager);
      this.fBudget.set(item.monthlyBudget);
    } else {
      this.editingItem.set(null);
      this.fName.set('');
      this.fSlug.set('');
      this.fManager.set('');
      this.fBudget.set(0);
      this.fPassword.set('');
      this.fNaverApiKey.set('');
      this.fNaverSecretKey.set('');
      this.fNaverCustomerId.set('');
      this.fChPowerlink.set(false);
      this.fChPowerContent.set(false);
      this.fChPlace.set(false);
      this.fGa4ServiceAccountKey.set('');
      this.fGa4PropertyId.set('');
    }
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (!this.fName().trim()) { this.toast.warning('업체명을 입력하세요.'); return; }
    if (!this.fSlug().trim()) { this.toast.warning('슬러그를 입력하세요.'); return; }
    if (!this.fManager().trim()) { this.toast.warning('담당자명을 입력하세요.'); return; }

    this.saving.set(true);
    setTimeout(() => {
      const editing = this.editingItem();
      if (editing) {
        // 수정
        this.data.update(list => list.map(item =>
          item.id === editing.id
            ? { ...item, name: this.fName().trim(), slug: this.fSlug().trim(), manager: this.fManager().trim(), monthlyBudget: this.fBudget() }
            : item
        ));
        this.toast.success('수정되었습니다.');
      } else {
        // 등록
        const newItem: MarketingCompany = {
          id: this.data().length > 0 ? Math.max(...this.data().map(d => d.id)) + 1 : 1,
          name: this.fName().trim(),
          slug: this.fSlug().trim(),
          manager: this.fManager().trim(),
          monthlyBudget: this.fBudget(),
          status: '활성',
          createdAt: new Date().toISOString(),
        };
        this.data.update(list => [...list, newItem]);
        this.total.update(t => t + 1);
        this.toast.success('등록되었습니다.');
      }
      this.saving.set(false);
      this.closeForm();
    }, 500);
  }

  /* ── 삭제 ── */
  deleteTarget = signal<MarketingCompany | null>(null);
  deleting = signal(false);

  onDelete(item: MarketingCompany): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    setTimeout(() => {
      this.data.update(list => list.filter(d => d.id !== t.id));
      this.total.update(n => Math.max(0, n - 1));
      this.toast.success('삭제되었습니다.');
      this.deleteTarget.set(null);
      this.deleting.set(false);
    }, 500);
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
