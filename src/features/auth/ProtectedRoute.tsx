import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();

  // Check if token exists in localStorage (session restore in progress)
  const hasToken = !!localStorage.getItem('access_token');

  // Show loading while:
  // 1. Auth is loading, OR
  // 2. Token exists but not yet authenticated (session restoring)
  if (isLoading || (hasToken && !isAuthenticated)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
