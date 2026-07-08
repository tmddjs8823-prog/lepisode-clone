import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SupportApiService,
  ProjectStatusItem,
  ProjectStatusType,
  CreateProjectStatusPayload,
} from '../../shared/services/support-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

const STATUS_META: Record<ProjectStatusType, { label: string; class: string }> = {
  ESTIMATING:  { label: '견적 중',   class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  IN_PROGRESS: { label: '진행 중',   class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  COMPLETE:    { label: '납품 완료', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

@Component({
  selector: 'admin-project-statuses-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './project-statuses.page.html',
})
export class ProjectStatusesPage implements OnInit {
  private api = inject(SupportApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  readonly statusMeta = STATUS_META;
  readonly statusOptions: ProjectStatusType[] = ['ESTIMATING', 'IN_PROGRESS', 'COMPLETE'];
  readonly platformOptions = ['안드로이드', 'iOS', '웹'];

  data = signal<ProjectStatusItem[]>([]);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'sortOrder',  label: '순서',     align: 'center', width: '4.5rem', type: 'number' },
    { key: 'title',      label: '프로젝트명', align: 'left' },
    { key: 'clientName', label: '클라이언트', align: 'left' },
    {
      key: 'status', label: '상태', align: 'center', width: '7rem', type: 'badge',
      badgeMap: {
        ESTIMATING:  { label: '견적 중',   class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
        IN_PROGRESS: { label: '진행 중',   class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
        COMPLETE:    { label: '납품 완료', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
      },
    },
    { key: 'createdAt',  label: '등록일자', align: 'center', width: '7.5rem', type: 'date' },
    {
      key: 'published', label: '노출여부', align: 'center', width: '6rem', type: 'badge',
      badgeMap: {
        true:  { label: '노출', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '숨김', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
  ];
  showForm = signal(false);
  editingItem = signal<ProjectStatusItem | null>(null);
  saving = signal(false);
  deleteTarget = signal<ProjectStatusItem | null>(null);
  deleting = signal(false);

  formTitle = computed(() => (this.editingItem() ? '현황 수정' : '현황 등록'));

  // 폼 필드
  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fClient = signal('');
  fPlatforms = signal<string[]>([]);
  fStartDate = signal('');
  fEndDate = signal('');
  fStatus = signal<ProjectStatusType>('ESTIMATING');
  fEmail = signal('');
  fPhone = signal('');
  fAttachmentUrl = signal('');
  fMemo = signal('');
  fContent = signal('');
  fPublished = signal(true);
  fSortOrder = signal(0);

  ngOnInit(): void { this.loadData(); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '현황명' },
      { key: 'client', header: '클라이언트' },
      { key: 'platforms', header: '플랫폼' },
      { key: 'status', header: '상태' },
      { key: 'startDate', header: '시작일' },
      { key: 'endDate', header: '종료일' },
      { key: 'published', header: '공개여부' },
      { key: 'createdAt', header: '등록일' },
    ], '현황_관리');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getStatuses().subscribe({
      next: (list) => { this.data.set(list); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  togglePlatform(p: string) {
    const current = this.fPlatforms();
    if (current.includes(p)) {
      this.fPlatforms.set(current.filter(x => x !== p));
    } else {
      this.fPlatforms.set([...current, p]);
    }
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.toast.info('파일 업로드는 서버 연동이 필요합니다.');
      this.fAttachmentUrl.set('https://dummyimage.com/100x100/ccc/000.png&text=DOC'); // 임시 경로
    }
  }

  openForm(item?: ProjectStatusItem): void {
    this.editingItem.set(item ?? null);
    this.fTitle.set(item?.title ?? '');
    this.fTitleEn.set(item?.titleEn ?? '');
    this.fTitleJa.set(item?.titleJa ?? '');
    this.fClient.set(item?.client ?? '');
    this.fPlatforms.set(item?.platforms ?? []);
    this.fStartDate.set(item?.startDate ? item.startDate.slice(0, 10) : '');
    this.fEndDate.set(item?.endDate ? item.endDate.slice(0, 10) : '');
    this.fStatus.set(item?.status ?? 'ESTIMATING');
    this.fEmail.set(item?.email ?? '');
    this.fPhone.set(item?.phone ?? '');
    this.fAttachmentUrl.set(item?.attachmentUrl ?? '');
    this.fMemo.set(item?.memo ?? '');
    this.fContent.set(item?.content ?? '');
    this.fPublished.set(item?.published ?? true);
    this.fSortOrder.set(item?.sortOrder ?? 0);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('제목을 입력하세요.'); return; }
    if (!this.fClient().trim()) { this.toast.warning('클라이언트를 입력하세요.'); return; }

    const payload: CreateProjectStatusPayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      client: this.fClient().trim(),
      platforms: this.fPlatforms(),
      startDate: this.fStartDate() || undefined,
      endDate: this.fEndDate() || undefined,
      status: this.fStatus(),
      email: this.fEmail().trim() || undefined,
      phone: this.fPhone().trim() || undefined,
      attachmentUrl: this.fAttachmentUrl() || undefined,
      memo: this.fMemo() || undefined,
      content: this.fContent() || undefined,
      published: this.fPublished(),
      sortOrder: this.fSortOrder(),
    };

    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing
      ? this.api.updateStatus(editing.id, payload)
      : this.api.createStatus(payload);
    
    req.subscribe({
      next: () => { 
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.'); 
        this.closeForm(); 
        this.loadData(); 
        this.saving.set(false); 
      },
      error: () => { 
        this.toast.error('저장에 실패했습니다.'); 
        this.saving.set(false); 
      },
    });
  }

  onDelete(item: ProjectStatusItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.api.removeStatus(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }

  getStatusMeta(s: ProjectStatusType) { return STATUS_META[s]; }
}
