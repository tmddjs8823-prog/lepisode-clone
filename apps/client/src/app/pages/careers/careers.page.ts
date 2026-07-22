import { Component, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ClientApiService, BlogItem, JobItem } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-careers-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './careers.page.html',
  styleUrl: './careers.page.css',
})
export class CareersPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private router = inject(Router);

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
