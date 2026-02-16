export interface User {
  id: string;
  email: string;
}

export interface AuthTokensResponse {
  accessToken: string;
}

export interface AuthMeResponse {
  user: User;
  roles: string[];
  permissions: string[];
}
