import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_CONFIG, ApiConfig } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class CsrfApi {
  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private config: ApiConfig
  ) {}

  init() {
    return this.http.get(
      `${this.config.baseUrl}/auth/csrf`,
      { withCredentials: true }
    );
  }
}
