import { Component, inject, signal, OnInit, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientApiService } from '../../shared/services/client-api.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
  selector: 'app-support-projects-page',
  standalone: true,
  imports: [FormsModule, TranslatePipe, RichTextPipe],
  templateUrl: './support-projects.page.html',
  styleUrl: './support-projects.page.css',
})
export class SupportProjectsPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);
  private translate = inject(TranslateService);

  /** 카테고리 카드 외부 클릭 시 선택 해제 */
  @HostListener('document:click', ['$event.target'])
  onDocClick(target: EventTarget | null): void {
    if (!this.activeCategory() || !(target instanceof HTMLElement)) return;
    if (!target.closest('[data-category-card]')) {
      this.clearCategory();
    }
  }

  /** Escape 키로 카테고리 선택 해제 (접근성) */
  @HostListener('document:keydown.escape')
  onEscKey(): void {
    this.clearCategory();
  }

  scrollTo(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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

  selectCategory(key: string): void {
    this.activeCategory.set(this.activeCategory() === key ? '' : key);
  }

  clearCategory(): void {
    this.activeCategory.set('');
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
    if (!this.formPhone1.trim() || !this.formPhone2.trim() || !this.formPhone3.trim()) {
      alert(this.t('marketing.form_phone'));
      return;
    }
    if (!this.agreePrivacy) {
      alert(this.t('marketing.agree_privacy'));
      return;
    }

    const phone = `${this.formPhone1}-${this.formPhone2}-${this.formPhone3}`;
    this.submitting.set(true);
    this.api.createInquiry({
      name: this.formName.trim(),
      phone,
      email: this.formEmail.trim() || undefined,
      content: `[Support Inquiry] ${this.formName.trim()}`,
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
        alert(this.t('marketing.submitted_desc'));
        this.submitting.set(false);
      },
    });
  }
}
