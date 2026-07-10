import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TranslationMap {
  [key: string]: { ko: string; en?: string; ja?: string };
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private translations = signal<TranslationMap>({});
  private currentLang = signal<'ko' | 'en' | 'ja'>('ko');

  constructor(private http: HttpClient) {
    this.loadTranslations();
  }

  private loadTranslations() {
    this.http.get<{ id: number; key: string; ko: string; en?: string; ja?: string }[]>(
      '/api/v1/i18n/translations'
    ).subscribe({
      next: (items) => {
        const map: TranslationMap = {};
        for (const item of items) {
          map[item.key] = { ko: item.ko, en: item.en || undefined, ja: item.ja || undefined };
        }
        this.translations.set(map);
      },
      error: () => { /* 번역 로드 실패 시 기본값 사용 */ },
    });
  }

  /** 현재 언어 기준으로 번역 문자열 반환 (없으면 fallback → ko → key) */
  t(key: string): string {
    const entry = this.translations()[key];
    if (!entry) return key;
    const lang = this.currentLang();
    return entry[lang] || entry['ko'] || key;
  }

  get lang() { return this.currentLang; }

  setLang(lang: 'ko' | 'en' | 'ja') {
    this.currentLang.set(lang);
  }
}
