import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideTranslateService, provideTranslateLoader, TranslateService } from '@ngx-translate/core';
import { appRoutes } from './app.routes';
import { ApiTranslateLoader } from './shared/services/api-translate-loader';
import { firstValueFrom } from 'rxjs';

/** 앱 시작 전 번역 파일 프리로드 */
function initTranslations(translate: TranslateService): () => Promise<void> {
  return async () => {
    translate.setFallbackLang('ko');
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
    const lang = saved && ['ko', 'en', 'ja'].includes(saved) ? saved : 'ko';
    await firstValueFrom(translate.use(lang));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(
      appRoutes,
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withFetch()),
    provideTranslateService({
      fallbackLang: 'ko',
      lang: 'ko',
      loader: provideTranslateLoader(ApiTranslateLoader),
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true,
    },
  ],
};
