import { HttpInterceptorFn } from '@angular/common/http';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

function getCookie(name: string): string | null {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1] ?? null;
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const method = req.method.toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (!isMutation) {
    return next(req);
  }

  const csrfToken = getCookie(CSRF_COOKIE);
  if (!csrfToken) {
    return next(req);
  }

  const csrfReq = req.clone({
    setHeaders: {
      [CSRF_HEADER]: csrfToken,
    },
  });

  return next(csrfReq);
};
