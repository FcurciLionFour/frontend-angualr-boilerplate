import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { SessionService } from '../auth/session.service';
import { AuthStore } from '../auth/auth.store';

const REFRESH_ATTEMPTED = new HttpContextToken<boolean>(() => false);

function shouldSkipRefresh(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/csrf') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password') ||
    url.includes('/health') ||
    url.includes('/ready') ||
    url.includes('/metrics')
  );
}

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const authStore = inject(AuthStore);

  if (shouldSkipRefresh(req.url)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const alreadyRetried = req.context.get(REFRESH_ATTEMPTED);

      if (error.status !== 401 || alreadyRetried || authStore.initializing()) {
        return throwError(() => error);
      }

      return sessionService.refreshAccessToken().pipe(
        switchMap((accessToken) => {
          const retryReq = req.clone({
            context: req.context.set(REFRESH_ATTEMPTED, true),
            setHeaders: { Authorization: `Bearer ${accessToken}` },
          });

          return next(retryReq);
        }),
        catchError((refreshError) => {
          sessionService.handleAuthFailure();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
