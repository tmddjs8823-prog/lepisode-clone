import { Component, inject, signal, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientApiService } from '../../shared/services/client-api.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-marketing-page',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './marketing.page.html',
  styleUrl: './marketing.page.css',
})
export class MarketingPage implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private translate = inject(TranslateService);
  private rafId: number | null = null;
  heroTitleHtml = signal('');

  scrollTo(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngOnInit(): void {
    this.loadTranslatedData();
    this.translate.onLangChange.subscribe(() => this.loadTranslatedData());

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.startCenterDetection(), 300);
    }
  }

  /** rAF 루프: 컨테이너 중앙에 가장 가까운 카드에 active 클래스 부여 */
  private startCenterDetection(): void {
    const container = document.querySelector('.hosting-belt-container') as HTMLElement;
    if (!container) return;

    const update = () => {
      const rect = container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const cards = container.querySelectorAll('.hosting-card');

      let closest: Element | null = null;
      let minDist = Infinity;

      cards.forEach(card => {
        const r = card.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - centerY);
        if (dist < minDist) { minDist = dist; closest = card; }
      });

      cards.forEach(card => {
        card.classList.toggle('hosting-card--active', card === closest);
      });

      this.rafId = requestAnimationFrame(update);
    };

    this.rafId = requestAnimationFrame(update);
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  private loadTranslatedData(): void {
    const title = this.t('marketing.hero_title') || '';
    const parts = title.split(',');
    if (parts.length >= 2) {
      this.heroTitleHtml.set(`<span class="text-indigo-900">${parts[0]},</span><br><span class="text-gray-900">${parts.slice(1).join(',').trim()}</span>`);
    } else {
      this.heroTitleHtml.set(`<span class="text-indigo-900">${title}</span>`);
    }

    this.marketingServices = [
      { icon: 'search', title: this.t('marketing.ms1_title'), desc: this.t('marketing.ms1_desc') },
      { icon: 'megaphone', title: this.t('marketing.ms2_title'), desc: this.t('marketing.ms2_desc') },
      { icon: 'chart', title: this.t('marketing.ms3_title'), desc: this.t('marketing.ms3_desc') },
      { icon: 'video', title: this.t('marketing.ms4_title'), desc: this.t('marketing.ms4_desc') },
      { icon: 'palette', title: this.t('marketing.ms5_title'), desc: this.t('marketing.ms5_desc') },
    ];

    this.hostingServices = [
      { icon: 'server', color: 'bg-blue-500', title: this.t('marketing.hs1_title'), desc: this.t('marketing.hs1_desc') },
      { icon: 'cloud', color: 'bg-indigo-500', title: this.t('marketing.hs2_title'), desc: this.t('marketing.hs2_desc') },
      { icon: 'dns', color: 'bg-cyan-500', title: this.t('marketing.hs3_title'), desc: this.t('marketing.hs3_desc') },
      { icon: 'ssl', color: 'bg-violet-500', title: this.t('marketing.hs4_title'), desc: this.t('marketing.hs4_desc') },
      { icon: 'monitor', color: 'bg-emerald-500', title: this.t('marketing.hs5_title'), desc: this.t('marketing.hs5_desc') },
    ];

    this.processes = [
      { step: '01', title: this.t('marketing.proc1_title'), desc: this.t('marketing.proc1_desc') },
      { step: '02', title: this.t('marketing.proc2_title'), desc: this.t('marketing.proc2_desc') },
      { step: '03', title: this.t('marketing.proc3_title'), desc: this.t('marketing.proc3_desc') },
      { step: '04', title: this.t('marketing.proc4_title'), desc: this.t('marketing.proc4_desc') },
    ];
  }

  /* ── 마케팅 서비스 ── */
  marketingServices: { icon: string; title: string; desc: string }[] = [];

  /* ── 호스팅 서비스 ── */
  hostingServices: { icon: string; color: string; title: string; desc: string }[] = [];

  /* ── 프로세스 ── */
  processes: { step: string; title: string; desc: string }[] = [];

  /* ── 문의 폼 ── */
  formName = '';
  formPhone1 = '';
  formPhone2 = '';
  formPhone3 = '';
  formEmail = '';
  agreePrivacy = false;
  agreeMarketing = false;
  submitting = signal(false);
  submitted = signal(false);

  autoFocusNext(event: Event, nextId: string, maxLen: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= maxLen) {
      document.getElementById(nextId)?.focus();
    }
  }

  submitInquiry(): void {
    if (!this.formName.trim()) { alert('성함을 입력해주세요.'); return; }
    if (!this.formPhone1.trim() || !this.formPhone2.trim() || !this.formPhone3.trim()) {
      alert('연락처를 입력해주세요.'); return;
    }
    if (!this.agreePrivacy) { alert('개인정보 수집 및 이용에 동의해주세요.'); return; }

    const phone = `${this.formPhone1}-${this.formPhone2}-${this.formPhone3}`;
    this.submitting.set(true);
    this.api.createInquiry({
      name: this.formName.trim(),
      phone,
      email: this.formEmail.trim() || undefined,
      content: `[마케팅·호스팅 문의] ${this.formName.trim()}`,
    }).subscribe({
      next: () => {
        this.submitted.set(true);
        this.submitting.set(false);
        this.formName = '';
        this.formPhone1 = '';
        this.formPhone2 = '';
        this.formPhone3 = '';
        this.formEmail = '';
        this.agreePrivacy = false;
        this.agreeMarketing = false;
      },
      error: () => {
        alert('문의 등록에 실패했습니다.');
        this.submitting.set(false);
      },
    });
  }
}
