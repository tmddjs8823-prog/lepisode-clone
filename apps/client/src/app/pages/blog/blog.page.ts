import { Component, OnInit, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { ClientApiService, BlogItem } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './blog.page.html',
  styleUrl: './blog.page.css',
})
export class BlogPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);

  blogs = signal<BlogItem[]>([]);
  total = signal(0);
  currentPage = signal(1);
  readonly pageSize = 12; // 4열 x 3행

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize) || 1);

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
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.currentPage.set(page);
    this.api.getBlogsPaged(page, this.pageSize).subscribe({
      next: (res) => {
        this.blogs.set(Array.isArray(res.data) ? res.data : []);
        this.total.set(res.total ?? 0);
      },
      error: () => {
        this.blogs.set([]);
        this.total.set(0);
      },
    });
    // 스크롤 상단 이동
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
