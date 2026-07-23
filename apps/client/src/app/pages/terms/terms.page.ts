import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientApiService} from '../../shared/services/client-api.service';

interface TermsMeta {
  type: string;
  title: string;
  subtitle: string;
}

const TERMS_MAP: Record<string, TermsMeta> = {
  privacy: { type: 'PRIVACY', title: '개인정보 취급방침', subtitle: '개인정보의 수집 및 이용에 관한 안내' },
  service: { type: 'SERVICE', title: '서비스 이용약관', subtitle: '서비스 이용에 관한 약관 안내' },
  marketing: { type: 'MARKETING', title: '마케팅 수신동의 약관', subtitle: '마케팅 정보 수신에 관한 안내' },
};

@Component({
  selector: 'app-terms-page',
  standalone: true,
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
    const slug = this.route.snapshot.paramMap.get('type') ?? 'privacy';
    const meta = TERMS_MAP[slug] ?? TERMS_MAP['privacy'];

    this.title.set(meta.title);
    this.subtitle.set(meta.subtitle);

    if (!this.isBrowser) return;

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
  }
}
