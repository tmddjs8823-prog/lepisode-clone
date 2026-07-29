import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SupportApiService,
  ProjectStatusItem,
  ProjectStatusType,
} from '../../shared/services/support-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { UploadService, DOCUMENT_ACCEPT } from '../../shared/services/upload.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const STATUS_META: Record<ProjectStatusType, { label: string; class: string }> = {
  ESTIMATING:  { label: '견적 중',   class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  IN_PROGRESS: { label: '진행 중',   class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  COMPLETE:    { label: '납품완료',  class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
};

@Component({
  selector: 'admin-project-status-detail-page',
  imports: [DatePipe, NgClass, FormsModule, ConfirmDialogComponent],
  templateUrl: './project-status-detail.page.html',
})
export class ProjectStatusDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(SupportApiService);
  private toast = inject(ToastService);
  private upload = inject(UploadService);

  readonly docAccept = DOCUMENT_ACCEPT;

  item = signal<ProjectStatusItem | null>(null);
  loading = signal(true);

  /* 메모 인라인 편집 */
  editingMemo = signal(false);
  memoValue = signal('');

  /* 삭제 */
  deleteTarget = signal<ProjectStatusItem | null>(null);
  deleting = signal(false);

  /* 수정 서랍 */
  showForm = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/support/statuses']); return; }
    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.loading.set(true);
    this.api.getStatus(id).subscribe({
      next: (data) => { this.item.set(data); this.loading.set(false); },
      error: () => { this.toast.error('현황 정보를 불러오지 못했습니다.'); this.loading.set(false); this.router.navigate(['/support/statuses']); },
    });
  }

  goBack(): void { this.router.navigate(['/support/statuses']); }

  getStatusMeta(s: ProjectStatusType) { return STATUS_META[s]; }

  /* 메모 인라인 편집 */
  startEditMemo(): void {
    this.memoValue.set(this.item()?.memo ?? '');
    this.editingMemo.set(true);
  }

  saveMemo(): void {
    const current = this.item();
    if (!current) return;
    this.api.updateStatus(current.id, { memo: this.memoValue() }).subscribe({
      next: (updated) => {
        this.item.set(updated);
        this.editingMemo.set(false);
        this.toast.success('메모가 저장되었습니다.');
      },
      error: () => this.toast.error('메모 저장에 실패했습니다.'),
    });
  }

  cancelEditMemo(): void { this.editingMemo.set(false); }

  /* 삭제 */
  onDelete(): void { this.deleteTarget.set(this.item()); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.api.removeStatus(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleting.set(false); this.goBack(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }

  /* ── 수정 폼 ── */
  saving = signal(false);

  readonly statusMeta = STATUS_META;
  readonly statusOptions: ProjectStatusType[] = ['ESTIMATING', 'IN_PROGRESS', 'COMPLETE'];
  readonly platformOptions = ['Android', 'iOS', 'Web'];

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fClient = signal('');
  fPlatforms = signal<string[]>([]);
  fStartDate = signal('');
  fEndDate = signal('');
  fStatus = signal<ProjectStatusType>('ESTIMATING');
  fEmail = signal('');
  fPhone = signal('');
  fAttachmentUrl = signal('');
  fAttachName = signal('');
  fMemo = signal('');
  fContent = signal('');

  openEditForm(): void {
    const data = this.item();
    if (!data) return;
    this.fTitle.set(data.title);
    this.fTitleEn.set(data.titleEn ?? '');
    this.fTitleJa.set(data.titleJa ?? '');
    this.fClient.set(data.client ?? '');
    this.fPlatforms.set(data.platforms ?? []);
    this.fStartDate.set(data.startDate ? data.startDate.slice(0, 10) : '');
    this.fEndDate.set(data.endDate ? data.endDate.slice(0, 10) : '');
    this.fStatus.set(data.status ?? 'ESTIMATING');
    this.fEmail.set(data.email ?? '');
    this.fPhone.set(data.phone ?? '');
    this.fAttachmentUrl.set(data.attachmentUrl ?? '');
    this.fAttachName.set('');
    this.fMemo.set(data.memo ?? '');
    this.fContent.set(data.content ?? '');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  togglePlatform(p: string): void {
    const current = this.fPlatforms();
    if (current.includes(p)) {
      this.fPlatforms.set(current.filter(x => x !== p));
    } else {
      this.fPlatforms.set([...current, p]);
    }
  }

  saveForm(): void {
    const current = this.item();
    if (!current) return;
    if (!this.fTitle().trim()) { this.toast.warning('제목을 입력하세요.'); return; }

    this.saving.set(true);
    this.api.updateStatus(current.id, {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      client: this.fClient().trim() || undefined,
      platforms: this.fPlatforms(),
      startDate: this.fStartDate() || undefined,
      endDate: this.fEndDate() || undefined,
      status: this.fStatus(),
      email: this.fEmail().trim() || undefined,
      phone: this.fPhone().trim() || undefined,
      attachmentUrl: this.fAttachmentUrl() || undefined,
      memo: this.fMemo() || undefined,
      content: this.fContent() || undefined,
    }).subscribe({
      next: (updated) => {
        this.item.set(updated);
        this.toast.success('수정되었습니다.');
        this.closeForm();
        this.saving.set(false);
      },
      error: () => { this.toast.error('수정에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fAttachName.set(file.name);
    this.upload.upload(file, 'status-docs').subscribe({
      next: (res) => { this.fAttachmentUrl.set(res.url); this.toast.success('파일이 업로드되었습니다.'); },
      error: () => this.toast.error('파일 업로드에 실패했습니다.'),
    });
  }

  removeDoc(): void { this.fAttachmentUrl.set(''); this.fAttachName.set(''); }
}
