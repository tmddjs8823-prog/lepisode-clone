import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientApiService, ServiceItem } from '../../shared/services/client-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './services.page.html',
  styleUrl: './services.page.css',
})
export class ServicesPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);

  services = signal<ServiceItem[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getServices().subscribe({
      next: (list) => this.services.set(Array.isArray(list) ? list : []),
      error: () => this.services.set([]),
    });
  }

  toggleDetail(item: ServiceItem): void {
    const el = document.getElementById('detail-' + item.id);
    if (el) {
      el.classList.toggle('open');
    }
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
