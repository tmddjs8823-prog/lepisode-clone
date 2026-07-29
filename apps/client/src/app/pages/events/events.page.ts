import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientApiService, EventItem } from '../../shared/services/client-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './events.page.html',
})
export class EventsPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);

  events = signal<EventItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getEvents().subscribe({
      next: (list) => {
        this.events.set(list.filter(e => e.published));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStatus(event: EventItem): 'upcoming' | 'ongoing' | 'ended' {
    const today = new Date().toISOString().slice(0, 10);
    if (event.startDate && event.startDate.slice(0, 10) > today) return 'upcoming';
    if (event.endDate && event.endDate.slice(0, 10) < today) return 'ended';
    return 'ongoing';
  }

  getStatusLabel(event: EventItem): string {
    const s = this.getStatus(event);
    if (s === 'upcoming') return 'events.status_upcoming';
    if (s === 'ended') return 'events.status_ended';
    return 'events.status_ongoing';
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