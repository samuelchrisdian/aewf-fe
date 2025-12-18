import React, { createContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthState, LoginRequest } from '../models';
import { useLogin as useLoginMutation, useLogout as useLogoutMutation, useCurrentUser } from '../api';

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return initialState;
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // React Query hooks
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const { data: currentUser } = useCurrentUser();

  // Restore session on mount from localStorage
  useEffect(() => {
    const restoreSession = () => {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          dispatch({
            type: 'RESTORE_SESSION',
            payload: { user, token }
          });
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
    };

    restoreSession();
  }, []); // Run once on mount

  // Update user from API if available
  useEffect(() => {
    if (currentUser && state.isAuthenticated) {
      dispatch({ type: 'SET_USER', payload: currentUser as User });
    }
  }, [currentUser, state.isAuthenticated]);

  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await loginMutation.mutateAsync({
        username: credentials.email, // Map email to username
        password: credentials.password
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user as User,
          token: response.access_token,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      throw err;
    }
  }, [loginMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync(undefined as any);
    } catch (err: unknown) {
      console.error('Logout error:', err);
    }

    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    dispatch({ type: 'LOGOUT' });
  }, [logoutMutation]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
