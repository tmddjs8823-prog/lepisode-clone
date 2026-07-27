import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientApiService, NoticeItem } from '../../shared/services/client-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-notice-page',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './notice.page.html',
})
export class NoticePage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);

  notices = signal<NoticeItem[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.api.getNoticesPaged(page, 5).subscribe({
      next: (res) => {
        this.notices.set(Array.isArray(res.data) ? res.data : []);
        this.currentPage.set(page);
        this.totalPages.set(res.totalPages || 1);
      },
      error: () => this.notices.set([]),
    });
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) pages.push(i);
    return pages;
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
