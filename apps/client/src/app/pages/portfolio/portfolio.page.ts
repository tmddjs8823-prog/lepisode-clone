import { Component, OnInit, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientApiService, PortfolioItem } from '../../shared/services/client-api.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { I18nService } from '../../shared/services/i18n.service';



@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './portfolio.page.html',
})
export class PortfolioPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);
  private translate = inject(TranslateService);

  allItems = signal<PortfolioItem[]>([]);
  activeCategory = signal('all');
  currentPage = signal(1);
  readonly pageSize = 12;

  readonly categoryKeys = ['all', 'platform', 'homepage', 'DX', 'AX', 'catalog'];

  /** DB category 값 매핑 (한국어 원본) */
  private readonly categoryDbMap: Record<string, string> = {
    all: '전체',
    platform: '플랫폼',
    homepage: '홈페이지',
    DX: 'DX',
    AX: 'AX',
    catalog: '카탈로그/브랜딩',
  };

  getCategoryLabel(key: string): string {
    return this.translate.instant('portfolio.cat.' + key);
  }

  filteredItems = computed(() => {
    const cat = this.activeCategory();
    const all = this.allItems();
    if (cat === 'all') return all;
    const dbCat = this.categoryDbMap[cat] || cat;
    return all.filter(item => item.category === dbCat);
  });

  pagedItems = computed(() => {
    const items = this.filteredItems();
    const start = (this.currentPage() - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredItems().length / this.pageSize) || 1);

  pages = computed(() => {
    const tp = this.totalPages();
    const cp = this.currentPage();
    const arr: number[] = [];
    const start = Math.max(1, cp - 2);
    const end = Math.min(tp, cp + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  });

  /* 통계 */
  completedCount = computed(() => this.allItems().length);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getPortfoliosPaged(1, 200).subscribe({
      next: (res) => this.allItems.set(Array.isArray(res.data) ? res.data : []),
      error: () => this.allItems.set([]),
    });
  }

  selectCategory(key: string): void {
    this.activeCategory.set(key);
    this.currentPage.set(1);
  }

  loadPage(page: number): void {
    this.currentPage.set(page);
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.loadPage(this.currentPage() - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.loadPage(this.currentPage() + 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loc(item: any, field: string): string {
    if (!item) return '';
    const lang = this.i18n.currentLang();
    if (lang === 'en') return String(item[field + 'En'] || item[field] || '');
    if (lang === 'ja') return String(item[field + 'Ja'] || item[field] || '');
    return String(item[field] || '');
  }
}
