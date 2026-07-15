import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NoticeApiService,
  NoticeItem,
  CreateNoticePayload,
} from '../../shared/services/notice-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { UploadService } from '../../shared/services/upload.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { RichEditorComponent } from '../../shared/components/rich-editor/rich-editor.component';

@Component({
  selector: 'admin-notice-detail-page',
  imports: [DatePipe, FormsModule, ConfirmDialogComponent, RichEditorComponent],
  templateUrl: './notice-detail.page.html',
})
export class NoticeDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(NoticeApiService);
  private toast = inject(ToastService);
  private upload = inject(UploadService);

  item = signal<NoticeItem | null>(null);
  loading = signal(true);

  /* ── 수정 Drawer ── */
  showForm = signal(false);
  saving = signal(false);

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fContent = signal('');
  fContentEn = signal('');
  fContentJa = signal('');
  fSeoTitle = signal('');
  fMetaDesc = signal('');
  fThumbnailUrl = signal('');
  fThumbnailPreview = signal('');
  fThumbnailFile = signal<File | null>(null);
  fPublished = signal(true);
  fIsPinned = signal(false);

  /* ── 삭제 ── */
  deleteTarget = signal<NoticeItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/homepage/notices']); return; }
    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.loading.set(true);
    this.api.getOne(id).subscribe({
      next: (data) => { this.item.set(data); this.loading.set(false); },
      error: () => { this.toast.error('공지사항을 불러오지 못했습니다.'); this.loading.set(false); this.router.navigate(['/homepage/notices']); },
    });
  }

  goBack(): void { this.router.navigate(['/homepage/notices']); }

  /* ── 수정 Drawer ── */
  openEditForm(): void {
    const d = this.item();
    if (!d) return;
    this.showForm.set(true);
    this.fTitle.set(d.title);
    this.fTitleEn.set(d.titleEn ?? '');
    this.fTitleJa.set(d.titleJa ?? '');
    this.fContent.set(d.content ?? '');
    this.fContentEn.set(d.contentEn ?? '');
    this.fContentJa.set(d.contentJa ?? '');
    this.fSeoTitle.set('');
    this.fMetaDesc.set('');
    this.fThumbnailUrl.set(d.thumbnailUrl ?? '');
    this.fThumbnailPreview.set(d.thumbnailUrl ?? '');
    this.fThumbnailFile.set(null);
    this.fPublished.set(d.published);
    this.fIsPinned.set(d.isPinned);
  }

  closeForm(): void { this.showForm.set(false); }

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
    if (!this.fTitle().trim()) { this.toast.warning('제목을 입력하세요.'); return; }
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
      const d = this.item();
      if (!d) return;
      this.api.update(d.id, payload).subscribe({
        next: () => { this.toast.success('수정되었습니다.'); this.saving.set(false); this.closeForm(); this.loadItem(d.id); },
        error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
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

  /* ── 삭제 ── */
  openDelete(): void { this.deleteTarget.set(this.item()); }
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
