import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AppLoggerService } from '../observability/app-logger.service';
import { normalizeBackendError } from './backend-error';

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
      } else if (
        normalized.statusCode === 403 &&
        normalized.code !== 'AUTH_INVALID_CREDENTIALS'
      ) {
        toast.error('No tenes permisos para realizar esta accion.');
      } else if (normalized.statusCode >= 500) {
        toast.error('Error interno del servidor.');
      }

      return throwError(() => error);
    })
  );
};
