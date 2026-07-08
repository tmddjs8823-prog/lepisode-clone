import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoticeApiService, NoticeItem, CreateNoticePayload } from '../../shared/services/notice-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-notices-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './notices.page.html',
})
export class NoticesPage implements OnInit {
  private noticeApi = inject(NoticeApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  // 리스트 관련 상태
  data = signal<NoticeItem[]>([]);
  total = signal(0);
  page = signal(1);
  readonly limit = 10;
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id',           label: 'ID',    align: 'center', width: '4rem', type: 'number' },
    { key: 'title',        label: '\uc81c\ubaa9',  align: 'left' },
    { key: 'thumbnailUrl', label: '\uc12c\ub124\uc77c', align: 'center', width: '5.5rem', type: 'image' },
    {
      key: 'published', label: '\ub178\ucd9c', align: 'center', width: '6rem', type: 'badge',
      badgeMap: {
        true:  { label: '\ub178\ucd9c', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '\uc228\uae40', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'createdAt',    label: '\ub4f1\ub85d\uc77c\uc790', align: 'center', width: '7.5rem', type: 'date' },
  ];

  deleteTarget = signal<NoticeItem | null>(null);
  deleting = signal(false);

  totalPages = computed(() => Math.ceil(this.total() / this.limit));
  pages = computed(() => {
    const cur = this.page();
    const total = this.totalPages();
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) pages.push(i);
    return pages;
  });

  // 모달(서랍) 관련 상태
  showForm = signal(false);
  editingItem = signal<NoticeItem | null>(null);
  saving = signal(false);
  formTitle = computed(() => (this.editingItem() ? '공지사항 수정' : '공지사항 등록'));

  // 폼 필드
  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fContent = signal('');
  fContentEn = signal('');
  fContentJa = signal('');
  fThumbnailUrl = signal('');
  fPublished = signal(true);
  fIsPinned = signal(false);

  ngOnInit(): void { this.loadData(); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '제목' },
      { key: 'titleEn', header: '영문 제목' },
      { key: 'titleJa', header: '일본어 제목' },
      { key: 'published', header: '공개여부' },
      { key: 'isPinned', header: '고정' },
      { key: 'createdAt', header: '등록일' },
    ], '공지사항');
  }

  loadData(): void {
    this.loading.set(true);
    this.noticeApi.getList(this.page(), this.limit).subscribe({
      next: (res) => { this.data.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오는데 실패했습니다.'); this.loading.set(false); },
    });
  }

  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  openForm(item?: NoticeItem): void {
    if (item) {
      this.editingItem.set(item);
      this.noticeApi.getOne(item.id).subscribe({
        next: (detail) => {
          this.fTitle.set(detail.title);
          this.fTitleEn.set(detail.titleEn ?? '');
          this.fTitleJa.set(detail.titleJa ?? '');
          this.fContent.set(detail.content);
          this.fContentEn.set(detail.contentEn ?? '');
          this.fContentJa.set(detail.contentJa ?? '');
          this.fThumbnailUrl.set(detail.thumbnailUrl ?? '');
          this.fPublished.set(detail.published);
          this.fIsPinned.set(detail.isPinned);
        },
        error: () => this.toast.error('상세 정보를 불러오지 못했습니다.')
      });
    } else {
      this.editingItem.set(null);
      this.fTitle.set('');
      this.fTitleEn.set('');
      this.fTitleJa.set('');
      this.fContent.set('');
      this.fContentEn.set('');
      this.fContentJa.set('');
      this.fThumbnailUrl.set('');
      this.fPublished.set(true);
      this.fIsPinned.set(false);
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.toast.info('이미지 업로드 기능은 서버 연동이 필요합니다.');
      this.fThumbnailUrl.set('https://via.placeholder.com/150');
    }
  }

  save(): void {
    if (!this.fTitle().trim() || !this.fContent().trim()) {
      this.toast.warning('제목과 내용을 입력해주세요.');
      return;
    }

    const payload: CreateNoticePayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      content: this.fContent().trim(),
      contentEn: this.fContentEn().trim() || undefined,
      contentJa: this.fContentJa().trim() || undefined,
      thumbnailUrl: this.fThumbnailUrl() || undefined,
      published: this.fPublished(),
      isPinned: this.fIsPinned(),
    };

    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing
      ? this.noticeApi.update(editing.id, payload)
      : this.noticeApi.create(payload);

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

  onDelete(item: NoticeItem): void { this.deleteTarget.set(item); }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.noticeApi.remove(target.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }

  cancelDelete(): void { this.deleteTarget.set(null); }
}
