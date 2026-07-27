import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

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
  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);

  /** 현재 선택된 언어 */
  currentLang = signal<Lang>('ko');

  constructor() {
    // localStorage에서 저장된 언어 복원
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved && LANGUAGES.some(l => l.code === saved)) {
        this.currentLang.set(saved);
      }
    }

    // ngx-translate 초기 언어 설정
    this.translate.setFallbackLang('ko').subscribe();
    this.translate.use(this.currentLang()).subscribe();
  }

  /** 언어 변경 */
  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    // 캐시된 번역을 제거하고 새로 로드
    this.translate.resetLang(lang);
    this.translate.use(lang).subscribe();
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }

  /** 현재 언어 옵션 가져오기 */
  getCurrentOption(): LangOption {
    return LANGUAGES.find(l => l.code === this.currentLang()) ?? LANGUAGES[0];
  }

  /**
   * 번역 키로 현재 언어의 텍스트를 반환합니다.
   * @deprecated translate pipe 사용을 권장합니다: {{ 'key' | translate }}
   */
  t(key: string, fallback = ''): string {
    const result = this.translate.instant(key);
    // instant()는 키를 찾지 못하면 키 자체를 반환
    return (result === key) ? fallback : result;
  }
}
