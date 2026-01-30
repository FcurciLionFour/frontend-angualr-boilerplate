import { catchError, of, switchMap, tap } from "rxjs";
import { CsrfApi } from "../security/csrf.api";
import { AuthApi } from "./auth.api";
import { AuthStore } from "./auth.store";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(
    private csrfApi: CsrfApi,
    private authApi: AuthApi,
    private authStore: AuthStore
  ) { }

  init() {
    return this.csrfApi.init().pipe(
      switchMap(() => this.authApi.refresh()),
      tap(({ accessToken }) => {
        this.authStore.setAccessToken(accessToken);
      }),
      switchMap(() => this.authApi.me()),
      tap(({ user, roles, permissions }) => {
        this.authStore.setSession({
          user,
          roles,
          permissions,
        });
      }),
      catchError(() => {
        this.authStore.clearSession();
        return of(null);
      })
    );
  }
}
