export type UserRole = 'Admin' | 'Teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
