import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoticeApiService, NoticeItem, CreateNoticePayload } from '../../shared/services/notice-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { UploadService } from '../../shared/services/upload.service';
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
  private router = inject(Router);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private upload = inject(UploadService);

  // 리스트 관련 상태
  data = signal<NoticeItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id',           label: 'ID',        align: 'center', width: '5%',  type: 'number' },
    { key: 'title',        label: '제목',       align: 'center',   width: '18%' },
    { key: 'titleEn',      label: '영문 제목',   align: 'center',   width: '15%' },
    { key: 'titleJa',      label: '일본어 제목',  align: 'center',   width: '15%' },
    { key: 'thumbnailUrl', label: '썸네일',      align: 'center', width: '18%', type: 'image' },
    {
      key: 'published', label: '노출', align: 'center', width: '10%', type: 'badge',
      badgeMap: {
        true:  { label: '노출', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '숨김', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'createdAt',    label: '생성일자',    align: 'center', width: '12%', type: 'date' },
  ];

  deleteTarget = signal<NoticeItem | null>(null);
  deleting = signal(false);

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));
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
  fThumbnailPreview = signal('');
  fThumbnailFile = signal<File | null>(null);
  fPublished = signal(true);
  fIsPinned = signal(false);
  fSeoTitle = signal('');
  fMetaDesc = signal('');

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });

  ngOnInit(): void { this.loadData(); }

  onSearch(term?: string): void { this.searchTerm.set(term || ''); }

  navigateToDetail(item: NoticeItem): void {
    this.router.navigate(['/homepage/notices', item.id]);
  }

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
    this.noticeApi.getList(this.page(), this.limit()).subscribe({
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
          this.fThumbnailPreview.set(detail.thumbnailUrl ?? '');
          this.fThumbnailFile.set(null);
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
      this.fThumbnailPreview.set('');
      this.fThumbnailFile.set(null);
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
      this.fThumbnailFile.set(file);
      this.fThumbnailPreview.set(URL.createObjectURL(file));
    }
  }

  removeThumbnail(): void {
    this.fThumbnailUrl.set('');
    this.fThumbnailPreview.set('');
    this.fThumbnailFile.set(null);
  }

  save(): void {
    if (!this.fTitle().trim() || !this.fContent().trim()) {
      this.toast.warning('제목과 내용을 입력해주세요.');
      return;
    }

    this.saving.set(true);

    const doSave = (thumbnailUrl?: string) => {
      const payload: CreateNoticePayload = {
        title: this.fTitle().trim(),
        titleEn: this.fTitleEn().trim() || undefined,
        titleJa: this.fTitleJa().trim() || undefined,
        content: this.fContent().trim(),
        contentEn: this.fContentEn().trim() || undefined,
        contentJa: this.fContentJa().trim() || undefined,
        thumbnailUrl: thumbnailUrl || this.fThumbnailUrl() || undefined,
        published: this.fPublished(),
        isPinned: this.fIsPinned(),
      };

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
    };

    const thumbFile = this.fThumbnailFile();
    if (thumbFile) {
      this.upload.upload(thumbFile, 'notices').subscribe({
        next: (res) => doSave(res.url),
        error: () => { this.toast.error('이미지 업로드에 실패했습니다.'); this.saving.set(false); },
      });
    } else {
      doSave();
    }
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
