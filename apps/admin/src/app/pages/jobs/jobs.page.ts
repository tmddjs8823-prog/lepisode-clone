import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  JobApiService,
  JobItem,
  CreateJobPayload,
} from '../../shared/services/job-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
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
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './jobs.page.html',
})
export class JobsPage implements OnInit {
  private api = inject(JobApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  /* ── 목록 ── */
  data = signal<JobItem[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: 'ID', align: 'center', width: '5%' },
    { key: 'category', label: '카테고리', align: 'center', width: '8%' },
    { key: 'title', label: '제목', align: 'center', width: '18%' },
    { key: 'titleEn', label: '영문 제목', align: 'center', width: '15%' },
    { key: 'titleJa', label: '일본어 제목', align: 'center', width: '15%' },
    { key: 'jobUrl', label: '공고 URL', align: 'center', width: '12%', transform: (row) => {
      const url = row['jobUrl'] as string | null;
      return url || '-';
    }},
    { key: 'startDate', label: '모집 시작일', align: 'center', width: '10%', type: 'date' },
    { key: 'deadline', label: '공고 마감일', align: 'center', width: '10%', type: 'date' },
    { key: 'createdAt', label: '생성일', align: 'center', width: '10%', type: 'date' },
  ];

  /* ── 카테고리 ── */
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
  catFormTitle = computed(() => this.editingCatIndex() !== null ? '카테고리 수정' : '카테고리 추가');

  /* ── 채용 폼 ── */
  showForm = signal(false);
  editingItem = signal<JobItem | null>(null);
  saving = signal(false);
  fLoading = signal(false);
  formTitle = computed(() => this.editingItem() ? '채용 공고 수정' : '채용 공고 등록');

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fCategory = signal('');
  fJobUrl = signal('');
  fStartDate = signal('');
  fDeadline = signal('');
  fPublished = signal(true);
  fSeoTitle = signal('');
  fMetaDesc = signal('');

  deleteTarget = signal<JobItem | null>(null);
  deleting = signal(false);

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void { this.loadData(); }

  onSearch(term?: string): void { this.searchTerm.set(typeof term === 'string' ? term : ''); }

  navigateToDetail(item: JobItem): void {
    this.router.navigate(['/homepage/jobs', item.id]);
  }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '채용 공고명' },
      { key: 'category', header: '직군' },
      { key: 'published', header: '모집상태' },
      { key: 'startDate', header: '시작일' },
      { key: 'deadline', header: '마감일' },
      { key: 'createdAt', header: '등록일' },
    ], '채용관리');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getList(1, 100).subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  /* ── 카테고리 관리 ── */
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
      this.toast.warning('key와 한국어 라벨은 필수입니다.');
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
    this.toast.success(idx !== null ? '카테고리가 수정되었습니다.' : '카테고리가 추가되었습니다.');
    this.closeCatForm();
  }

  deleteCat(index: number): void {
    const list = [...this.categories()];
    list.splice(index, 1);
    this.categories.set(list);
    this.toast.success('카테고리가 삭제되었습니다.');
  }

  getCategoryLabel(key: string): string {
    return this.categories().find(c => c.key === key)?.labelKo ?? key;
  }

  /* ── 채용 폼 ── */
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
        error: () => { this.toast.error('상세 정보를 불러오지 못했습니다.'); this.fLoading.set(false); },
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
    if (!this.fTitle().trim()) { this.toast.warning('공고명을 입력하세요.'); return; }
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
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onDelete(item: JobItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.remove(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
