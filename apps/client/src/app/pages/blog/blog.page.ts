import { Component, OnInit, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { ClientApiService, NaverBlogPost } from '../../shared/services/client-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [DatePipe, TranslatePipe],
  templateUrl: './blog.page.html',
  styleUrl: './blog.page.css',
})
export class BlogPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);

  allPosts = signal<NaverBlogPost[]>([]);
  currentPage = signal(1);
  readonly pageSize = 12; // 4컬럼 × 3행

  totalPages = computed(() => Math.ceil(this.allPosts().length / this.pageSize) || 1);

  blogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allPosts().slice(start, start + this.pageSize);
  });

  pages = computed(() => {
    const tp = this.totalPages();
    const cp = this.currentPage();
    const arr: number[] = [];
    const start = Math.max(1, cp - 2);
    const end = Math.min(tp, cp + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getNaverBlogs().subscribe({
      next: (list) => this.allPosts.set(list),
      error: () => this.allPosts.set([]),
    });
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
