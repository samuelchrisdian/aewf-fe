// Auth Feature - Mock API & Functionality Overview

/**
 * AUTHENTICATION FLOW
 * 
 * 1. User visits app → redirects to /login if not authenticated
 * 2. User enters credentials
 * 3. Credentials validated against mock data
 * 4. On success:
 *    - JWT-like token generated and stored in localStorage
 *    - User data stored in localStorage
 *    - User redirected to dashboard
 * 5. Protected routes check authentication status
 * 6. User can logout from sidebar menu
 */

/**
 * MOCK API CREDENTIALS (api.ts)
 * 
 * Teacher Account:
 * - Email: teacher1@school.com
 * - Password: password123
 * 
 * Teacher Account 2:
 * - Email: teacher2@school.com
 * - Password: password123
 * 
 * Admin Account:
 * - Email: admin@school.com
 * - Password: admin123
 */

/**
 * AUTHENTICATION IMPLEMENTATION
 * 
 * Files Created:
 * - src/features/auth/LoginPage.tsx → Login UI with form validation
 * - src/features/auth/ProtectedRoute.tsx → Route guard component
 * - src/features/auth/context/AuthProvider.tsx → Auth state management with reducer
 * - src/features/auth/models/index.ts → TypeScript interfaces
 * - src/features/auth/hooks/useAuth.ts → Custom hook for auth context
 * - src/services/api.ts → Updated with auth APIs
 * 
 * Key Features:
 * ✓ Login with email/password validation
 * ✓ Token-based session management
 * ✓ Session persistence via localStorage
 * ✓ Protected routes that redirect to login
 * ✓ User profile display in sidebar
 * ✓ Logout functionality
 * ✓ Error handling and display
 * ✓ Loading states
 */

/**
 * TESTING AUTHENTICATION FLOW
 * 
 * 1. Start the app → should redirect to /login
 * 
 * 2. Login with teacher account:
 *    - Email: teacher1@school.com
 *    - Password: password123
 *    - Click Sign In
 *    - Should redirect to dashboard
 * 
 * 3. Verify user profile in sidebar:
 *    - Name should show "Teacher One"
 *    - Role should show "teacher"
 * 
 * 4. Test logout:
 *    - Click menu icon (⋮) in user profile
 *    - Click "Logout"
 *    - Should redirect to /login
 *    - localStorage should be cleared
 * 
 * 5. Test protected route:
 *    - After logout, try to access /alerts directly
 *    - Should redirect to /login
 * 
 * 6. Test session restoration:
 *    - Login again
 *    - Refresh page
 *    - Should remain logged in (session restored from localStorage)
 * 
 * 7. Test invalid credentials:
 *    - Enter wrong email/password
 *    - Should display error message
 */

/**
 * MOCK API ENDPOINTS (all in api.ts with MOCK_MODE = true)
 * 
 * POST /auth/login
 *   - Validates credentials against mockUsers
 *   - Returns token and user data
 *   - Stores in localStorage
 * 
 * POST /auth/logout
 *   - Clears localStorage
 *   - Resolves immediately
 * 
 * POST /auth/refresh
 *   - Refreshes token from localStorage
 *   - Used for session validation
 * 
 * GET /auth/me
 *   - Gets current user from localStorage
 *   - Used for session restoration
 */

/**
 * STATE MANAGEMENT
 * 
 * AuthContext provides:
 * - user: Current authenticated user
 * - token: Auth token (JWT-like)
 * - isLoading: Login/logout in progress
 * - error: Error message (if any)
 * - isAuthenticated: Boolean flag
 * - login(credentials): Async login function
 * - logout(): Async logout function
 * - clearError(): Clear error message
 */
