import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { API_CONFIG } from '../config/api.config';

const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/csrf',
  '/auth/forgot-password',
  '/auth/reset-password',
];

function isBackendRequest(url: string, baseUrl: string): boolean {
  const isAbsolute = /^https?:\/\//i.test(url);
  if (isAbsolute) {
    return url.startsWith(baseUrl);
  }

  return url.startsWith('/');
}

function isAuthPublicEndpoint(url: string): boolean {
  return AUTH_PUBLIC_PATHS.some((path) => url.includes(path));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const config = inject(API_CONFIG);
  const token = authStore.accessToken();

  if (
    !token ||
    !isBackendRequest(req.url, config.baseUrl) ||
    isAuthPublicEndpoint(req.url)
  ) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
