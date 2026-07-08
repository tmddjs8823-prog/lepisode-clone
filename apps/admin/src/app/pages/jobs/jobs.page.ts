import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  JobApiService,
  JobItem,
  CreateJobPayload,
} from '../../shared/services/job-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

export interface JobCategory {
  key: string;
  labelKo: string;
  labelEn: string;
  labelJa: string;
  sortOrder: number;
}

const DEFAULT_CATEGORIES: JobCategory[] = [
  { key: 'dev', labelKo: '개발', labelEn: 'Development', labelJa: '開発', sortOrder: 1 },
  { key: 'design', labelKo: '디자인', labelEn: 'Design', labelJa: 'デザイン', sortOrder: 2 },
  { key: 'pm', labelKo: '기획', labelEn: 'PM/Planning', labelJa: '企画', sortOrder: 3 },
  { key: 'marketing', labelKo: '마케팅', labelEn: 'Marketing', labelJa: 'マーケティング', sortOrder: 4 },
];

@Component({
  selector: 'admin-jobs-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './jobs.page.html',
})
export class JobsPage implements OnInit {
  private api = inject(JobApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  /* \u2500\u2500 \uBAA9\uB85D \u2500\u2500 */
  data = signal<JobItem[]>([]);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: 'ID', align: 'center', width: '4rem' },
    { key: 'category', label: '카테고리', align: 'center', width: '6rem' },
    { key: 'title', label: '채용 공고명', align: 'left' },
    {
      key: 'titleEn', label: '영문/일어', align: 'left',
      transform: (row) => {
        const r = row as unknown as JobItem;
        const parts: string[] = [];
        if (r.titleEn) parts.push('EN: ' + r.titleEn);
        if (r.titleJa) parts.push('JA: ' + r.titleJa);
        return parts.join(' | ') || '—';
      },
    },
    {
      key: 'published', label: '상태', align: 'center', width: '5rem', type: 'badge',
      badgeMap: {
        true:  { label: '모집중', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '마감', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    {
      key: 'startDate', label: '모집기간', align: 'center', width: '10rem',
      transform: (row) => {
        const r = row as unknown as JobItem;
        const s = r.startDate ? r.startDate.slice(0, 10) : '—';
        const d = r.deadline ? r.deadline.slice(0, 10) : '상시모집';
        return `${s} ~ ${d}`;
      },
    },
  ];

  /* \u2500\u2500 \uCE74\uD14C\uACE0\uB9AC \u2500\u2500 */
  categories = signal<JobCategory[]>(DEFAULT_CATEGORIES);
  showCatManager = signal(false);
  showCatForm = signal(false);
  editingCatIndex = signal<number | null>(null);
  catKey = signal('');
  catLabelKo = signal('');
  catLabelEn = signal('');
  catLabelJa = signal('');
  catSortOrder = signal(0);
  catSaving = signal(false);
  catFormTitle = computed(() => this.editingCatIndex() !== null ? '\uCE74\uD14C\uACE0\uB9AC \uC218\uC815' : '\uCE74\uD14C\uACE0\uB9AC \uCD94\uAC00');

  /* \u2500\u2500 \uCC44\uC6A9 \uD3FC \u2500\u2500 */
  showForm = signal(false);
  editingItem = signal<JobItem | null>(null);
  saving = signal(false);
  fLoading = signal(false);
  formTitle = computed(() => this.editingItem() ? '\uCC44\uC6A9 \uACF5\uACE0 \uC218\uC815' : '\uCC44\uC6A9 \uACF5\uACE0 \uB4F1\uB85D');

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fCategory = signal('');
  fJobUrl = signal('');
  fStartDate = signal('');
  fDeadline = signal('');
  fPublished = signal(true);

  deleteTarget = signal<JobItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void { this.loadData(); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '\uCC44\uC6A9 \uACF5\uACE0\uBA85' },
      { key: 'category', header: '\uC9C1\uAD70' },
      { key: 'published', header: '\uBAA8\uC9D1\uC0C1\uD0DC' },
      { key: 'startDate', header: '\uC2DC\uC791\uC77C' },
      { key: 'deadline', header: '\uB9C8\uAC10\uC77C' },
      { key: 'createdAt', header: '\uB4F1\uB85D\uC77C' },
    ], '\uCC44\uC6A9\uAD00\uB9AC');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getList(1, 100).subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => { this.toast.error('\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'); this.loading.set(false); },
    });
  }

  /* \u2500\u2500 \uCE74\uD14C\uACE0\uB9AC \uAD00\uB9AC \u2500\u2500 */
  openCatManager(): void { this.showCatManager.set(true); this.showCatForm.set(false); }
  closeCatManager(): void { this.showCatManager.set(false); this.showCatForm.set(false); }

  openCatForm(index?: number): void {
    if (index !== undefined) {
      const cat = this.categories()[index];
      this.editingCatIndex.set(index);
      this.catKey.set(cat.key);
      this.catLabelKo.set(cat.labelKo);
      this.catLabelEn.set(cat.labelEn);
      this.catLabelJa.set(cat.labelJa);
      this.catSortOrder.set(cat.sortOrder);
    } else {
      this.editingCatIndex.set(null);
      this.catKey.set('');
      this.catLabelKo.set('');
      this.catLabelEn.set('');
      this.catLabelJa.set('');
      this.catSortOrder.set(0);
    }
    this.showCatForm.set(true);
  }

  closeCatForm(): void { this.showCatForm.set(false); this.editingCatIndex.set(null); }

  saveCat(): void {
    if (!this.catKey().trim() || !this.catLabelKo().trim()) {
      this.toast.warning('key\uC640 \uD55C\uAD6D\uC5B4 \uB77C\uBCA8\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.');
      return;
    }
    const cat: JobCategory = {
      key: this.catKey().trim(),
      labelKo: this.catLabelKo().trim(),
      labelEn: this.catLabelEn().trim(),
      labelJa: this.catLabelJa().trim(),
      sortOrder: this.catSortOrder(),
    };
    const list = [...this.categories()];
    const idx = this.editingCatIndex();
    if (idx !== null) {
      list[idx] = cat;
    } else {
      list.push(cat);
    }
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    this.categories.set(list);
    this.toast.success(idx !== null ? '\uCE74\uD14C\uACE0\uB9AC\uAC00 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.' : '\uCE74\uD14C\uACE0\uB9AC\uAC00 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
    this.closeCatForm();
  }

  deleteCat(index: number): void {
    const list = [...this.categories()];
    list.splice(index, 1);
    this.categories.set(list);
    this.toast.success('\uCE74\uD14C\uACE0\uB9AC\uAC00 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
  }

  getCategoryLabel(key: string): string {
    return this.categories().find(c => c.key === key)?.labelKo ?? key;
  }

  /* \u2500\u2500 \uCC44\uC6A9 \uD3FC \u2500\u2500 */
  openForm(item?: JobItem): void {
    if (item) {
      this.editingItem.set(item);
      this.fLoading.set(true);
      this.api.getOne(item.id).subscribe({
        next: (detail) => {
          this.fTitle.set(detail.title);
          this.fTitleEn.set(detail.titleEn ?? '');
          this.fTitleJa.set(detail.titleJa ?? '');
          this.fCategory.set(detail.category ?? '');
          this.fJobUrl.set(detail.jobUrl ?? '');
          this.fStartDate.set(detail.startDate ? detail.startDate.slice(0, 10) : '');
          this.fDeadline.set(detail.deadline ? detail.deadline.slice(0, 10) : '');
          this.fPublished.set(detail.published);
          this.fLoading.set(false);
        },
        error: () => { this.toast.error('\uC0C1\uC138 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'); this.fLoading.set(false); },
      });
    } else {
      this.editingItem.set(null);
      this.fTitle.set('');
      this.fTitleEn.set('');
      this.fTitleJa.set('');
      this.fCategory.set('');
      this.fJobUrl.set('');
      this.fStartDate.set('');
      this.fDeadline.set('');
      this.fPublished.set(true);
    }
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); this.editingItem.set(null); }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('\uACF5\uACE0\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694.'); return; }
    const payload: CreateJobPayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      category: this.fCategory() || undefined,
      jobUrl: this.fJobUrl().trim() || undefined,
      startDate: this.fStartDate() || undefined,
      deadline: this.fDeadline() || undefined,
      published: this.fPublished(),
    };

    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing
      ? this.api.update(editing.id, payload)
      : this.api.create(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '\uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.' : '\uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: () => { this.toast.error('\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.'); this.saving.set(false); },
    });
  }

  onDelete(item: JobItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.remove(t.id).subscribe({
      next: () => { this.toast.success('\uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('\uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
