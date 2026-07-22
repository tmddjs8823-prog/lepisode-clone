import { Component, OnInit, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientApiService, PortfolioItem } from '../../shared/services/client-api.service';

interface CategoryTab {
  key: string;
  label: string;
}

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './portfolio.page.html',
  styleUrl: './portfolio.page.css',
})
export class PortfolioPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);

  allItems = signal<PortfolioItem[]>([]);
  activeCategory = signal('전체');
  currentPage = signal(1);
  readonly pageSize = 12;

  readonly categories: CategoryTab[] = [
    { key: '전체', label: '전체' },
    { key: '플랫폼', label: '플랫폼' },
    { key: '홈페이지', label: '홈페이지' },
    { key: 'DX', label: 'DX' },
    { key: 'AX', label: 'AX' },
    { key: '카탈로그/브랜딩', label: '카탈로그/브랜딩' },
  ];

  filteredItems = computed(() => {
    const cat = this.activeCategory();
    const all = this.allItems();
    if (cat === '전체') return all;
    return all.filter(item => item.category === cat);
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
}
