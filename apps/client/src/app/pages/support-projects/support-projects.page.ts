import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientApiService } from '../../shared/services/client-api.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-support-projects-page',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './support-projects.page.html',
  styleUrl: './support-projects.page.css',
})
export class SupportProjectsPage implements OnInit {
  private api = inject(ClientApiService);
  private translate = inject(TranslateService);

  private t(key: string): string {
    return this.translate.instant(key);
  }

  /* ── 필터 ── */
  categories: { key: string; label: string; icon: string; desc: string }[] = [];

  private loadTranslatedData(): void {
    this.categories = [
      { key: 'pre-startup', label: this.t('support.cat1_label'), icon: 'rocket', desc: this.t('support.cat1_desc') },
      { key: 'small-biz', label: this.t('support.cat2_label'), icon: 'store', desc: this.t('support.cat2_desc') },
      { key: 'sme', label: this.t('support.cat3_label'), icon: 'grid', desc: this.t('support.cat3_desc') },
      { key: 'mid-corp', label: this.t('support.cat4_label'), icon: 'chart', desc: this.t('support.cat4_desc') },
      { key: 'global', label: this.t('support.cat5_label'), icon: 'globe', desc: this.t('support.cat5_desc') },
    ];
  }

  ngOnInit(): void {
    this.loadTranslatedData();
    this.translate.onLangChange.subscribe(() => this.loadTranslatedData());
  }

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
      alert(this.t('marketing.form_name'));
      return;
    }
    if (!this.formPhone.trim()) {
      alert(this.t('marketing.form_phone'));
      return;
    }
    if (!this.agreePrivacy) {
      alert(this.t('marketing.agree_privacy'));
      return;
    }

    this.submitting.set(true);
    this.api.createInquiry({
      name: this.formName.trim(),
      phone: this.formPhone.trim(),
      email: this.formEmail.trim() || undefined,
      content: `[Support Inquiry] ${this.formName.trim()}`,
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
        alert(this.t('marketing.submitted_desc'));
        this.submitting.set(false);
      },
    });
  }
}
