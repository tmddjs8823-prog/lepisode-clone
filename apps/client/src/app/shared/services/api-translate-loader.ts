import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface TranslationItem {
  id: number;
  key: string;
  ko: string;
  en?: string | null;
  ja?: string | null;
}

/**
 * 1. 정적 JSON 파일(assets/i18n/{lang}.json)을 기본 로드
 * 2. 브라우저 환경에서만 Admin API(/api/v1/i18n/translations)에서 번역 데이터를 가져와 머지
 * → API 데이터가 정적 파일을 덮어쓰므로 Admin에서 수정하면 즉시 반영
 * → SSR에서는 정적 파일만 사용 (API 호출 X → OOM 방지)
 */
export class ApiTranslateLoader extends TranslateLoader {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  getTranslation(lang: string): Observable<Record<string, string>> {
    // Capacitor: baseHref가 ./이므로 상대경로로 assets 접근
    const assetsBase = environment.apiUrl ? './assets' : '/assets';
    const staticFile$ = this.http
      .get<Record<string, string>>(`${assetsBase}/i18n/${lang}.json`)
      .pipe(catchError(() => of({})));

    // SSR 환경에서는 정적 파일만 사용
    if (!isPlatformBrowser(this.platformId)) {
      return staticFile$;
    }

    const apiBase = environment.apiUrl || '';
    const api$ = this.http
      .get<TranslationItem[]>(`${apiBase}/api/v1/i18n/translations`)
      .pipe(
        map((items) => {
          const result: Record<string, string> = {};
          items.forEach((item) => {
            // ko 요청: 항상 ko 값 사용
            // en/ja 요청: 해당 언어 값이 있을 때만 포함 (없으면 fallbackLang이 한국어로 처리)
            let value: string | null | undefined;
            if (lang === 'ko') {
              value = item.ko;
            } else if (lang === 'en') {
              value = item.en;
            } else if (lang === 'ja') {
              value = item.ja;
            }
            if (value) result[item.key] = value;
          });
          return result;
        }),
        catchError(() => of({})),
      );

    // 정적 파일 + API 데이터를 머지 (API 우선)
    return forkJoin([staticFile$, api$]).pipe(
      map(([staticData, apiData]) => ({ ...staticData, ...apiData })),
    );
  }
}

