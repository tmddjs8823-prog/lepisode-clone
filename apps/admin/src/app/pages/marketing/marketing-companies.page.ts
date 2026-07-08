import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
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
  imports: [FormsModule, DataTableComponent],
  templateUrl: './marketing-companies.page.html',
})
export class MarketingCompaniesPage {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<MarketingCompany[]>([
    { id: 1, name: '(주)디지털마케팅', slug: 'digital-marketing', manager: '김마케팅', monthlyBudget: 5000000, status: '활성', createdAt: '2025-06-01' },
    { id: 2, name: '소셜미디어랩', slug: 'social-media-lab', manager: '이소셜', monthlyBudget: 3000000, status: '활성', createdAt: '2025-05-15' },
    { id: 3, name: '퍼포먼스원', slug: 'performance-one', manager: '박퍼포', monthlyBudget: 8000000, status: '일시정지', createdAt: '2025-04-20' },
    { id: 4, name: '콘텐츠팩토리', slug: 'contents-factory', manager: '최콘텐', monthlyBudget: 2500000, status: '비활성', createdAt: '2025-03-10' },
    { id: 5, name: '브랜드커넥트', slug: 'brand-connect', manager: '정브랜', monthlyBudget: 6000000, status: '활성', createdAt: '2025-02-01' },
  ]);
  total = signal(5);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id',            label: '순번',     type: 'number', align: 'center', width: '5rem' },
    { key: 'name',          label: '업체명',   align: 'left' },
    { key: 'slug',          label: '슬러그',   align: 'left' },
    { key: 'manager',       label: '담당자',   align: 'center', width: '6rem' },
    { key: 'monthlyBudget', label: '월 예산',  align: 'right',  width: '8rem', transform: (row: Record<string, unknown>) => {
      const v = row['monthlyBudget'] as number;
      return v ? v.toLocaleString('ko-KR') + '원' : '—';
    }},
    { key: 'status',        label: '상태',     align: 'center', width: '6rem' },
    { key: 'createdAt',     label: '등록일자', align: 'center', width: '8rem', type: 'date' },
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
    // TODO: API 연동
    setTimeout(() => {
      this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
      this.saving.set(false);
      this.closeForm();
    }, 500);
  }
}
