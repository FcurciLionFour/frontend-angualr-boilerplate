import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AppLoggerService } from '../observability/app-logger.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let loggerSpy: jasmine.SpyObj<AppLoggerService>;

  beforeEach(() => {
    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', ['error']);
    loggerSpy = jasmine.createSpyObj<AppLoggerService>('AppLoggerService', [
      'warn',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastSpy },
        { provide: AppLoggerService, useValue: loggerSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows toast with retry info on 429', () => {
    let receivedError: HttpErrorResponse | undefined;
    http.get('/users').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const request = httpMock.expectOne('/users');
    request.flush(
      {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retryAfterSeconds: 8,
      },
      { status: 429, statusText: 'Too Many Requests' }
    );

    expect(toastSpy.error).toHaveBeenCalledWith(
      'Demasiadas solicitudes. Reintentar en 8s.'
    );
    expect(loggerSpy.warn).toHaveBeenCalled();
    expect(receivedError instanceof HttpErrorResponse).toBeTrue();
  });
});
