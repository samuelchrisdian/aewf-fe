src/
├── features/
│   ├── auth/                          # NEW: Complete authentication feature
│   │   ├── context/
│   │   │   └── AuthProvider.tsx       # Auth state management with reducer
│   │   ├── hooks/
│   │   │   ├── index.ts               # Re-exports
│   │   │   └── useAuth.ts             # Custom auth hook
│   │   ├── models/
│   │   │   └── index.ts               # TypeScript interfaces
│   │   ├── LoginPage.tsx              # Login UI component
│   │   ├── ProtectedRoute.tsx         # Route guard component
│   │   ├── index.ts                   # Feature barrel export
│   │   ├── AUTH_FEATURE.md            # Feature documentation
│   │   └── IMPLEMENTATION_SUMMARY.md  # Complete implementation guide
│   ├── alerts/
│   │   ├── AlertsPage.tsx
│   │   ├── StudentDetailPage.tsx
│   │   ├── context/
│   │   ├── models/
│   │   └── queries/
│   ├── overview/
│   │   ├── OverviewPage.tsx
│   │   ├── context/
│   │   ├── models/
│   │   └── queries/
├── components/
│   ├── Card.tsx
│   ├── DataTable.tsx
│   ├── HeatmapChart.tsx
│   └── Layout.tsx                     # MODIFIED: Added user profile + logout
├── services/
│   └── api.ts                         # MODIFIED: Added auth APIs + mock users
├── App.tsx                            # MODIFIED: Added AuthProvider + routes
├── App.css
├── index.css
└── main.tsx

/**
 * AUTHENTICATION ROUTES
 */

/login                   # Login page (public)
/                        # Dashboard (protected)
/alerts                  # Alerts page (protected)
/alerts/:nis            # Student detail (protected)

/**
 * MOCK API ENDPOINTS (all in services/api.ts)
 */

POST /auth/login         # Validates credentials, returns token + user
POST /auth/logout        # Clears session
POST /auth/refresh       # Refreshes token
GET /auth/me            # Gets current user

/**
 * STORAGE
 */

localStorage:
  - auth_token: JWT-like token
  - user: User object with id, email, name, role

/**
 * CONTEXT API
 */

AuthContext.Provider:
  - user: User | null
  - token: string | null
  - isLoading: boolean
  - error: string | null
  - isAuthenticated: boolean
  - login(credentials): Promise<void>
  - logout(): Promise<void>
  - clearError(): void
