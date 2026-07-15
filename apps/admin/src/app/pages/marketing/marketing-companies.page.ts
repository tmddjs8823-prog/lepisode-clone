import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarketingApiService, MarketingCompanyItem } from '../../shared/services/marketing-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-marketing-companies-page',
  imports: [FormsModule, DataTableComponent, PageHeaderComponent, ConfirmDialogComponent],
  templateUrl: './marketing-companies.page.html',
})
export class MarketingCompaniesPage implements OnInit {
  private api = inject(MarketingApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<MarketingCompanyItem[]>([]);
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
  editingItem = signal<MarketingCompanyItem | null>(null);
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

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getCompanies().subscribe({
      next: (res) => {
        this.data.set(res);
        this.total.set(res.length);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('업체 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

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

  openForm(item?: MarketingCompanyItem): void {
    if (item) {
      this.editingItem.set(item);
      this.fName.set(item.name);
      this.fSlug.set(item.slug);
      this.fManager.set(item.manager ?? '');
      this.fBudget.set(item.monthlyBudget);
      this.fPassword.set(item.password ?? '');
      this.fNaverApiKey.set(item.naverApiKey ?? '');
      this.fNaverSecretKey.set(item.naverSecretKey ?? '');
      this.fNaverCustomerId.set(item.naverCustomerId ?? '');
      this.fChPowerlink.set(item.chPowerlink);
      this.fChPowerContent.set(item.chPowerContent);
      this.fChPlace.set(item.chPlace);
      this.fGa4PropertyId.set(item.ga4PropertyId ?? '');
      this.fGa4ServiceAccountKey.set(item.ga4ServiceAccountKey ?? '');
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
    const body: Partial<MarketingCompanyItem> = {
      name: this.fName().trim(),
      slug: this.fSlug().trim(),
      manager: this.fManager().trim() || undefined,
      monthlyBudget: this.fBudget() || 0,
      password: this.fPassword().trim() || undefined,
      naverApiKey: this.fNaverApiKey().trim() || undefined,
      naverSecretKey: this.fNaverSecretKey().trim() || undefined,
      naverCustomerId: this.fNaverCustomerId().trim() || undefined,
      chPowerlink: this.fChPowerlink(),
      chPowerContent: this.fChPowerContent(),
      chPlace: this.fChPlace(),
      ga4PropertyId: this.fGa4PropertyId().trim() || undefined,
      ga4ServiceAccountKey: this.fGa4ServiceAccountKey().trim() || undefined,
    };

    const editing = this.editingItem();
    if (editing) {
      this.api.updateCompany(editing.id, body).subscribe({
        next: () => {
          this.toast.success('수정되었습니다.');
          this.saving.set(false);
          this.closeForm();
          this.loadData();
        },
        error: () => {
          this.toast.error('수정에 실패했습니다.');
          this.saving.set(false);
        },
      });
    } else {
      this.api.createCompany(body).subscribe({
        next: () => {
          this.toast.success('등록되었습니다.');
          this.saving.set(false);
          this.closeForm();
          this.loadData();
        },
        error: () => {
          this.toast.error('등록에 실패했습니다.');
          this.saving.set(false);
        },
      });
    }
  }

  /* ── 삭제 ── */
  deleteTarget = signal<MarketingCompanyItem | null>(null);
  deleting = signal(false);

  onDelete(item: MarketingCompanyItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.deleteCompany(t.id).subscribe({
      next: () => {
        this.toast.success('삭제되었습니다.');
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error('삭제에 실패했습니다.');
        this.deleting.set(false);
      },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
