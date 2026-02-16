import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthApi } from './auth.api';
import { AuthStore } from './auth.store';
import { SessionService } from './session.service';
import { CsrfApi } from '../security/csrf.api';

describe('SessionService', () => {
  let service: SessionService;
  let authApiSpy: jasmine.SpyObj<AuthApi>;
  let csrfApiSpy: jasmine.SpyObj<CsrfApi>;
  let authStoreSpy: jasmine.SpyObj<AuthStore>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authApiSpy = jasmine.createSpyObj<AuthApi>('AuthApi', [
      'login',
      'logout',
      'refresh',
      'me',
    ]);
    csrfApiSpy = jasmine.createSpyObj<CsrfApi>('CsrfApi', ['init']);
    authStoreSpy = jasmine.createSpyObj<AuthStore>('AuthStore', [
      'setAccessToken',
      'setSession',
      'clearSession',
      'finishInit',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SessionService,
        { provide: AuthApi, useValue: authApiSpy },
        { provide: CsrfApi, useValue: csrfApiSpy },
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(SessionService);
  });

  it('runs login flow: csrf -> login -> me', () => {
    csrfApiSpy.init.and.returnValue(of({}));
    authApiSpy.login.and.returnValue(of({ accessToken: 'access-token' }));
    authApiSpy.me.and.returnValue(
      of({
        user: { id: 'u1', email: 'user@test.com' },
        roles: ['USER'],
        permissions: ['users.read'],
      })
    );

    service.login('user@test.com', 'pass').subscribe();

    expect(csrfApiSpy.init).toHaveBeenCalledTimes(1);
    expect(authApiSpy.login).toHaveBeenCalledTimes(1);
    expect(authStoreSpy.setAccessToken).toHaveBeenCalledWith('access-token');
    expect(authApiSpy.me).toHaveBeenCalledTimes(1);
    expect(authStoreSpy.setSession).toHaveBeenCalled();
    expect(authStoreSpy.finishInit).toHaveBeenCalledTimes(1);
  });

  it('clears session when refresh fails during init', () => {
    csrfApiSpy.init.and.returnValue(of({}));
    authApiSpy.refresh.and.returnValue(
      throwError(() => new Error('refresh failed'))
    );

    service.init().subscribe();

    expect(authStoreSpy.clearSession).toHaveBeenCalled();
    expect(authStoreSpy.finishInit).toHaveBeenCalled();
  });

  it('clears session and navigates on logout', () => {
    csrfApiSpy.init.and.returnValue(of({}));
    authApiSpy.logout.and.returnValue(of(void 0));

    service.logout().subscribe();

    expect(authStoreSpy.clearSession).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
