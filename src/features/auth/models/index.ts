export interface User {
  id: number;
  email: string;
  name: string;
  role: 'teacher' | 'admin';
  username?: string;
}

export interface LoginRequest {
  email: string; // Will be mapped to username in AuthProvider
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
