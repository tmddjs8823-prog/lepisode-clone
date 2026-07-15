import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ServiceApiService,
  ServiceItem,
  CreateServicePayload,
} from '../../shared/services/service-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { UploadService } from '../../shared/services/upload.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'admin-service-detail-page',
  imports: [DatePipe, FormsModule, ConfirmDialogComponent],
  templateUrl: './service-detail.page.html',
})
export class ServiceDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ServiceApiService);
  private toast = inject(ToastService);
  private upload = inject(UploadService);

  item = signal<ServiceItem | null>(null);
  loading = signal(true);

  /* ── 더보기 메뉴 ── */
  menuOpen = signal(false);

  /* ── 수정 Drawer ── */
  showForm = signal(false);
  saving = signal(false);

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fSlug = signal('');
  fSeoTitle = signal('');
  fSeoDescription = signal('');
  fContent = signal('');
  fThumbnailUrl = signal('');
  fThumbnailPreview = signal('');
  fThumbnailFile = signal<File | null>(null);
  fSortOrder = signal(0);
  fPublished = signal(true);

  /* ── 삭제 ── */
  deleteTarget = signal<ServiceItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/homepage/services']); return; }
    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.loading.set(true);
    this.api.getOne(id).subscribe({
      next: (data) => { this.item.set(data); this.loading.set(false); },
      error: () => { this.toast.error('서비스를 불러오지 못했습니다.'); this.loading.set(false); this.router.navigate(['/homepage/services']); },
    });
  }

  goBack(): void { this.router.navigate(['/homepage/services']); }

  /* ── 더보기 메뉴 ── */
  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  /* ── 수정 Drawer ── */
  openEditForm(): void {
    this.menuOpen.set(false);
    const d = this.item();
    if (!d) return;
    this.showForm.set(true);
    this.fTitle.set(d.title);
    this.fTitleEn.set(d.titleEn ?? '');
    this.fTitleJa.set(d.titleJa ?? '');
    this.fSlug.set(d.slug);
    this.fSeoTitle.set(d.seoTitle ?? '');
    this.fSeoDescription.set(d.seoDescription ?? '');
    this.fContent.set(d.content ?? '');
    this.fThumbnailUrl.set(d.thumbnailUrl ?? '');
    this.fThumbnailPreview.set('');
    this.fThumbnailFile.set(null);
    this.fSortOrder.set(d.sortOrder);
    this.fPublished.set(d.published);
  }

  closeForm(): void { this.showForm.set(false); }

  autoSlug(): void {
    if (!this.fSlug()) {
      this.fSlug.set(this.fTitle().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }

  onFileChange(event: Event): void {
    const file = this.upload.extractFile(event);
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { this.toast.warning('파일 크기는 10MB 이하만 가능합니다.'); return; }
    this.fThumbnailFile.set(file);
    this.upload.toPreviewUrl(file).subscribe({
      next: (url) => this.fThumbnailPreview.set(url),
      error: () => this.toast.error('이미지 미리보기에 실패했습니다.'),
    });
  }

  removeThumbnail(): void {
    this.fThumbnailUrl.set('');
    this.fThumbnailPreview.set('');
    this.fThumbnailFile.set(null);
  }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('제목을 입력하세요.'); return; }
    if (!this.fSlug().trim()) { this.toast.warning('슬러그를 입력하세요.'); return; }
    this.saving.set(true);

    const doSave = (uploadedUrl?: string) => {
      const payload: CreateServicePayload = {
        title: this.fTitle().trim(),
        titleEn: this.fTitleEn().trim() || undefined,
        titleJa: this.fTitleJa().trim() || undefined,
        slug: this.fSlug().trim(),
        seoTitle: this.fSeoTitle().trim() || undefined,
        seoDescription: this.fSeoDescription().trim() || undefined,
        content: this.fContent() || undefined,
        thumbnailUrl: uploadedUrl || this.fThumbnailUrl() || undefined,
        sortOrder: this.fSortOrder(),
        published: this.fPublished(),
      };
      const d = this.item();
      if (!d) return;
      this.api.update(d.id, payload).subscribe({
        next: () => { this.toast.success('수정되었습니다.'); this.saving.set(false); this.closeForm(); this.loadItem(d.id); },
        error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
      });
    };

    const thumbFile = this.fThumbnailFile();
    if (thumbFile) {
      this.upload.upload(thumbFile, 'services').subscribe({
        next: (res) => doSave(res.url),
        error: () => { this.toast.error('이미지 업로드에 실패했습니다.'); this.saving.set(false); },
      });
    } else {
      doSave();
    }
  }

  /* ── 삭제 ── */
  openDelete(): void { this.menuOpen.set(false); this.deleteTarget.set(this.item()); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.api.remove(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleting.set(false); this.goBack(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
