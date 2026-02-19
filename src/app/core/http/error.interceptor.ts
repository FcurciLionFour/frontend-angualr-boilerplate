import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AppLoggerService } from '../observability/app-logger.service';
import { normalizeBackendError } from './backend-error';

const PERMISSION_403_CODES = new Set<string>([
  'ACCESS_DENIED',
  'AUTH_MISSING_REQUIRED_PERMISSION',
  'AUTH_MISSING_REQUIRED_ROLE',
  'AUTH_USER_HAS_NO_ROLES',
]);

const CSRF_403_CODES = new Set<string>([
  'AUTH_CSRF_TOKEN_MISSING',
  'AUTH_CSRF_TOKEN_INVALID',
]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const logger = inject(AppLoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const normalized = normalizeBackendError(error);
      logger.warn('HTTP request failed', {
        method: req.method,
        url: req.url,
        statusCode: normalized.statusCode,
        code: normalized.code,
        requestId: normalized.requestId,
      });

      if (normalized.statusCode === 429) {
        const retryText =
          typeof normalized.retryAfterSeconds === 'number'
            ? ` Reintentar en ${normalized.retryAfterSeconds}s.`
            : '';
        toast.error(`Demasiadas solicitudes.${retryText}`);
      } else if (normalized.statusCode === 403) {
        if (PERMISSION_403_CODES.has(normalized.code)) {
          toast.error('No tenes permisos para realizar esta accion.');
        } else if (CSRF_403_CODES.has(normalized.code)) {
          toast.error(
            'Sesion de seguridad invalida. Refresca la pagina e intenta nuevamente.'
          );
        } else if (normalized.code === 'AUTH_REFRESH_REUSE_DETECTED') {
          toast.error('Sesion revocada. Inicia sesion nuevamente.');
        }
      } else if (normalized.statusCode >= 500) {
        toast.error('Error interno del servidor.');
      }

      return throwError(() => error);
    })
  );
};
