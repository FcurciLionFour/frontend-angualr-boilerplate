import { Injectable, computed, signal } from '@angular/core';
import { User } from './auth.types';

export interface AuthSessionState {
  user: User;
  roles: string[];
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<User | null>(null);
  private readonly _roles = signal<string[]>([]);
  private readonly _permissions = signal<string[]>([]);
  private readonly _initializing = signal(true);

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly permissions = this._permissions.asReadonly();
  readonly initializing = this._initializing.asReadonly();
  readonly isAuthenticated = computed(
    () => Boolean(this._accessToken()) && Boolean(this._user())
  );

  setAccessToken(token: string) {
    this._accessToken.set(token);
  }

  setSession(session: AuthSessionState) {
    this._user.set(session.user);
    this._roles.set(session.roles);
    this._permissions.set(session.permissions);
  }

  finishInit() {
    this._initializing.set(false);
  }

  clearSession() {
    this._accessToken.set(null);
    this._user.set(null);
    this._roles.set([]);
    this._permissions.set([]);
    this._initializing.set(false);
  }
}
