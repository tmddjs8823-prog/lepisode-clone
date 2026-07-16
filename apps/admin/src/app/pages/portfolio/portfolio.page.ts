import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PortfolioApiService,
  PortfolioItem,
  CreatePortfolioPayload,
} from '../../shared/services/portfolio-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { RichEditorComponent } from '../../shared/components/rich-editor/rich-editor.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';
import { UploadService } from '../../shared/services/upload.service';

export const SERVICE_TYPES = ['플랫폼', '홈페이지', 'DX(디지털전환)', 'AX(AI전환)', '카탈로그/브랜딩'];

@Component({
  selector: 'admin-portfolio-page',
  imports: [FormsModule, ConfirmDialogComponent, RichEditorComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './portfolio.page.html',
})
export class PortfolioPage implements OnInit {
  private api = inject(PortfolioApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private upload = inject(UploadService);

  readonly serviceTypeOptions = SERVICE_TYPES;

  /* ── 목록 ── */
  data = signal<PortfolioItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(20);
  loading = signal(false);
  filterCategory = signal('');

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: '_category', label: '카테고리', align: 'center', width: '8rem',
      transform: (row) => {
        const cat = row['category'] as string | null;
        return cat || '—';
      },
    },
    { key: 'title',   label: '프로젝트', align: 'center' },
    { key: 'titleEn', label: '영문 제목', align: 'center' },
    { key: 'titleJa', label: '일본어 제목', align: 'center' },
    {
      key: 'keywords', label: '키워드', align: 'center', width: '8rem',
      transform: (row) => {
        const kw = row['keywords'] as string | null;
        if (!kw) return '0개';
        return `${kw.split(',').filter(s => s.trim()).length}개`;
      },
    },
    { key: 'createdAt', label: '등록일자', align: 'center', width: '7.5rem', type: 'date' },
  ];

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));
  pages = computed(() => {
    const cur = this.page(), tot = this.totalPages(), delta = 2, pages: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(tot, cur + delta); i++) pages.push(i);
    return pages;
  });

  deleteTarget = signal<PortfolioItem | null>(null);
  deleting = signal(false);

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '제목' },
      { key: 'titleEn', header: '영문 제목' },
      { key: 'titleJa', header: '일본어 제목' },
      { key: 'client', header: '클라이언트' },
      { key: 'category', header: '카테고리' },
      { key: 'period', header: '기간' },
      { key: 'techStack', header: '기술 스택' },
      { key: 'published', header: '공개여부' },
      { key: 'createdAt', header: '등록일' },
    ], '포트폴리오');
  }

  /* ── 포트폴리오 폼 ── */
  showForm = signal(false);
  fLoading = signal(false);
  editingItem = signal<PortfolioItem | null>(null);
  saving = signal(false);
  formTitle = computed(() => this.editingItem() ? '포트폴리오 수정' : '포트폴리오 등록');

  // 기본 정보
  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');

  // 서비스 유형 (multi-select → category 필드에 콤마 구분 저장)
  fServiceTypes = signal<string[]>([]);

  // 프로젝트 기간
  fStartDate = signal('');
  fEndDate = signal('');

  // SEO
  fSeoTitle = signal('');
  fMetaDesc = signal('');

  // 콘텐츠
  fAeoGeo = signal('');         // AEO/GEO 마크다운 → description
  fServiceDetail = signal('');  // Service Detail → descriptionEn
  fContent = signal('');        // 내용 → descriptionJa

  // 미디어
  fThumbnailUrl = signal('');

  // 키워드 태그 입력
  fKeywordList = signal<string[]>([]);
  fKeywordInput = signal('');

  // 기타
  fPublished = signal(false);
  fSortOrder = signal(0);

  /* ── 키워드 태그 메서드 ── */
  addKeyword(): void {
    const kw = this.fKeywordInput().trim();
    if (!kw) return;
    if (!this.fKeywordList().includes(kw)) {
      this.fKeywordList.update(list => [...list, kw]);
    }
    this.fKeywordInput.set('');
  }

  navigateToDetail(item: PortfolioItem): void {
    this.router.navigate(['/homepage/portfolio', item.id]);
  }

  onKeywordKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addKeyword(); }
  }

  removeKeyword(kw: string): void {
    this.fKeywordList.update(list => list.filter(k => k !== kw));
  }

  /* ── 서비스 유형 토글 ── */
  toggleServiceType(type: string): void {
    const current = this.fServiceTypes();
    if (current.includes(type)) {
      this.fServiceTypes.set(current.filter(t => t !== type));
    } else {
      this.fServiceTypes.set([...current, type]);
    }
  }

  isServiceTypeSelected(type: string): boolean {
    return this.fServiceTypes().includes(type);
  }

  /** 썸네일 파일 업로드 */
  onThumbnailChange(event: Event): void {
    const file = this.upload.extractFile(event);
    if (!file) return;
    this.upload.upload(file, 'portfolio').subscribe({
      next: (res) => {
        this.fThumbnailUrl.set(res.url);
        this.toast.success('썸네일이 업로드되었습니다.');
      },
      error: () => this.toast.error('썸네일 업로드에 실패했습니다.'),
    });
  }

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void { this.loadData(); }

  onSearch(term?: string): void { this.searchTerm.set(typeof term === 'string' ? term : ''); }

  loadData(): void {
    this.loading.set(true);
    const params: Record<string, string | number> = { page: this.page(), limit: this.limit() };
    if (this.filterCategory()) params['category'] = this.filterCategory();
    this.api.getList(params).subscribe({
      next: (res) => { this.data.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  onFilterChange(): void { this.page.set(1); this.loadData(); }
  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  private resetForm(): void {
    this.fTitle.set(''); this.fTitleEn.set(''); this.fTitleJa.set('');
    this.fServiceTypes.set([]);
    this.fStartDate.set(''); this.fEndDate.set('');
    this.fSeoTitle.set(''); this.fMetaDesc.set('');
    this.fAeoGeo.set(''); this.fServiceDetail.set(''); this.fContent.set('');
    this.fThumbnailUrl.set('');
    this.fKeywordInput.set('');
    this.fPublished.set(false); this.fSortOrder.set(0);
  }

  openForm(item?: PortfolioItem): void {
    this.showForm.set(true);
    if (item) {
      this.editingItem.set(item);
      this.fLoading.set(true);
      this.api.getOne(item.id).subscribe({
        next: (d) => {
          this.fTitle.set(d.title);
          this.fTitleEn.set(d.titleEn ?? '');
          this.fTitleJa.set(d.titleJa ?? '');
          // category → 서비스 유형 (콤마 구분)
          this.fServiceTypes.set(d.category ? d.category.split(',').map(s => s.trim()).filter(Boolean) : []);
          // period → 시작일/종료일 파싱
          const parts = (d.period ?? '').split('~').map(s => s.trim());
          this.fStartDate.set(parts[0] ?? '');
          this.fEndDate.set(parts[1] ?? '');
          // SEO
          this.fSeoTitle.set(d.client ?? '');   // client 필드를 SEO 타이틀로 임시 활용
          this.fMetaDesc.set('');
          // 콘텐츠
          this.fAeoGeo.set(d.description ?? '');
          this.fServiceDetail.set(d.descriptionEn ?? '');
          this.fContent.set(d.descriptionJa ?? '');
          // 미디어
          this.fThumbnailUrl.set(d.thumbnailUrl ?? '');
          // 키워드
          const kwds = d.keywords ? d.keywords.split(',').map(s => s.trim()).filter(Boolean) : [];
          this.fKeywordList.set(kwds);
          // 기타
          this.fPublished.set(d.published);
          this.fSortOrder.set(d.sortOrder);
          this.fLoading.set(false);
        },
        error: () => { this.toast.error('정보를 불러오지 못했습니다.'); this.fLoading.set(false); this.closeForm(); },
      });
    } else {
      this.editingItem.set(null);
      this.resetForm();
      this.fLoading.set(false);
    }
  }

  closeForm(): void { this.showForm.set(false); this.fLoading.set(false); this.editingItem.set(null); }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('포트폴리오 명을 입력하세요.'); return; }
    if (!this.fServiceTypes().length) { this.toast.warning('서비스 유형을 하나 이상 선택하세요.'); return; }

    const period = [this.fStartDate(), this.fEndDate()].filter(Boolean).join(' ~ ') || undefined;

    const payload: CreatePortfolioPayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      client: this.fSeoTitle().trim() || undefined,   // SEO 타이틀 임시 저장
      category: this.fServiceTypes().join(', '),
      period,
      keywords: this.fKeywordList().join(', ') || undefined,
      thumbnailUrl: this.fThumbnailUrl().trim() || undefined,
      description: this.fAeoGeo().trim() || undefined,
      descriptionEn: this.fServiceDetail().trim() || undefined,
      descriptionJa: this.fContent().trim() || undefined,
      published: this.fPublished(),
      sortOrder: this.fSortOrder(),
    };
    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing ? this.api.update(editing.id, payload) : this.api.create(payload);
    req.subscribe({
      next: () => { this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.'); this.closeForm(); this.loadData(); this.saving.set(false); },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onDelete(item: PortfolioItem): void { this.deleteTarget.set(item); }
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
