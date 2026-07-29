import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientApiService, EventItem } from '../../shared/services/client-api.service';
import { I18nService } from '../../shared/services/i18n.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [DatePipe, TranslatePipe],
  templateUrl: './event-detail.page.html',
})
export class EventDetailPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);

  event = signal<EventItem | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.api.getEventDetail(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStatus(): 'upcoming' | 'ongoing' | 'ended' {
    const e = this.event();
    if (!e) return 'ended';
    const today = new Date().toISOString().slice(0, 10);
    if (e.startDate && e.startDate.slice(0, 10) > today) return 'upcoming';
    if (e.endDate && e.endDate.slice(0, 10) < today) return 'ended';
    return 'ongoing';
  }

  getStatusLabel(): string {
    const s = this.getStatus();
    if (s === 'upcoming') return 'events.status_upcoming';
    if (s === 'ended') return 'events.status_ended';
    return 'events.status_ongoing';
  }

  goBack(): void {
    this.location.back();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loc(item: any, field: string): string {
    if (!item) return '';
    const lang = this.i18n.currentLang();
    if (lang === 'en') return String(item[field + 'En'] || item[field] || '');
    if (lang === 'ja') return String(item[field + 'Ja'] || item[field] || '');
    return String(item[field] || '');
  }

  /** 첨부파일을 원본 파일명으로 다운로드 */
  downloadAttachment(): void {
    const ev = this.event();
    if (!ev?.attachmentUrl) return;

    const fileName = ev.attachmentName || '첨부파일';

    fetch(ev.attachmentUrl)
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      });
  }
}