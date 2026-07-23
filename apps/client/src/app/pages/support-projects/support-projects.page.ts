import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientApiService } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-support-projects-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './support-projects.page.html',
  styleUrl: './support-projects.page.css',
})
export class SupportProjectsPage {
  private api = inject(ClientApiService);

  /* ── 필터 ── */
  readonly categories = [
    { key: '예비창업자', label: '예비창업자', icon: 'rocket', desc: '사업계획 수립부터\n초기 자금 확보까지' },
    { key: '소상공인·스타트업', label: '소상공인 · 스타트업', icon: 'store', desc: '브랜딩·마케팅·기술 개발 지원' },
    { key: '중소기업', label: '중소 기업', icon: 'grid', desc: '생산성 향상과\n디지털 역량 강화' },
    { key: '중견기업', label: '중견 기업', icon: 'chart', desc: '조직 고도화와\n신사업 발굴 지원' },
    { key: '수출·글로벌', label: '수출 · 글로벌', icon: 'globe', desc: '수출 역량 강화와\n글로벌 네트워크 연결' },
  ];

  activeCategory = signal('');
  searchQuery = signal('');

  /* ── 문의 폼 ── */
  formName = '';
  formPhone = '';
  formEmail = '';
  agreePrivacy = false;
  agreeMarketing = false;
  submitting = signal(false);
  submitted = signal(false);

  selectCategory(key: string): void {
    this.activeCategory.set(key);
  }

  getSelectedIcon(): string {
    return this.categories.find(c => c.key === this.activeCategory())?.icon ?? '';
  }

  getSelectedDesc(): string {
    return this.categories.find(c => c.key === this.activeCategory())?.desc ?? '';
  }
  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  submitInquiry(): void {
    if (!this.formName.trim()) {
      alert('성함을 입력해주세요.');
      return;
    }
    if (!this.formPhone.trim()) {
      alert('연락처를 입력해주세요.');
      return;
    }
    if (!this.agreePrivacy) {
      alert('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    this.submitting.set(true);
    this.api.createInquiry({
      name: this.formName.trim(),
      phone: this.formPhone.trim(),
      email: this.formEmail.trim() || undefined,
      content: `[지원사업 문의] ${this.formName.trim()}`,
    }).subscribe({
      next: () => {
        this.submitted.set(true);
        this.submitting.set(false);
        this.formName = '';
        this.formPhone = '';
        this.formEmail = '';
        this.agreePrivacy = false;
        this.agreeMarketing = false;
      },
      error: () => {
        alert('문의 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
        this.submitting.set(false);
      },
    });
  }
}
