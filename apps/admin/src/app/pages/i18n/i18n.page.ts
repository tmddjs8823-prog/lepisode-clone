import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nApiService, TranslationItem, UpsertTranslationPayload } from '../../shared/services/i18n-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-i18n-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './i18n.page.html',
})
export class I18nPage implements OnInit {
  private api = inject(I18nApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  allData = signal<TranslationItem[]>([]);
  loading = signal(false);

  /* ── 탭 ── */
  activeTab = signal<'all' | 'untranslated'>('all');

  filteredData = computed(() => {
    const list = this.allData();
    if (this.activeTab() === 'untranslated') {
      return list.filter(item => !item.en || !item.ja);
    }
    return list;
  });

  untranslatedCount = computed(() =>
    this.allData().filter(item => !item.en || !item.ja).length
  );

  /* ── 데이터 그리드 컬럼 ── */
  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id',        label: '순번',   align: 'center', width: '4.5rem', type: 'number' },
    { key: 'key',       label: '키',     align: 'left' },
    { key: 'ko',        label: '한국어', align: 'left' },
    { key: 'en',        label: '영어',   align: 'left' },
    { key: 'ja',        label: '일본어', align: 'left' },
    { key: 'updatedAt', label: '수정일', align: 'center', width: '7.5rem', type: 'date' },
  ];

  /* ── 폼 ── */
  showForm = signal(false);
  saving = signal(false);
  editingItem = signal<TranslationItem | null>(null);
  formTitle = computed(() => this.editingItem() ? '번역 수정' : '번역 등록');

  fKey = signal('');
  fKo = signal('');
  fEn = signal('');
  fJa = signal('');

  /* ── 삭제 ── */
  deleteTarget = signal<TranslationItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void { this.loadData(); }

  switchTab(tab: 'all' | 'untranslated'): void {
    this.activeTab.set(tab);
  }

  onExportExcel(): void {
    this.excel.export(this.filteredData() as unknown as Record<string, unknown>[], [
      { key: 'id', header: '순번' },
      { key: 'key', header: '키' },
      { key: 'ko', header: '한국어' },
      { key: 'en', header: '영어' },
      { key: 'ja', header: '일본어' },
      { key: 'updatedAt', header: '수정일' },
    ], '다국어_관리');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getTranslations().subscribe({
      next: (list) => { this.allData.set(list); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  openForm(item?: TranslationItem): void {
    this.editingItem.set(item ?? null);
    this.fKey.set(item?.key ?? '');
    this.fKo.set(item?.ko ?? '');
    this.fEn.set(item?.en ?? '');
    this.fJa.set(item?.ja ?? '');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (!this.fKey().trim()) { this.toast.warning('키를 입력하세요.'); return; }
    if (!this.fKo().trim()) { this.toast.warning('한국어 값을 입력하세요.'); return; }

    const payload: UpsertTranslationPayload = {
      key: this.fKey().trim(),
      ko: this.fKo().trim(),
      en: this.fEn().trim() || undefined,
      ja: this.fJa().trim() || undefined,
    };

    this.saving.set(true);
    this.api.upsertTranslation(payload).subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onDelete(item: TranslationItem): void { this.deleteTarget.set(item); }

  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.api.removeTranslation(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }

  cancelDelete(): void { this.deleteTarget.set(null); }
}
