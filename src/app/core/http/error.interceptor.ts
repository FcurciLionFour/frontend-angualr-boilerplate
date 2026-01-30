import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 403:
          console.warn('Sin permisos');
          break;
        case 419:
          console.warn('CSRF inválido');
          break;
        case 500:
          console.error('Error servidor');
          break;
      }

      return throwError(() => error);
    })
  );
