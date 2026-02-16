import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { SessionService } from '../auth/session.service';
import { refreshInterceptor } from './refresh.interceptor';

describe('refreshInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;

  beforeEach(() => {
    sessionServiceSpy = jasmine.createSpyObj<SessionService>('SessionService', [
      'refreshAccessToken',
      'handleAuthFailure',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([refreshInterceptor])),
        provideHttpClientTesting(),
        { provide: SessionService, useValue: sessionServiceSpy },
        {
          provide: AuthStore,
          useValue: {
            initializing: () => false,
          },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('retries request after successful refresh on 401', () => {
    sessionServiceSpy.refreshAccessToken.and.returnValue(of('new-access-token'));

    let response: { ok: boolean } | undefined;
    http.get<{ ok: boolean }>('/users').subscribe((value) => {
      response = value;
    });

    const firstAttempt = httpMock.expectOne('/users');
    firstAttempt.flush(
      { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );

    const secondAttempt = httpMock.expectOne('/users');
    expect(secondAttempt.request.headers.get('Authorization')).toBe(
      'Bearer new-access-token'
    );
    secondAttempt.flush({ ok: true });

    expect(sessionServiceSpy.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(response).toEqual({ ok: true });
  });

  it('handles auth failure when refresh fails', () => {
    sessionServiceSpy.refreshAccessToken.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );

    let receivedError: HttpErrorResponse | undefined;
    http.get('/users').subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const firstAttempt = httpMock.expectOne('/users');
    firstAttempt.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(sessionServiceSpy.handleAuthFailure).toHaveBeenCalledTimes(1);
    expect(receivedError instanceof HttpErrorResponse).toBeTrue();
  });

  it('does not refresh for auth login endpoint', () => {
    let receivedError: HttpErrorResponse | undefined;

    http.post('/auth/login', {}).subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    const request = httpMock.expectOne('/auth/login');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(sessionServiceSpy.refreshAccessToken).not.toHaveBeenCalled();
    expect(receivedError instanceof HttpErrorResponse).toBeTrue();
  });
});
