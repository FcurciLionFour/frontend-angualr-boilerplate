import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_CONFIG, apiConfig } from './core/config/api.config';
import { SessionService } from './core/auth/session.service';
import { authInterceptor } from './core/http/auth.interceptor';
import { csrfInterceptor } from './core/http/csrf.interceptor';
import { refreshInterceptor } from './core/http/refresh.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

export function initSession(session: SessionService) {
  return () => session.init().toPromise();
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_CONFIG, useValue: apiConfig },
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
