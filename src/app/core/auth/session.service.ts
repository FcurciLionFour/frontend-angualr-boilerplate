import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AuthApi } from './auth.api';
import { AuthStore } from './auth.store';
import { CsrfApi } from '../security/csrf.api';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private refreshInFlight$: Observable<string> | null = null;

  constructor(
    private readonly csrfApi: CsrfApi,
    private readonly authApi: AuthApi,
    private readonly authStore: AuthStore,
    private readonly router: Router
  ) {}

  init() {
    return this.csrfApi.init().pipe(
      switchMap(() => this.refreshAccessToken()),
      switchMap(() => this.hydrateIdentity()),
      catchError(() => {
        this.authStore.clearSession();
        return of(void 0);
      }),
      tap(() => this.authStore.finishInit())
    );
  }

  login(email: string, password: string) {
    return this.csrfApi.init().pipe(
      switchMap(() => this.authApi.login(email, password)),
      tap(({ accessToken }) => this.authStore.setAccessToken(accessToken)),
      switchMap(() => this.hydrateIdentity()),
      tap(() => this.authStore.finishInit())
    );
  }

  logout() {
    return this.csrfApi.init().pipe(
      switchMap(() => this.authApi.logout()),
      catchError(() => of(void 0)),
      tap(() => {
        this.authStore.clearSession();
        void this.router.navigate(['/auth/login']);
      }),
      map(() => void 0)
    );
  }

  refreshAccessToken() {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    this.refreshInFlight$ = this.authApi.refresh().pipe(
      tap(({ accessToken }) => this.authStore.setAccessToken(accessToken)),
      map(({ accessToken }) => accessToken),
      catchError((error) => {
        this.authStore.clearSession();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshInFlight$ = null;
      }),
      shareReplay(1)
    );

    return this.refreshInFlight$;
  }

  handleAuthFailure() {
    this.authStore.clearSession();
    void this.router.navigate(['/auth/login']);
  }

  private hydrateIdentity() {
    return this.authApi.me().pipe(
      tap(({ user, roles, permissions }) =>
        this.authStore.setSession({ user, roles, permissions })
      ),
      map(() => void 0)
    );
  }
}
