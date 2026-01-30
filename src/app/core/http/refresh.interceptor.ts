import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { AuthApi } from "../auth/auth.api";
import { AuthStore } from "../auth/auth.store";
import { catchError, switchMap, throwError } from "rxjs";
import { inject } from "@angular/core";

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authApi = inject(AuthApi);
  const authStore = inject(AuthStore);

  // 🚫 nunca interceptar auth endpoints
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/csrf')
  ) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || authStore.initializing()) {
        return throwError(() => error);
      }

      return authApi.refresh().pipe(
        switchMap(({ accessToken }) => {
          authStore.setAccessToken(accessToken);

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          return next(retryReq);
        }),
        catchError(err => {
          authStore.clearSession();
          return throwError(() => err);
        })
      );
    })
  );
};
