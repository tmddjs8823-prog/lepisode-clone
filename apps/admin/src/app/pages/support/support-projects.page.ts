import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SupportApiService,
  SupportProjectItem,
  CreateSupportProjectPayload,
} from '../../shared/services/support-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { UploadService } from '../../shared/services/upload.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';

/* ── 선택 포인트 일러스트 옵션 ── */
export interface IllustOption {
  key: string;
  label: string;
}

export const ILLUST_OPTIONS: IllustOption[] = [
  { key: 'manufacturing-ai', label: '제조 AI' },
  { key: 'funding',          label: '지원금' },
  { key: 'report',           label: '분석 리포트' },
  { key: 'puzzle',           label: '퍼즐 블록' },
  { key: 'ad-expansion',     label: '광고 확산' },
  { key: 'education',        label: '교육 기관' },
  { key: 'achievement',      label: '성과 인증' },
  { key: 'solution',         label: '솔루션 설계' },
  { key: 'global-robot',     label: '글로벌 로봇' },
  { key: 'cluster',          label: '클러스터' },
];

/* ── 단계별 안내 아이템 ── */
export interface StepItem {
  iconKey: string;
  title: string;
  target: string;
  amount: string;
  rate: string;
}

/* ── 단계별 안내 3D 아이콘 옵션 ── */
export const STEP_ICON_OPTIONS: IllustOption[] = [
  { key: 'sprout-dome',    label: '새싹 돔' },
  { key: 'rocket-growth',  label: '로켓 성장' },
  { key: 'city-growth',    label: '도시 성장' },
  { key: 'block-setting',  label: '블록 설정' },
  { key: 'ai-chip',        label: 'AI 칩' },
  { key: 'sprout-pot',     label: '새싹 화분' },
  { key: 'upgrade',        label: '업그레이드' },
  { key: 'new-badge',      label: 'NEW 배지' },
  { key: 'gold-star',      label: '골드 스타' },
  { key: 'growth-chart',   label: '성장 차트' },
  { key: 'crown-tower',    label: '크라운 타워' },
  { key: 'map-pin',        label: '지도 핀' },
  { key: 'analysis',       label: '분석 돋보기' },
  { key: 'ai-assistant',   label: 'AI 어시스턴트' },
  { key: 'global',         label: '글로벌' },
];

/* ── 선택 포인트 아이템 ── */
export interface PointItem {
  illustKey: string;
  title: string;
  description: string;
}

/* ── 포트폴리오/서비스 매핑 아이템 ── */
export interface MappingItem {
  type: 'portfolio' | 'service';
  selectedId: number | null;
}

/* ── 로드맵 아이템 ── */
export interface RoadmapItem {
  title: string;
  description: string;
}

/* ── FAQ 아이템 ── */
export interface FaqItem {
  question: string;
  answer: string;
  pinned: boolean;
}

@Component({
  selector: 'admin-support-projects-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './support-projects.page.html',
})
export class SupportProjectsPage implements OnInit {
  private api = inject(SupportApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private upload = inject(UploadService);

  data = signal<SupportProjectItem[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'title',     label: '지원사업명', align: 'left' },
    { key: 'slug',      label: '슬러그',    align: 'left' },
    {
      key: 'published', label: '노출여부', align: 'center', width: '6rem', type: 'badge',
      badgeMap: {
        true:  { label: '노출', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '숨김', class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    { key: 'updatedAt', label: '수정일', align: 'center', width: '7.5rem', type: 'date' },
  ];

  /* ── 폼 상태 ── */
  showForm = signal(false);
  editingItem = signal<SupportProjectItem | null>(null);
  saving = signal(false);
  deleteTarget = signal<SupportProjectItem | null>(null);
  deleting = signal(false);

  formTitle = computed(() => (this.editingItem() ? '지원사업 수정' : '지원사업 등록'));

  /* ── 섹션 1: 기본 정보 ── */
  fTitle = signal('');
  fSlug = signal('');
  fBadge = signal('');
  fPublished = signal(true);
  fDescription = signal('');
  fMaxGrant = signal('');

  // 테마 체크박스
  fThemeStartup = signal(false);
  fThemeSmallBiz = signal(false);
  fThemeSME = signal(false);
  fThemeMidCap = signal(false);
  fThemeGlobal = signal(false);

  /* ── 섹션 2: 이미지 & SEO ── */
  fBannerFile = signal<File | null>(null);
  fBannerPreview = signal('');
  fHeroColor = signal('#DCE7FF');
  fOgFile = signal<File | null>(null);
  fOgPreview = signal('');
  fSeoTitle = signal('');
  fSeoDesc = signal('');
  fSeoKeywords = signal('');

  /* ── 섹션 3: 단계별 안내 & 선택 포인트 ── */
  fSteps = signal<StepItem[]>([]);
  fPoints = signal<PointItem[]>([]);

  /* ── 섹션 4: 포트폴리오 매핑, 로드맵, FAQ ── */
  fMappings = signal<MappingItem[]>([]);
  fRoadmaps = signal<RoadmapItem[]>([]);
  fFaqs = signal<FaqItem[]>([]);
  pinnedCount = computed(() => this.fFaqs().filter(f => f.pinned).length);

  readonly illustOptions = ILLUST_OPTIONS;
  readonly stepIconOptions = STEP_ICON_OPTIONS;

  getStepIconLabel(key: string): string {
    return STEP_ICON_OPTIONS.find(o => o.key === key)?.label ?? key;
  }
  getIllustLabel(key: string): string {
    return ILLUST_OPTIONS.find(o => o.key === key)?.label ?? key;
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

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '지원사업명' },
      { key: 'slug', header: '슬러그' },
      { key: 'published', header: '노출여부' },
      { key: 'updatedAt', header: '수정일' },
    ], '지원사업');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getProjects().subscribe({
      next: (list) => { this.data.set(list); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  /* 임시 저장 여부 */
  private hasDraft(): boolean {
    return !!(this.fTitle() || this.fSlug() || this.fDescription() || this.fBadge()
      || this.fMaxGrant() || this.fBannerPreview() || this.fOgPreview() || this.fSeoTitle()
      || this.fSteps().length || this.fPoints().length
      || this.fMappings().length || this.fRoadmaps().length || this.fFaqs().length);
  }

  private resetFormFields(item?: SupportProjectItem): void {
    this.fTitle.set(item?.title ?? '');
    this.fSlug.set(item?.slug ?? '');
    this.fBadge.set('');
    this.fPublished.set(item?.published ?? true);
    this.fDescription.set('');
    this.fMaxGrant.set('');
    this.fThemeStartup.set(false);
    this.fThemeSmallBiz.set(false);
    this.fThemeSME.set(false);
    this.fThemeMidCap.set(false);
    this.fThemeGlobal.set(false);
    this.fBannerFile.set(null);
    this.fBannerPreview.set(item?.bannerUrl ?? '');
    this.fHeroColor.set('#DCE7FF');
    this.fOgFile.set(null);
    this.fOgPreview.set(item?.ogImageUrl ?? '');
    this.fSeoTitle.set('');
    this.fSeoDesc.set('');
    this.fSeoKeywords.set('');
    this.fSteps.set([]);
    this.fPoints.set([]);
    this.fMappings.set([]);
    this.fRoadmaps.set([]);
    this.fFaqs.set([]);
  }

  openForm(item?: SupportProjectItem): void {
    if (item) {
      // 수정 모드 — 해당 아이템 데이터로 세팅
      this.editingItem.set(item);
      this.resetFormFields(item);
    } else if (!this.hasDraft()) {
      // 새 등록 — 임시 데이터 없으면 초기화
      this.editingItem.set(null);
      this.resetFormFields();
    }
    // else: 임시 데이터가 있으면 그대로 유지하며 폼 재오픈
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  autoSlug(): void {
    if (!this.fSlug()) {
      this.fSlug.set(
        this.fTitle()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      );
    }
  }

  /* ── 이미지 핸들러 ── */
  onBannerSelect(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fBannerFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.fBannerPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }
  onBannerDrop(ev: DragEvent): void {
    ev.preventDefault();
    const file = ev.dataTransfer?.files[0];
    if (!file?.type.startsWith('image/')) return;
    this.fBannerFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.fBannerPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }
  removeBanner(): void { this.fBannerFile.set(null); this.fBannerPreview.set(''); }

  onOgSelect(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fOgFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.fOgPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }
  onOgDrop(ev: DragEvent): void {
    ev.preventDefault();
    const file = ev.dataTransfer?.files[0];
    if (!file?.type.startsWith('image/')) return;
    this.fOgFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.fOgPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }
  removeOg(): void { this.fOgFile.set(null); this.fOgPreview.set(''); }

  onDragOver(ev: DragEvent): void { ev.preventDefault(); }

  resetHeroColor(): void { this.fHeroColor.set('#DCE7FF'); }

  /* ── 단계별 안내 ── */
  addStep(): void {
    this.fSteps.update(s => [...s, { iconKey: '', title: '', target: '', amount: '', rate: '' }]);
  }
  removeStep(i: number): void {
    this.fSteps.update(s => s.filter((_, idx) => idx !== i));
  }
  selectStepIcon(stepIndex: number, key: string): void {
    this.fSteps.update(s => s.map((item, idx) => idx === stepIndex ? { ...item, iconKey: key } : item));
  }
  updateStepField(i: number, field: keyof StepItem, val: string): void {
    this.fSteps.update(s => s.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }
  addPoint(): void {
    this.fPoints.update(p => [...p, { illustKey: '', title: '', description: '' }]);
  }
  removePoint(i: number): void {
    this.fPoints.update(p => p.filter((_, idx) => idx !== i));
  }
  selectIllust(pointIndex: number, key: string): void {
    this.fPoints.update(p => p.map((item, idx) => idx === pointIndex ? { ...item, illustKey: key } : item));
  }
  updatePointTitle(i: number, val: string): void {
    this.fPoints.update(p => p.map((item, idx) => idx === i ? { ...item, title: val } : item));
  }
  updatePointDesc(i: number, val: string): void {
    this.fPoints.update(p => p.map((item, idx) => idx === i ? { ...item, description: val } : item));
  }

  /* ── 선택 포인트 ── */

  /* ── 포트폴리오/서비스 매핑 ── */
  addMapping(): void {
    this.fMappings.update(m => [...m, { type: 'portfolio', selectedId: null }]);
  }
  removeMapping(i: number): void {
    this.fMappings.update(m => m.filter((_, idx) => idx !== i));
  }
  updateMappingType(i: number, val: 'portfolio' | 'service'): void {
    this.fMappings.update(m => m.map((item, idx) => idx === i ? { ...item, type: val, selectedId: null } : item));
  }
  updateMappingId(i: number, val: number): void {
    this.fMappings.update(m => m.map((item, idx) => idx === i ? { ...item, selectedId: val } : item));
  }

  /* ── 사업 로드맵 ── */
  addRoadmap(): void {
    this.fRoadmaps.update(r => [...r, { title: '', description: '' }]);
  }
  removeRoadmap(i: number): void {
    this.fRoadmaps.update(r => r.filter((_, idx) => idx !== i));
  }
  updateRoadmapTitle(i: number, val: string): void {
    this.fRoadmaps.update(r => r.map((item, idx) => idx === i ? { ...item, title: val } : item));
  }
  updateRoadmapDesc(i: number, val: string): void {
    this.fRoadmaps.update(r => r.map((item, idx) => idx === i ? { ...item, description: val } : item));
  }

  /* ── FAQ ── */
  addFaq(): void {
    this.fFaqs.update(f => [...f, { question: '', answer: '', pinned: false }]);
  }
  removeFaq(i: number): void {
    this.fFaqs.update(f => f.filter((_, idx) => idx !== i));
  }
  toggleFaqPin(i: number): void {
    const current = this.fFaqs();
    const item = current[i];
    if (!item.pinned && this.pinnedCount() >= 5) {
      this.toast.warning('우선 노출 고정은 최대 5개까지 가능합니다.');
      return;
    }
    this.fFaqs.update(f => f.map((it, idx) => idx === i ? { ...it, pinned: !it.pinned } : it));
  }
  updateFaqQuestion(i: number, val: string): void {
    this.fFaqs.update(f => f.map((item, idx) => idx === i ? { ...item, question: val } : item));
  }
  updateFaqAnswer(i: number, val: string): void {
    this.fFaqs.update(f => f.map((item, idx) => idx === i ? { ...item, answer: val } : item));
  }

  /* ── 저장 ── */
  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('지원사업명을 입력하세요.'); return; }
    if (!this.fSlug().trim()) { this.toast.warning('슬러그를 입력하세요.'); return; }
    if (!this.fDescription().trim()) { this.toast.warning('설명을 입력하세요.'); return; }

    this.saving.set(true);

    // 이미지 업로드 처리
    const uploads: Promise<string | null>[] = [];

    // 배너 이미지
    if (this.fBannerFile()) {
      uploads.push(
        new Promise((resolve, reject) => {
          this.upload.upload(this.fBannerFile()!, 'support-banners').subscribe({
            next: (res) => resolve(res.url),
            error: () => reject('배너'),
          });
        })
      );
    } else {
      uploads.push(Promise.resolve(this.fBannerPreview() || null));
    }

    // OG 이미지
    if (this.fOgFile()) {
      uploads.push(
        new Promise((resolve, reject) => {
          this.upload.upload(this.fOgFile()!, 'support-og').subscribe({
            next: (res) => resolve(res.url),
            error: () => reject('OG'),
          });
        })
      );
    } else {
      uploads.push(Promise.resolve(this.fOgPreview() || null));
    }

    Promise.all(uploads).then(([bannerUrl, ogImageUrl]) => {
      const payload: CreateSupportProjectPayload = {
        title: this.fTitle().trim(),
        slug: this.fSlug().trim(),
        bannerUrl: bannerUrl || undefined,
        ogImageUrl: ogImageUrl || undefined,
        published: this.fPublished(),
      };

      const req = this.editingItem()
        ? this.api.updateProject(this.editingItem()!.id, payload)
        : this.api.createProject(payload);
      req.subscribe({
        next: () => { this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.'); this.closeForm(); this.loadData(); this.saving.set(false); },
        error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
      });
    }).catch((label) => {
      this.toast.error(`${label} 이미지 업로드에 실패했습니다.`);
      this.saving.set(false);
    });
  }

  /* ── 삭제 ── */
  onDelete(item: SupportProjectItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.api.removeProject(t.id).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
