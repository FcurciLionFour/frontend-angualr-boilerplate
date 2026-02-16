import { ApplicationConfig, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { API_CONFIG, apiConfig } from './core/config/api.config';
import { SessionService } from './core/auth/session.service';
import { authInterceptor } from './core/http/auth.interceptor';
import { csrfInterceptor } from './core/http/csrf.interceptor';
import { refreshInterceptor } from './core/http/refresh.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { GlobalErrorHandler } from './core/observability/global-error.handler';

export function initSession(session: SessionService) {
  return () => firstValueFrom(session.init());
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_CONFIG, useValue: apiConfig },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: APP_INITIALIZER,
      useFactory: initSession,
      deps: [SessionService],
      multi: true,
    },
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        csrfInterceptor,
        refreshInterceptor,
        errorInterceptor,
      ])
    ),
  ],
};
