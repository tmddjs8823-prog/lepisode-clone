import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
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
  private api = inject(ClientApiService);
  private translate = inject(TranslateService);
  private hostingTimer: ReturnType<typeof setInterval> | null = null;

  /* ── 호스팅 벨트 ── */
  activeHostingIdx = signal(0);
  hostingOffset = signal(172);
  hostingTransition = signal(true);
  private readonly STEP = 88;
  private readonly CENTER = 172;

  ngOnInit(): void {
    this.loadTranslatedData();
    this.translate.onLangChange.subscribe(() => this.loadTranslatedData());

    this.hostingTimer = setInterval(() => {
      const len = this.hostingServices.length;
      const cur = this.activeHostingIdx();

      if (cur === len - 1) {
        this.hostingTransition.set(true);
        this.activeHostingIdx.set(len);
        this.hostingOffset.set(this.CENTER - len * this.STEP);
        setTimeout(() => {
          this.hostingTransition.set(false);
          this.activeHostingIdx.set(0);
          this.hostingOffset.set(this.CENTER);
          requestAnimationFrame(() => this.hostingTransition.set(true));
        }, 750);
      } else {
        this.activeHostingIdx.set(cur + 1);
        this.hostingOffset.set(this.CENTER - (cur + 1) * this.STEP);
      }
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.hostingTimer) clearInterval(this.hostingTimer);
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  private loadTranslatedData(): void {
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
  formPhone = '';
  formEmail = '';
  agreePrivacy = false;
  submitting = signal(false);
  submitted = signal(false);

  submitInquiry(): void {
    if (!this.formName.trim()) { alert('성함을 입력해주세요.'); return; }
    if (!this.formPhone.trim()) { alert('연락처를 입력해주세요.'); return; }
    if (!this.agreePrivacy) { alert('개인정보 수집 및 이용에 동의해주세요.'); return; }

    this.submitting.set(true);
    this.api.createInquiry({
      name: this.formName.trim(),
      phone: this.formPhone.trim(),
      email: this.formEmail.trim() || undefined,
      content: `[마케팅·호스팅 문의] ${this.formName.trim()}`,
    }).subscribe({
      next: () => {
        this.submitted.set(true);
        this.submitting.set(false);
        this.formName = '';
        this.formPhone = '';
        this.formEmail = '';
        this.agreePrivacy = false;
      },
      error: () => {
        alert('문의 등록에 실패했습니다.');
        this.submitting.set(false);
      },
    });
  }
}
