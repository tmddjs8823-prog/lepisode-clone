import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientApiService } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-marketing-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './marketing.page.html',
  styleUrl: './marketing.page.css',
})
export class MarketingPage implements OnInit, OnDestroy {
  private api = inject(ClientApiService);
  private hostingTimer: ReturnType<typeof setInterval> | null = null;

  /* ── 호스팅 벨트 ── */
  activeHostingIdx = signal(0);
  hostingOffset = signal(172);
  hostingTransition = signal(true);
  private readonly STEP = 88;
  private readonly CENTER = 172;

  ngOnInit(): void {
    this.hostingTimer = setInterval(() => {
      const len = this.hostingServices.length;
      const cur = this.activeHostingIdx();

      if (cur === len - 1) {
        this.hostingTransition.set(true);
        this.activeHostingIdx.set(len); // 복제 카드로 이동
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

  /* ── 마케팅 서비스 ── */
  readonly marketingServices = [
    { icon: 'search', title: '키워드 광고', desc: '네이버·구글 키워드 광고\n최적화된 광고 전략 수립' },
    { icon: 'megaphone', title: 'SNS 마케팅', desc: '인스타그램·페이스북 등\n맞춤형 소셜 마케팅' },
    { icon: 'chart', title: '바이럴 마케팅', desc: '블로그·카페·커뮤니티\n바이럴 콘텐츠 확산' },
    { icon: 'video', title: '영상 마케팅', desc: '유튜브·숏폼 영상\n브랜드 스토리 제작' },
    { icon: 'palette', title: '브랜드 디자인', desc: 'BI/CI 디자인·인쇄물\n브랜드 아이덴티티 구축' },
  ];

  /* ── 호스팅 서비스 ── */
  readonly hostingServices = [
    { icon: 'server', color: 'bg-blue-500', title: '웹 호스팅', desc: '빠르고 안정적인 SSD 기반 웹 호스팅으로\n웹사이트 로딩 속도를 극대화합니다.' },
    { icon: 'cloud', color: 'bg-indigo-500', title: '클라우드 서버 구축', desc: 'AWS, GCP 등 클라우드 인프라를\n안정적으로 구축·운영합니다.' },
    { icon: 'dns', color: 'bg-cyan-500', title: '도메인 · DNS 관리', desc: '도메인 등록부터 DNS 설정,\n네임서버 관리까지 원스톱.' },
    { icon: 'ssl', color: 'bg-violet-500', title: 'SSL/TLS 보안 인증서', desc: 'HTTPS 적용으로 안전한\n웹사이트 환경을 보장합니다.' },
    { icon: 'monitor', color: 'bg-emerald-500', title: '24시간 모니터링', desc: '실시간 서버 상태 감시와\n장애 자동 감지·대응 시스템.' },
  ];

  /* ── 프로세스 ── */
  readonly processes = [
    { step: '01', title: '상담 및 분석', desc: '비즈니스 목표와\n현황을 파악합니다' },
    { step: '02', title: '전략 수립', desc: '맞춤형 마케팅·호스팅\n전략을 설계합니다' },
    { step: '03', title: '실행 및 운영', desc: '전문 팀이 직접\n운영합니다' },
    { step: '04', title: '리포트 제공', desc: '성과 분석 리포트를\n정기 제공합니다' },
  ];

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
