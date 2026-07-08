import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ServiceApiService,
  ServiceItem,
  CreateServicePayload,
} from '../../shared/services/service-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

@Component({
  selector: 'admin-services-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './services.page.html',
})
export class ServicesPage implements OnInit {
  private api = inject(ServiceApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<ServiceItem[]>([]);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'sortOrder', label: '순서',    align: 'center', width: '4.5rem', type: 'number' },
    { key: 'title',     label: '서비스명', align: 'left' },
    { key: 'titleEn',   label: '영문 제목', align: 'left' },
    { key: 'slug',      label: 'Slug',     align: 'left' },
    {
      key: 'isPublished', label: '노출여부', align: 'center', width: '6rem', type: 'badge',
      badgeMap: {
        true:  { label: '노출', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '숨김', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
  ];
  
  // 모달(우측 서랍) 관련 상태
  showForm = signal(false);
  editingItem = signal<ServiceItem | null>(null);
  saving = signal(false);
  deleteTarget = signal<ServiceItem | null>(null);
  deleting = signal(false);

  formTitle = computed(() => (this.editingItem() ? '서비스 수정' : '서비스 등록'));

  // 폼 필드
  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fSlug = signal('');
  fSeoTitle = signal('');
  fSeoDescription = signal('');
  fContent = signal(''); 
  fThumbnailUrl = signal('');
  fSortOrder = signal(0);
  fPublished = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '서비스명' },
      { key: 'titleEn', header: '영문 제목' },
      { key: 'slug', header: 'Slug' },
      { key: 'isPublished', header: '노출여부' },
      { key: 'sortOrder', header: '순서' },
    ], '서비스_소개');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getList().subscribe({
      next: (list) => {
        this.data.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('목록을 불러오는데 실패했습니다.');
        this.loading.set(false);
      },
    });
  }

  openForm(item?: ServiceItem): void {
    if (item) {
      // 수정 모드
      this.editingItem.set(item);
      // 상세 데이터를 불러오기
      this.api.getOne(item.id).subscribe({
        next: (detail) => {
          this.fTitle.set(detail.title);
          this.fTitleEn.set(detail.titleEn ?? '');
          this.fTitleJa.set(detail.titleJa ?? '');
          this.fSlug.set(detail.slug);
          this.fSeoTitle.set(detail.seoTitle ?? '');
          this.fSeoDescription.set(detail.seoDescription ?? '');
          this.fContent.set(detail.content ?? '');
          this.fThumbnailUrl.set(detail.thumbnailUrl ?? '');
          this.fSortOrder.set(detail.sortOrder);
          this.fPublished.set(detail.published);
        },
        error: () => this.toast.error('상세 정보를 불러오는데 실패했습니다.')
      });
    } else {
      // 등록 모드 초기화
      this.editingItem.set(null);
      this.fTitle.set('');
      this.fTitleEn.set('');
      this.fTitleJa.set('');
      this.fSlug.set('');
      this.fSeoTitle.set('');
      this.fSeoDescription.set('');
      this.fContent.set('');
      this.fThumbnailUrl.set('');
      this.fSortOrder.set(0);
      this.fPublished.set(true);
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
  }

  autoSlug(): void {
    if (!this.fSlug()) {
      this.fSlug.set(this.fTitle().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.toast.info('이미지 업로드 기능은 서버 연동이 필요합니다.');
      this.fThumbnailUrl.set('https://via.placeholder.com/150');
    }
  }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('제목을 입력하세요.'); return; }
    if (!this.fSlug().trim()) { this.toast.warning('슬러그를 입력하세요.'); return; }

    const payload: CreateServicePayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      slug: this.fSlug().trim(),
      seoTitle: this.fSeoTitle().trim() || undefined,
      seoDescription: this.fSeoDescription().trim() || undefined,
      content: this.fContent() || undefined,
      thumbnailUrl: this.fThumbnailUrl() || undefined,
      sortOrder: this.fSortOrder(),
      published: this.fPublished(),
    };

    this.saving.set(true);
    const req = this.editingItem() 
      ? this.api.update(this.editingItem()!.id, payload) 
      : this.api.create(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '저장되었습니다.');
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

  onDelete(item: ServiceItem): void {
    this.deleteTarget.set(item);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.remove(target.id).subscribe({
      next: () => {
        this.toast.success('삭제되었습니다.');
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error('삭제에 실패했습니다.');
        this.deleting.set(false);
      },
    });
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }
}
