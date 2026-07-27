import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientApiService, EventItem } from '../../shared/services/client-api.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [DatePipe],
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
    const now = new Date();
    if (e.startDate && new Date(e.startDate) > now) return 'upcoming';
    if (e.endDate && new Date(e.endDate) < now) return 'ended';
    return 'ongoing';
  }

  getStatusLabel(): string {
    const s = this.getStatus();
    if (s === 'upcoming') return '예정';
    if (s === 'ended') return '종료';
    return '진행중';
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
}