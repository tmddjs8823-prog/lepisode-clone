import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClientApiService, TranslationItem } from './client-api.service';

export type Lang = 'ko' | 'en' | 'ja';

export interface LangOption {
  code: Lang;
  label: string;
  flag: string;
}

export const LANGUAGES: LangOption[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

@Injectable({ providedIn: 'root' })
export class I18nService {
  private api = inject(ClientApiService);
  private platformId = inject(PLATFORM_ID);

  /** 현재 선택된 언어 */
  currentLang = signal<Lang>('ko');

  /** 번역 데이터 로드 완료 여부 */
  loaded = signal(false);

  /** 번역 맵: key → { ko, en, ja } */
  private translations = new Map<string, TranslationItem>();

  constructor() {
    // localStorage에서 저장된 언어 복원
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved && LANGUAGES.some(l => l.code === saved)) {
        this.currentLang.set(saved);
      }
    }

    // 브라우저에서만 번역 데이터 로드
    if (isPlatformBrowser(this.platformId)) {
      this.loadTranslations();
    }
  }

  /** API에서 전체 번역 데이터 로드 */
  private loadTranslations(): void {
    this.api.getTranslations().subscribe({
      next: (items) => {
        this.translations.clear();
        items.forEach(item => this.translations.set(item.key, item));
        this.loaded.set(true);
      },
      error: () => {
        // API 실패해도 한국어 하드코딩 텍스트가 폴백으로 동작
        this.loaded.set(true);
      },
    });
  }

  /** 번역 데이터 새로고침 (언어 변경 시 불필요 — 이미 전부 로드됨) */
  refresh(): void {
    this.loadTranslations();
  }

  /** 언어 변경 */
  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }

  /** 현재 언어 옵션 가져오기 */
  getCurrentOption(): LangOption {
    return LANGUAGES.find(l => l.code === this.currentLang()) ?? LANGUAGES[0];
  }

  /**
   * 번역 키로 현재 언어의 텍스트를 반환합니다.
   *
   * @param key 번역 키 (예: 'nav.about', 'home.hero.title')
   * @param fallback 번역이 없을 때 표시할 기본 텍스트 (보통 한국어 원문)
   * @returns 현재 언어의 번역 텍스트. 없으면 fallback → ko 순서로 폴백
   *
   * 사용법:
   *   {{ i18n.t('nav.about', '회사 소개') }}
   */
  t(key: string, fallback = ''): string {
    const item = this.translations.get(key);
    if (!item) return fallback;

    const lang = this.currentLang();
    if (lang === 'ko') return item.ko || fallback;
    if (lang === 'en') return item.en || item.ko || fallback;
    if (lang === 'ja') return item.ja || item.ko || fallback;
    return item.ko || fallback;
  }
}
