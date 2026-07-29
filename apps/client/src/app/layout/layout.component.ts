import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { PopupComponent } from '../shared/components/popup/popup.component';
import { ClientApiService } from '../shared/services/client-api.service';
import { I18nService } from '../shared/services/i18n.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule, TranslatePipe, HeaderComponent, FooterComponent, PopupComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private api = inject(ClientApiService);
  i18n = inject(I18nService);

  showInquiry = false;
  submitting = signal(false);
  submitted = signal(false);

  /* 폼 필드 */
  formName = '';
  phone1 = '010';
  phone2 = '';
  phone3 = '';
  formEmail = '';
  agreePrivacy = false;
  agreeMarketing = false;

  toggleInquiry(): void {
    this.showInquiry = !this.showInquiry;
    if (!this.showInquiry) this.resetForm();
  }

  closeInquiry(): void {
    this.showInquiry = false;
    this.resetForm();
  }

  submitInquiry(): void {
    if (!this.formName.trim()) { alert('이름을 입력해주세요.'); return; }
    if (!this.phone2.trim() || !this.phone3.trim()) { alert('연락처를 입력해주세요.'); return; }
    if (!this.formEmail.trim()) { alert('이메일을 입력해주세요.'); return; }
    if (!this.agreePrivacy) { alert('개인정보 수집 및 이용에 동의해주세요.'); return; }

    this.submitting.set(true);
    const phone = `${this.phone1}-${this.phone2}-${this.phone3}`;

    this.api.createInquiry({
      name: this.formName,
      phone,
      email: this.formEmail,
      content: `[글로벌 문의] ${this.formName}님 문의`,
    }).subscribe({
      next: () => {
        // 마케팅 수신동의 체크 시 → consent API 호출
        if (this.agreeMarketing) {
          this.api.createMarketingConsent({
            name: this.formName,
            email: this.formEmail,
            phone,
          }).subscribe(); // fire-and-forget
        }
        this.submitting.set(false);
        this.submitted.set(true);
        setTimeout(() => {
          this.submitted.set(false);
          this.closeInquiry();
        }, 2000);
      },
      error: () => {
        this.submitting.set(false);
        alert('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
      },
    });
  }

  private resetForm(): void {
    this.formName = '';
    this.phone1 = '010';
    this.phone2 = '';
    this.phone3 = '';
    this.formEmail = '';
    this.agreePrivacy = false;
    this.agreeMarketing = false;
    this.submitted.set(false);
  }
}
