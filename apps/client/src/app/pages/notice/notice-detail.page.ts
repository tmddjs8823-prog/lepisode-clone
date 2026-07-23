import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientApiService, NoticeItem } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-notice-detail-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notice-detail.page.html',
})
export class NoticeDetailPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private api = inject(ClientApiService);
  private location = inject(Location);

  notice = signal<NoticeItem | null>(null);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.api.getNoticeDetail(id).subscribe({
      next: (item) => this.notice.set(item),
      error: () => this.notice.set(null),
    });
  }

  goBack(): void {
    this.location.back();
  }
}
