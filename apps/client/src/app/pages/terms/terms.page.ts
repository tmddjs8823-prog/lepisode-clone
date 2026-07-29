import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientApiService} from '../../shared/services/client-api.service';
import { TranslatePipe } from '@ngx-translate/core';

interface TermsMeta {
  type: string;
  title: string;
  subtitle: string;
}

const TERMS_MAP: Record<string, TermsMeta> = {
  privacy: { type: 'PRIVACY', title: 'terms.title', subtitle: 'footer.privacy' },
  service: { type: 'SERVICE', title: 'terms.title', subtitle: 'footer.terms' },
  marketing: { type: 'MARKETING', title: 'terms.title', subtitle: 'footer.marketing' },
};

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './terms.page.html',
  styleUrl: './terms.page.css',
})
export class TermsPage implements OnInit {
  private api = inject(ClientApiService);
  private route = inject(ActivatedRoute);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  title = signal('');
  subtitle = signal('');
  content = signal('');
  loading = signal(true);
  updatedAt = signal('');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('type') ?? 'privacy';
      const meta = TERMS_MAP[slug] ?? TERMS_MAP['privacy'];

      this.title.set(meta.title);
      this.subtitle.set(meta.subtitle);

      if (!this.isBrowser) return;

      this.loading.set(true);
      this.api.getTermsByType(meta.type).subscribe({
        next: (item) => {
          this.content.set(item.content ?? '');
          this.updatedAt.set(item.updatedAt ?? '');
          this.loading.set(false);
        },
        error: () => {
          this.content.set('<p>약관 내용을 불러올 수 없습니다.</p>');
          this.loading.set(false);
        },
      });
    });
  }
}
