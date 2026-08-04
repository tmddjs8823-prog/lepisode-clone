import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FaqApiService,
  FaqCategoryItem,
  FaqItem,
  CreateFaqCategoryPayload,
  CreateFaqPayload,
} from '../../shared/services/faq-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-faq-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './faq.page.html',
})
export class FaqPage implements OnInit {
  private faqApi = inject(FaqApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  loading = signal(false);

  /* ── 카테고리 ── */
  categories = signal<FaqCategoryItem[]>([]);
  catDeleteTarget = signal<FaqCategoryItem | null>(null);
  catDeleting = signal(false);

  // 카테고리 관리 모달 (센터 모달)
  showCatManager = signal(false);

  // 카테고리 폼 (카테고리 관리 모달 내 인라인)
  showCatForm = signal(false);
  editingCat = signal<FaqCategoryItem | null>(null);
  catName = signal('');
  catNameEn = signal('');
  catNameJa = signal('');
  catSaving = signal(false);

  catFormTitle = computed(() => (this.editingCat() ? '카테고리 수정' : '카테고리 추가'));

  /* ── FAQ 항목 ── */
  faqs = signal<FaqItem[]>([]);
  faqDeleteTarget = signal<FaqItem | null>(null);
  faqDeleting = signal(false);
  showFaqForm = signal(false);
  editingFaq = signal<FaqItem | null>(null);
  selectedCatId = signal<number | ''>('');

  faqQuestion = signal('');
  faqQuestionEn = signal('');
  faqQuestionJa = signal('');
  faqAnswer = signal('');
  faqAnswerEn = signal('');
  faqAnswerJa = signal('');
  faqPublished = signal(true);
  faqSortOrder = signal(0);
  faqCategoryId = signal<number>(0);
  faqSaving = signal(false);

  faqFormTitle = computed(() => (this.editingFaq() ? 'FAQ 수정' : 'FAQ 등록'));

  searchTerm = '';

  filteredFaqs = computed(() => {
    const catId = this.selectedCatId();
    let list = catId === '' ? this.faqs() : this.faqs().filter((f) => f.categoryId === Number(catId));
    const term = this.searchTerm.toLowerCase();
    if (term) {
      list = list.filter(item =>
        Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
      );
    }
    return list;
  });

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'sortOrder', label: '순서', align: 'center', width: '8%' },
    {
      key: 'categoryId', label: '카테고리', align: 'center', width: '14%',
      transform: (row) => this.getCategoryName((row as unknown as FaqItem).categoryId),
    },
    { key: 'question', label: '질문', align: 'center', width: '30%' },
    { key: 'answer', label: '답변', align: 'center', width: '30%' },
    {
      key: 'published', label: '게시', align: 'center', width: '10%', type: 'badge',
      badgeMap: {
        true:  { label: '활성', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '비활성', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadFaqs();
  }

  onSearch(): void { /* searchTerm is bound via ngModel in template */ }

  onExportExcel(): void {
    this.excel.export(this.filteredFaqs() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'question', header: '질문' },
      { key: 'answer', header: '답변' },
      { key: 'published', header: '공개여부' },
      { key: 'sortOrder', header: '순서' },
      { key: 'createdAt', header: '등록일' },
    ], 'FAQ');
  }

  /* ── 카테고리 로드 ── */
  loadCategories(): void {
    this.faqApi.getCategories().subscribe({
      next: (list) => this.categories.set(list),
      error: () => this.toast.error('카테고리를 불러오지 못했습니다.'),
    });
  }

  /* ── FAQ 로드 ── */
  loadFaqs(): void {
    this.loading.set(true);
    this.faqApi.getList().subscribe({
      next: (list) => { this.faqs.set(list); this.loading.set(false); },
      error: () => { this.toast.error('FAQ를 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  /* ── 카테고리 관리 모달 ── */
  openCatManager(): void {
    this.showCatForm.set(false);
    this.editingCat.set(null);
    this.showCatManager.set(true);
  }
  closeCatManager(): void {
    this.showCatManager.set(false);
    this.showCatForm.set(false);
  }

  /* ── 카테고리 폼 (모달 내) ── */
  openCatForm(cat?: FaqCategoryItem): void {
    if (cat) {
      this.editingCat.set(cat);
      this.catName.set(cat.name);
      this.catNameEn.set(cat.nameEn ?? '');
      this.catNameJa.set(cat.nameJa ?? '');
    } else {
      this.editingCat.set(null);
      this.catName.set('');
      this.catNameEn.set('');
      this.catNameJa.set('');
    }
    this.showCatForm.set(true);
  }

  closeCatForm(): void {
    this.showCatForm.set(false);
    this.editingCat.set(null);
  }

  saveCat(): void {
    if (!this.catName().trim()) { this.toast.warning('카테고리명을 입력하세요.'); return; }
    const payload: CreateFaqCategoryPayload = {
      name: this.catName().trim(),
      nameEn: this.catNameEn().trim() || undefined,
      nameJa: this.catNameJa().trim() || undefined,
    };
    this.catSaving.set(true);
    const editing = this.editingCat();
    const req = editing
      ? this.faqApi.updateCategory(editing.id, payload)
      : this.faqApi.createCategory(payload);
    req.subscribe({
      next: () => {
        this.toast.success(this.editingCat() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeCatForm();
        this.loadCategories();
        this.catSaving.set(false);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.catSaving.set(false); },
    });
  }

  deleteCat(cat: FaqCategoryItem): void { this.catDeleteTarget.set(cat); }
  confirmDeleteCat(): void {
    const t = this.catDeleteTarget();
    if (!t) return;
    this.catDeleting.set(true);
    this.faqApi.removeCategory(t.id).subscribe({
      next: () => {
        this.toast.success('삭제되었습니다.');
        this.catDeleteTarget.set(null);
        this.catDeleting.set(false);
        this.loadCategories();
      },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.catDeleting.set(false); },
    });
  }
  cancelDeleteCat(): void { this.catDeleteTarget.set(null); }

  /* ── FAQ 폼 ── */
  openFaqForm(faq?: FaqItem): void {
    if (faq) {
      this.editingFaq.set(faq);
      this.faqCategoryId.set(faq.categoryId);
      this.faqQuestion.set(faq.question);
      this.faqQuestionEn.set(faq.questionEn ?? '');
      this.faqQuestionJa.set(faq.questionJa ?? '');
      this.faqAnswer.set(faq.answer);
      this.faqAnswerEn.set(faq.answerEn ?? '');
      this.faqAnswerJa.set(faq.answerJa ?? '');
      this.faqPublished.set(faq.published);
      this.faqSortOrder.set(faq.sortOrder);
    } else {
      this.editingFaq.set(null);
      this.faqCategoryId.set(0);
      this.faqQuestion.set('');
      this.faqQuestionEn.set('');
      this.faqQuestionJa.set('');
      this.faqAnswer.set('');
      this.faqAnswerEn.set('');
      this.faqAnswerJa.set('');
      this.faqPublished.set(true);
      this.faqSortOrder.set(0);
    }
    this.showFaqForm.set(true);
  }

  closeFaqForm(): void { this.showFaqForm.set(false); }

  saveFaq(): void {
    if (!this.faqQuestion().trim() || !this.faqAnswer().trim()) {
      this.toast.warning('질문과 답변을 입력하세요.'); return;
    }
    const payload: CreateFaqPayload = {
      categoryId: this.faqCategoryId(),
      question: this.faqQuestion().trim(),
      questionEn: this.faqQuestionEn().trim() || undefined,
      questionJa: this.faqQuestionJa().trim() || undefined,
      answer: this.faqAnswer().trim(),
      answerEn: this.faqAnswerEn().trim() || undefined,
      answerJa: this.faqAnswerJa().trim() || undefined,
      published: this.faqPublished(),
      sortOrder: this.faqSortOrder(),
    };
    this.faqSaving.set(true);
    const editing = this.editingFaq();
    const req = editing
      ? this.faqApi.update(editing.id, payload)
      : this.faqApi.create(payload);
    req.subscribe({
      next: () => {
        this.toast.success(this.editingFaq() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeFaqForm();
        this.loadFaqs();
        this.faqSaving.set(false);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.faqSaving.set(false); },
    });
  }

  deleteFaq(faq: FaqItem): void { this.faqDeleteTarget.set(faq); }
  confirmDeleteFaq(): void {
    const t = this.faqDeleteTarget();
    if (!t) return;
    this.faqDeleting.set(true);
    this.faqApi.remove(t.id).subscribe({
      next: () => {
        this.toast.success('삭제되었습니다.');
        this.faqDeleteTarget.set(null);
        this.faqDeleting.set(false);
        this.loadFaqs();
      },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.faqDeleting.set(false); },
    });
  }
  cancelDeleteFaq(): void { this.faqDeleteTarget.set(null); }

  getCategoryName(id: number): string {
    return this.categories().find((c) => c.id === id)?.name ?? '—';
  }
}
