import { HttpInterceptorFn } from '@angular/common/http';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

function getCookie(name: string): string | null {
  const rawValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];

  if (!rawValue) {
    return null;
  }

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
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
