import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { appRoutes } from './app.routes';
import { ApiTranslateLoader } from './shared/services/api-translate-loader';

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
  ],
};
