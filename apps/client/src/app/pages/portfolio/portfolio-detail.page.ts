import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientApiService, PortfolioItem } from '../../shared/services/client-api.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-portfolio-detail-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './portfolio-detail.page.html',
})
export class PortfolioDetailPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);

  item = signal<PortfolioItem | null>(null);
  recommended = signal<PortfolioItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) return;
      this.loading.set(true);
      this.item.set(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      this.api.getPortfolioDetail(id).subscribe({
        next: (data) => {
          this.item.set(data);
          this.loading.set(false);
          this.loadRecommended(id);
        },
        error: () => this.loading.set(false),
      });
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
    this.router.navigate(['/portfolio']);
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
