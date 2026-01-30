import { Injectable, signal, computed } from '@angular/core';
import { User } from './auth.types';

export interface AuthSession {
  user: User;
  roles: string[];
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _accessToken = signal<string | null>(null);
  private _user = signal<User | null>(null);
  private _roles = signal<string[]>([]);
  private _permissions = signal<string[]>([]);
  private _initializing = signal(true);

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly permissions = this._permissions.asReadonly();
  readonly initializing = this._initializing.asReadonly();

  /** 🔐 Autorización = token */
  readonly isAuthenticated = computed(
    () => !!this._accessToken()
  );

  /** Login simple */
  setAccessToken(token: string) {
    this._accessToken.set(token);
  }

  /** Hidratación COMPLETA desde /auth/me */
  setSession(session: AuthSession) {
    this._user.set(session.user);
    this._roles.set(session.roles);
    this._permissions.set(session.permissions);
    this._initializing.set(false);
  }

  /** Limpieza total */
  clearSession() {
    this._accessToken.set(null);
    this._user.set(null);
    this._roles.set([]);
    this._permissions.set([]);
    this._initializing.set(false);
  }

  /** Para destrabar UI post-login */
  finishInit() {
    this._initializing.set(false);
  }
}
