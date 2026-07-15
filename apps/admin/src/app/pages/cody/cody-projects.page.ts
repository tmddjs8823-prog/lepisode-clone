import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CodyApiService, CodyProjectApiItem } from '../../shared/services/cody-api.service';

export type ProjectStatus = '대기' | '진행' | '완료' | '보류';

export interface CodyProjectItem {
  id: number;
  status: ProjectStatus;
  projectName: string;
  companyName: string;
  companyId: number;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
}

@Component({
  selector: 'admin-cody-projects-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './cody-projects.page.html',
})
export class CodyProjectsPage implements OnInit {
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private codyApi = inject(CodyApiService);

  data = signal<CodyProjectItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);

  readonly statusOptions: ProjectStatus[] = ['대기', '진행', '완료', '보류'];

  /* ── 기업 드롭다운 (API 연동) ── */
  companyOptions = signal<{ id: number; name: string }[]>([]);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: 'status', label: '상태', align: 'center', width: '8%', type: 'badge',
      badgeMap: {
        '대기': { label: '대기', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
        '진행': { label: '진행', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
        '완료': { label: '완료', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        '보류': { label: '보류', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'projectName', label: '프로젝트명',    align: 'center', width: '30%' },
    { key: 'companyName', label: '기업',         align: 'center', width: '18%' },
    {
      key: '_period', label: '프로젝트 기간', align: 'center', width: '30%',
      transform: (row) => {
        const s = row['startDate'] as string || '';
        const e = row['endDate'] as string || '';
        if (!s && !e) return '-';
        return `${s.substring(0, 10)} ~ ${e.substring(0, 10)}`;
      },
    },
    { key: 'createdAt', label: '등록일자', align: 'center', width: '14%', type: 'date' },
  ];

  /* ── 폼 ── */
  showForm = signal(false);
  editingItem = signal<CodyProjectItem | null>(null);
  saving = signal(false);
  formTitle = computed(() => this.editingItem() ? '프로젝트 수정' : '프로젝트 등록');

  fStatus = signal<ProjectStatus>('대기');
  fProjectName = signal('');
  fCompanyId = signal<number | null>(null);
  fStartDate = signal('');
  fEndDate = signal('');
  fDescription = signal('');

  /* ── 삭제 ── */
  deleteTarget = signal<CodyProjectItem | null>(null);
  deleting = signal(false);

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void {
    this.loadData();
  }

  onSearch(term?: string): void { this.searchTerm.set(term || ''); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'status', header: '상태' },
      { key: 'projectName', header: '프로젝트명' },
      { key: 'companyName', header: '기업' },
      { key: 'startDate', header: '시작일' },
      { key: 'endDate', header: '종료일' },
      { key: 'createdAt', header: '등록일' },
    ], '프로젝트관리');
  }

  /** API에서 프로젝트 목록을 가져옴 */
  loadData(): void {
    this.loading.set(true);
    this.codyApi.getProjects(this.page(), this.limit()).subscribe({
      next: (res) => {
        this.data.set(res.data.map(this.mapApiToItem));
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('프로젝트 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  /** API 응답 → 프론트 인터페이스 매핑 */
  private mapApiToItem(p: CodyProjectApiItem): CodyProjectItem {
    return {
      id: p.id,
      status: (p.status as ProjectStatus) || '대기',
      projectName: p.name,
      companyName: p.company?.name ?? '',
      companyId: p.companyId,
      startDate: p.startDate ?? '',
      endDate: p.endDate ?? '',
      description: p.description ?? '',
      createdAt: p.createdAt,
    };
  }

  /** 기업 드롭다운 API 로드 */
  private loadCompanyOptions(): void {
    this.codyApi.getCompanyNames().subscribe({
      next: (list) => this.companyOptions.set(list),
      error: () => this.toast.error('기업 목록을 불러오지 못했습니다.'),
    });
  }

  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  openForm(item?: CodyProjectItem): void {
    this.loadCompanyOptions();
    if (item) {
      this.editingItem.set(item);
      this.fStatus.set(item.status);
      this.fProjectName.set(item.projectName);
      this.fCompanyId.set(item.companyId);
      this.fStartDate.set(item.startDate ? item.startDate.substring(0, 10) : '');
      this.fEndDate.set(item.endDate ? item.endDate.substring(0, 10) : '');
      this.fDescription.set(item.description);
    } else {
      this.editingItem.set(null);
      this.fStatus.set('대기');
      this.fProjectName.set('');
      this.fCompanyId.set(null);
      this.fStartDate.set('');
      this.fEndDate.set('');
      this.fDescription.set('');
    }
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (!this.fProjectName().trim()) { this.toast.warning('프로젝트명을 입력하세요.'); return; }
    const companyId = this.fCompanyId();
    if (!companyId) { this.toast.warning('기업을 선택하세요.'); return; }

    this.saving.set(true);
    const payload = {
      name: this.fProjectName().trim(),
      status: this.fStatus(),
      companyId,
      startDate: this.fStartDate() || undefined,
      endDate: this.fEndDate() || undefined,
      description: this.fDescription().trim() || undefined,
    };

    const editing = this.editingItem();
    if (editing) {
      this.codyApi.updateProject(editing.id, payload).subscribe({
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
      this.codyApi.createProject(payload).subscribe({
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

  onDelete(item: CodyProjectItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.codyApi.removeProject(t.id).subscribe({
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
