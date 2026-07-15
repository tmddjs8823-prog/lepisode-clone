import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nApiService, TranslationItem, UpsertTranslationPayload } from '../../shared/services/i18n-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-i18n-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './i18n.page.html',
})
export class I18nPage implements OnInit {
  private api = inject(I18nApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  allData = signal<TranslationItem[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  /* ── 탭 ── */
  activeTab = signal<'all' | 'untranslated'>('all');

  filteredData = computed(() => {
    let list = this.allData();
    if (this.activeTab() === 'untranslated') {
      list = list.filter(item => !item.en || !item.ja);
    }
    const term = this.searchTerm().toLowerCase();
    if (term) {
      list = list.filter(item =>
        Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
      );
    }
    return list;
  });

  untranslatedCount = computed(() =>
    this.allData().filter(item => !item.en || !item.ja).length
  );

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id',        label: '순번',   align: 'center', width: '6%', type: 'number' },
    { key: 'key',       label: '키',     align: 'center', width: '18%' },
    { key: 'ko',        label: '한국어', align: 'center', width: '18%' },
    { key: 'en',        label: '영어',   align: 'center', width: '18%' },
    { key: 'ja',        label: '일본어', align: 'center', width: '18%' },
    { key: 'updatedAt', label: '수정일', align: 'center', width: '12%', type: 'date' },
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

  onSearch(): void { /* searchTerm is bound via ngModel in template */ }

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

    const en = this.fEn().trim() || null;
    const ja = this.fJa().trim() || null;

    const payload: UpsertTranslationPayload = {
      key: this.fKey().trim(),
      ko: this.fKo().trim(),
      en,
      ja,
    };

    this.saving.set(true);
    this.api.upsertTranslation(payload).subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeForm();
        this.saving.set(false);
        // 미번역 항목이면 미번역 탭으로 자동 전환
        if (!en || !ja) {
          this.activeTab.set('untranslated');
        }
        this.loadData();
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

  /* ── 엑셀 일괄 등록 ── */
  showBulkUpload = signal(false);
  bulkFile = signal<File | null>(null);
  bulkUploading = signal(false);

  onBulkFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.bulkFile.set(file);
    input.value = '';
  }

  closeBulkUpload(): void {
    this.showBulkUpload.set(false);
    this.bulkFile.set(null);
  }

  uploadBulk(): void {
    const file = this.bulkFile();
    if (!file) return;
    this.bulkUploading.set(true);

    const formData = new FormData();
    formData.append('file', file);

    this.api.bulkUploadTranslations(formData).subscribe({
      next: (res) => {
        this.toast.success(`${res.count ?? 0}건이 등록되었습니다.`);
        this.closeBulkUpload();
        this.bulkUploading.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error('업로드에 실패했습니다.');
        this.bulkUploading.set(false);
      },
    });
  }

  downloadTemplate(): void {
    import('xlsx-js-style').then(XLSX => {
      const headers = ['순번', '키', '한국어', '영어', '일본어'];
      const sampleRow = [1, 'LAYOUT.NAV.HOME', '홈', 'Home', 'ホーム'];
      const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

      // 컬럼 너비
      ws['!cols'] = [
        { wch: 8 },  // 순번
        { wch: 30 }, // 키
        { wch: 20 }, // 한국어
        { wch: 20 }, // 영어
        { wch: 20 }, // 일본어
      ];

      // 헤더 스타일 (순번=초록, 키=노랑, 나머지=기본)
      const font = { name: '맑은 고딕' };
      const greenFill = { fgColor: { rgb: '92D050' } };
      const yellowFill = { fgColor: { rgb: 'FFFF00' } };
      const headerStyle = { font: { ...font, bold: true }, alignment: { horizontal: 'center' } };
      const dataStyle = { font };

      ws['A1'] = { v: '순번', t: 's', s: { ...headerStyle, fill: greenFill } };
      ws['B1'] = { v: '키', t: 's', s: { ...headerStyle, fill: yellowFill } };
      ws['C1'] = { v: '한국어', t: 's', s: { ...headerStyle } };
      ws['D1'] = { v: '영어', t: 's', s: { ...headerStyle } };
      ws['E1'] = { v: '일본어', t: 's', s: { ...headerStyle } };

      // 데이터 행 폰트 적용
      ws['A2'] = { v: 1, t: 'n', s: dataStyle };
      ws['B2'] = { v: 'LAYOUT.NAV.HOME', t: 's', s: dataStyle };
      ws['C2'] = { v: '홈', t: 's', s: dataStyle };
      ws['D2'] = { v: 'Home', t: 's', s: dataStyle };
      ws['E2'] = { v: 'ホーム', t: 's', s: dataStyle };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '다국어');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '다국어일괄등록_양식.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
