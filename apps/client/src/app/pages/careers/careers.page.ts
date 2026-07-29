import { Component, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ClientApiService, BlogItem, JobItem } from '../../shared/services/client-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '../../shared/services/i18n.service';

import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
  selector: 'app-careers-page',
  standalone: true,
  imports: [DatePipe, TranslatePipe, RichTextPipe],
  templateUrl: './careers.page.html',
  styleUrl: './careers.page.css',
})
export class CareersPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private router = inject(Router);
  private i18n = inject(I18nService);

  blogPosts = signal<BlogItem[]>([]);
  jobPosts = signal<JobItem[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getBlogs(4).subscribe({
      next: (list) => this.blogPosts.set(list),
      error: () => this.blogPosts.set([]),
    });
    this.api.getJobs().subscribe({
      next: (list) => this.jobPosts.set(Array.isArray(list) ? list : []),
      error: () => this.jobPosts.set([]),
    });
  }

  /** 동적 데이터의 다국어 필드 선택 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loc(item: any, field: string): string {
    if (!item) return '';
    const lang = this.i18n.currentLang();
    if (lang === 'en') return String(item[field + 'En'] || item[field] || '');
    if (lang === 'ja') return String(item[field + 'Ja'] || item[field] || '');
    return String(item[field] || '');
  }

  scrollTo(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToDevBlog(): void {
    window.open('https://techblog.lepisode.kr/', '_blank');
  }

  getJobStatus(job: JobItem): string {
    if (!job.deadline) return '모집중';
    return new Date(job.deadline) < new Date() ? '마감' : '모집중';
  }

  openJobUrl(job: JobItem): void {
    if (job.jobUrl) {
      window.open(job.jobUrl, '_blank');
    }
  }
}
