import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { ClientApiService, ServiceItem } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './services.page.html',
  styleUrl: './services.page.css',
})
export class ServicesPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);

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
}
