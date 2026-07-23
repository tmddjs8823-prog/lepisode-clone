import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientApiService, PortfolioItem } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-portfolio-detail-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './portfolio-detail.page.html',
})
export class PortfolioDetailPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private api = inject(ClientApiService);

  item = signal<PortfolioItem | null>(null);
  recommended = signal<PortfolioItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.api.getPortfolioDetail(id).subscribe({
      next: (data) => {
        this.item.set(data);
        this.loading.set(false);
        this.loadRecommended(id);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadRecommended(currentId: number): void {
    this.api.getPortfolios(10).subscribe({
      next: (list) => {
        const filtered = list
          .filter(p => p.id !== currentId)
          .slice(0, 3);
        this.recommended.set(filtered);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
