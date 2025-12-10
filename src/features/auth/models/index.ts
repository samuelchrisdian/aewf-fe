export interface User {
  id: number;
  email: string;
  name: string;
  role: 'teacher' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
