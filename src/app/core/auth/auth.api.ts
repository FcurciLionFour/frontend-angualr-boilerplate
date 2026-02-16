import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_CONFIG, ApiConfig } from '../config/api.config';
import { AuthMeResponse, AuthTokensResponse } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly config: ApiConfig
  ) {}

  login(email: string, password: string) {
    return this.http.post<AuthTokensResponse>(
      `${this.config.baseUrl}/auth/login`,
      { email, password },
      { withCredentials: this.config.withCredentials }
    );
  }

  refresh() {
    return this.http.post<AuthTokensResponse>(
      `${this.config.baseUrl}/auth/refresh`,
      {},
      { withCredentials: this.config.withCredentials }
    );
  }

  logout() {
    return this.http.post<void>(
      `${this.config.baseUrl}/auth/logout`,
      {},
      { withCredentials: this.config.withCredentials }
    );
  }

  me() {
    return this.http.get<AuthMeResponse>(`${this.config.baseUrl}/auth/me`, {
      withCredentials: this.config.withCredentials,
    });
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(
      `${this.config.baseUrl}/auth/forgot-password`,
      { email },
      { withCredentials: this.config.withCredentials }
    );
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(
      `${this.config.baseUrl}/auth/reset-password`,
      { token, newPassword },
      { withCredentials: this.config.withCredentials }
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.http.post<{ message: string }>(
      `${this.config.baseUrl}/auth/change-password`,
      payload,
      { withCredentials: this.config.withCredentials }
    );
  }
}
