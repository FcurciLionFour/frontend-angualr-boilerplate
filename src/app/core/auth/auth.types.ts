export interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface AuthMeResponse {
  user: User;
  roles: string[];
  permissions: string[];
}
