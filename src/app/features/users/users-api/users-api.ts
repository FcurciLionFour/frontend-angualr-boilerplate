import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_CONFIG, ApiConfig } from '../../../core/config/api.config';

export interface UserDto {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private config: ApiConfig
  ) { }

  findAll() {
    return this.http.get<UserDto[]>(
      `${this.config.baseUrl}/users`,
      { withCredentials: this.config.withCredentials }
    );
  }
  findById(id: string) {
    return this.http.get<UserDto>(
      `${this.config.baseUrl}/users/${id}`,
      { withCredentials: this.config.withCredentials }
    );
  }
  create(payload: {
    email: string;
    password: string;
    roles: string[];
  }) {
    return this.http.post<UserDto>(
      `${this.config.baseUrl}/users`,
      payload,
      { withCredentials: this.config.withCredentials }
    );
  }
  update(
    id: string,
    payload: {
      email?: string;
      isActive?: boolean;
      roles?: string[];
    }
  ) {
    return this.http.patch<UserDto>(
      `${this.config.baseUrl}/users/${id}`,
      payload,
      { withCredentials: this.config.withCredentials }
    );
  }



}
