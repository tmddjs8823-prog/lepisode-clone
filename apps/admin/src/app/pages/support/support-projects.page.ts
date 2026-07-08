import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SupportApiService,
  SupportProjectItem,
  CreateSupportProjectPayload,
} from '../../shared/services/support-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-support-projects-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './support-projects.page.html',
})
export class SupportProjectsPage implements OnInit {
  private api = inject(SupportApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<SupportProjectItem[]>([]);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'title',     label: '지원사업명', align: 'left' },
    { key: 'slug',      label: '슬러그',    align: 'left' },
    {
      key: 'published', label: '노출여부', align: 'center', width: '6rem', type: 'badge',
      badgeMap: {
        true:  { label: '노출', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '숨김', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'updatedAt', label: '수정일', align: 'center', width: '7.5rem', type: 'date' },
  ];
  showForm = signal(false);
  editingItem = signal<SupportProjectItem | null>(null);
  saving = signal(false);
  deleteTarget = signal<SupportProjectItem | null>(null);
  deleting = signal(false);

  formTitle = computed(() => (this.editingItem() ? '지원사업 수정' : '지원사업 등록'));

  fTitle = signal('');
  fSlug = signal('');
  fPublished = signal(true);
  fSortOrder = signal(0);

  ngOnInit(): void { this.loadData(); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '지원사업명' },
      { key: 'slug', header: '슬러그' },
      { key: 'published', header: '노출여부' },
      { key: 'sortOrder', header: '순서' },
      { key: 'updatedAt', header: '수정일' },
    ], '지원사업');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getProjects().subscribe({
      next: (list) => { this.data.set(list); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  openForm(item?: SupportProjectItem): void {
    this.editingItem.set(item ?? null);
    this.fTitle.set(item?.title ?? '');
    this.fSlug.set(item?.slug ?? '');
    this.fPublished.set(item?.published ?? true);
    this.fSortOrder.set(item?.sortOrder ?? 0);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  autoSlug(): void {
    if (!this.fSlug()) {
      this.fSlug.set(
        this.fTitle()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      );
    }
  }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('지원사업명을 입력하세요.'); return; }
    if (!this.fSlug().trim()) { this.toast.warning('슬러그를 입력하세요.'); return; }
    const payload: CreateSupportProjectPayload = {
      title: this.fTitle().trim(),
      slug: this.fSlug().trim(),
      published: this.fPublished(),
      sortOrder: this.fSortOrder(),
    };
    this.saving.set(true);
    const req = this.editingItem()
      ? this.api.updateProject(this.editingItem()!.id, payload)
      : this.api.createProject(payload);
    req.subscribe({
      next: () => { this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.'); this.closeForm(); this.loadData(); this.saving.set(false); },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onDelete(item: SupportProjectItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.api.removeProject(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
