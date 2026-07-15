import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PortfolioApiService,
  PortfolioItem,
  CreatePortfolioPayload,
} from '../../shared/services/portfolio-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { RichEditorComponent } from '../../shared/components/rich-editor/rich-editor.component';

export const SERVICE_TYPES = ['플랫폼', '홈페이지', 'DX(디지털전환)', 'AX(AI전환)', '카탈로그/브랜딩'];

@Component({
  selector: 'admin-portfolio-detail-page',
  imports: [DatePipe, FormsModule, ConfirmDialogComponent, RichEditorComponent],
  templateUrl: './portfolio-detail.page.html',
})
export class PortfolioDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PortfolioApiService);
  private toast = inject(ToastService);

  item = signal<PortfolioItem | null>(null);
  loading = signal(true);

  /* ── 더보기 메뉴 ── */
  menuOpen = signal(false);

  /* ── 수정 Drawer ── */
  showForm = signal(false);
  fLoading = signal(false);
  saving = signal(false);

  readonly serviceTypeOptions = SERVICE_TYPES;

  fTitle = signal('');
  fTitleEn = signal('');
  fTitleJa = signal('');
  fServiceTypes = signal<string[]>([]);
  fStartDate = signal('');
  fEndDate = signal('');
  fSeoTitle = signal('');
  fMetaDesc = signal('');
  fAeoGeo = signal('');
  fServiceDetail = signal('');
  fContent = signal('');
  fThumbnailUrl = signal('');
  fKeywordList = signal<string[]>([]);
  fKeywordInput = signal('');
  fPublished = signal(false);
  fSortOrder = signal(0);

  /* ── 삭제 ── */
  deleteTarget = signal<PortfolioItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/homepage/portfolio']); return; }
    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.loading.set(true);
    this.api.getOne(id).subscribe({
      next: (data) => { this.item.set(data); this.loading.set(false); },
      error: () => { this.toast.error('포트폴리오를 불러오지 못했습니다.'); this.loading.set(false); this.router.navigate(['/homepage/portfolio']); },
    });
  }

  get categories(): string[] {
    const cat = this.item()?.category;
    return cat ? cat.split(',').map(s => s.trim()).filter(Boolean) : [];
  }

  get keywordList(): string[] {
    const kw = this.item()?.keywords;
    return kw ? kw.split(',').map(s => s.trim()).filter(Boolean) : [];
  }

  goBack(): void { this.router.navigate(['/homepage/portfolio']); }

  /* ── 더보기 메뉴 ── */
  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  /* ── 수정 Drawer ── */
  openEditForm(): void {
    this.menuOpen.set(false);
    const d = this.item();
    if (!d) return;
    this.fLoading.set(true);
    this.showForm.set(true);

    this.fTitle.set(d.title);
    this.fTitleEn.set(d.titleEn ?? '');
    this.fTitleJa.set(d.titleJa ?? '');
    this.fServiceTypes.set(d.category ? d.category.split(',').map(s => s.trim()).filter(Boolean) : []);
    const parts = (d.period ?? '').split('~').map(s => s.trim());
    this.fStartDate.set(parts[0] ?? '');
    this.fEndDate.set(parts[1] ?? '');
    this.fSeoTitle.set(d.client ?? '');
    this.fMetaDesc.set('');
    this.fAeoGeo.set(d.description ?? '');
    this.fServiceDetail.set(d.descriptionEn ?? '');
    this.fContent.set(d.descriptionJa ?? '');
    this.fThumbnailUrl.set(d.thumbnailUrl ?? '');
    const kwds = d.keywords ? d.keywords.split(',').map(s => s.trim()).filter(Boolean) : [];
    this.fKeywordList.set(kwds);
    this.fPublished.set(d.published);
    this.fSortOrder.set(d.sortOrder);
    this.fLoading.set(false);
  }

  closeForm(): void { this.showForm.set(false); }

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

  addKeyword(): void {
    const kw = this.fKeywordInput().trim();
    if (!kw) return;
    if (!this.fKeywordList().includes(kw)) {
      this.fKeywordList.update(list => [...list, kw]);
    }
    this.fKeywordInput.set('');
  }

  onKeywordKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addKeyword(); }
  }

  removeKeyword(kw: string): void {
    this.fKeywordList.update(list => list.filter(k => k !== kw));
  }

  onThumbnailChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.fThumbnailUrl.set(url);
      this.toast.info('이미지가 선택되었습니다. (서버 업로드 연동 필요)');
    }
  }

  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('포트폴리오 명을 입력하세요.'); return; }
    if (!this.fServiceTypes().length) { this.toast.warning('서비스 유형을 하나 이상 선택하세요.'); return; }

    const period = [this.fStartDate(), this.fEndDate()].filter(Boolean).join(' ~ ') || undefined;
    const payload: CreatePortfolioPayload = {
      title: this.fTitle().trim(),
      titleEn: this.fTitleEn().trim() || undefined,
      titleJa: this.fTitleJa().trim() || undefined,
      client: this.fSeoTitle().trim() || undefined,
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

    const d = this.item();
    if (!d) return;
    this.saving.set(true);
    this.api.update(d.id, payload).subscribe({
      next: () => {
        this.toast.success('수정되었습니다.');
        this.saving.set(false);
        this.closeForm();
        this.loadItem(d.id);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  /* ── 삭제 ── */
  openDelete(): void {
    this.menuOpen.set(false);
    this.deleteTarget.set(this.item());
  }

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
