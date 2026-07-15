import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CodyApiService, CodyCreditApiItem } from '../../shared/services/cody-api.service';

export type CreditType = '충전' | '차감';

export interface CodyCreditItem {
  id: number;
  type: CreditType;
  companyId: number;
  companyName: string;
  projectId: number | null;
  projectName: string;
  description: string;
  amount: number;
  manager: string;
  createdAt: string;
}

@Component({
  selector: 'admin-cody-credits-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './cody-credits.page.html',
})
export class CodyCreditsPage implements OnInit {
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private codyApi = inject(CodyApiService);

  data = signal<CodyCreditItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);

  readonly typeOptions: CreditType[] = ['충전', '차감'];

  /* ── 프로젝트 드롭다운 (코디 > 프로젝트 관리 API 연동) ── */
  projectOptions = signal<{ id: number; name: string; companyId: number }[]>([]);

  /* ── 기업 드롭다운 (코디 > 기업 관리 API 연동) ── */
  companyOptions = signal<{ id: number; name: string }[]>([]);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: '순번', align: 'center', width: '6%', type: 'number' },
    {
      key: 'type', label: '유형', align: 'center', width: '13%', type: 'badge',
      badgeMap: {
        '충전': { label: '충전', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        '차감': { label: '차감', class: 'bg-red-500/10 text-red-400 border border-red-500/20' },
      },
    },
    { key: 'companyName', label: '기업',   align: 'center',   width: '13%' },
    { key: 'projectName', label: '프로젝트', align: 'center',   width: '13%' },
    { key: 'description', label: '내용',   align: 'center',   width: '20%' },
    {
      key: 'amount', label: '금액', align: 'center', width: '12%',
      transform: (row) => {
        const val = row['amount'] as number;
        return val.toLocaleString('ko-KR') + '원';
      },
    },
    { key: 'manager',   label: '담당자', align: 'center', width: '8%' },
    { key: 'createdAt', label: '등록일자', align: 'center', width: '8%', type: 'date' },
  ];

  /* ── 폼 ── */
  showForm = signal(false);
  editingItem = signal<CodyCreditItem | null>(null);
  saving = signal(false);
  formTitle = computed(() => this.editingItem() ? '크레딧 수정' : '크레딧 등록');

  fType = signal<CreditType>('충전');
  fCompanyId = signal<number | null>(null);
  fProjectId = signal<number | null>(null);
  fDescription = signal('');
  fAmount = signal(0);

  /* ── 삭제 ── */
  deleteTarget = signal<CodyCreditItem | null>(null);
  deleting = signal(false);

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });

  /** 선택된 기업에 속하는 프로젝트만 필터 */
  filteredProjectOptions = computed(() => {
    const cid = this.fCompanyId();
    if (!cid) return this.projectOptions();
    return this.projectOptions().filter(p => p.companyId === cid);
  });

  ngOnInit(): void {
    this.loadData();
    this.loadCompanyOptions();
    this.loadProjectOptions();
  }

  onSearch(term?: string): void { this.searchTerm.set(term || ''); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: '순번' },
      { key: 'type', header: '유형' },
      { key: 'companyName', header: '기업' },
      { key: 'projectName', header: '프로젝트' },
      { key: 'description', header: '내용' },
      { key: 'amount', header: '금액' },
      { key: 'createdAt', header: '등록일자' },
    ], '크레딧');
  }

  loadData(): void {
    this.loading.set(true);
    this.codyApi.getCredits(this.page(), this.limit()).subscribe({
      next: (res) => {
        this.data.set(res.data.map(this.mapApiToItem));
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('크레딧 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  private mapApiToItem(c: CodyCreditApiItem): CodyCreditItem {
    const typeMap: Record<string, CreditType> = { 'CHARGE': '충전', 'USE': '차감', 'REFUND': '충전', 'ADJUST': '차감' };
    return {
      id: c.id,
      type: typeMap[c.type] ?? '충전',
      companyId: c.companyId,
      companyName: c.company?.name ?? '',
      projectId: c.projectId,
      projectName: c.project?.name ?? '',
      description: c.description ?? '',
      amount: Number(c.amount),
      manager: c.manager ?? '',
      createdAt: c.createdAt,
    };
  }

  /** 코디 > 기업 관리 API에서 데이터를 가져와 드롭다운 옵션 구성 */
  private loadCompanyOptions(): void {
    this.codyApi.getCompanyNames().subscribe({
      next: (list) => this.companyOptions.set(list),
      error: () => this.toast.error('기업 목록을 불러오지 못했습니다.'),
    });
  }

  /** 코디 > 프로젝트 관리 API에서 데이터를 가져와 드롭다운 옵션 구성 */
  private loadProjectOptions(): void {
    this.codyApi.getProjectNames().subscribe({
      next: (list) => this.projectOptions.set(list),
      error: () => this.toast.error('프로젝트 목록을 불러오지 못했습니다.'),
    });
  }

  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  openForm(item?: CodyCreditItem): void {
    this.loadCompanyOptions();
    this.loadProjectOptions();
    if (item) {
      this.editingItem.set(item);
      this.fType.set(item.type);
      this.fCompanyId.set(item.companyId);
      this.fProjectId.set(item.projectId);
      this.fDescription.set(item.description);
      this.fAmount.set(item.amount);
    } else {
      this.editingItem.set(null);
      this.fType.set('충전');
      this.fCompanyId.set(null);
      this.fProjectId.set(null);
      this.fDescription.set('');
      this.fAmount.set(0);
    }
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (!this.fCompanyId()) { this.toast.warning('기업을 선택하세요.'); return; }
    if (!this.fDescription().trim()) { this.toast.warning('내용을 입력하세요.'); return; }
    if (!this.fAmount()) { this.toast.warning('금액을 입력하세요.'); return; }

    this.saving.set(true);
    const typeMap: Record<CreditType, string> = { '충전': 'CHARGE', '차감': 'USE' };
    const companyId = this.fCompanyId();
    if (!companyId) return;
    const payload = {
      type: typeMap[this.fType()],
      companyId,
      projectId: this.fProjectId() ?? undefined,
      description: this.fDescription().trim(),
      amount: String(this.fAmount()),
    };

    this.codyApi.createCredit(payload).subscribe({
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

  onDelete(item: CodyCreditItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.codyApi.removeCredit(t.id).subscribe({
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
